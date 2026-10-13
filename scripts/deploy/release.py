#!/usr/bin/env python3
"""Private implementation. Run release.sh to hold flock during all mutations."""
from datetime import datetime, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import sys
import uuid
from artifact import check_dist, digest, site_url, verify


def root_path(value):
    root = Path(value)
    if not root.is_absolute() or len(root.parts) < 4 or root.resolve() != root or not root.is_dir():
        raise ValueError("SITE_ROOT must be an existing, canonical absolute directory (e.g. /var/www/total-stream)")
    for name in (".deploy.lock", ".environment.json", "releases", "metadata", "shared", "shared/_astro", "history.jsonl"):
        if (root / name).is_symlink():
            raise ValueError(f"Symlink rejected: {name}")
    return root


def release_id(value):
    if not re.fullmatch(r"[0-9]{8}T[0-9]{6}Z-[a-f0-9]{7,40}", value):
        raise ValueError("Release ID must be UTC timestamp-shortSHA (YYYYMMDDTHHMMSSZ-abcdef1)")
    return value


def identity(context, url):
    if context not in ("preview", "production"):
        raise ValueError("context must be preview or production")
    return {"context": context, "siteUrl": site_url(url)}


def environment(root):
    data = json.loads((root / ".environment.json").read_text())
    if identity(data["context"], data["siteUrl"]) != data:
        raise ValueError("Invalid target environment")
    return data


def current_id(root):
    current = root / "current"
    if not current.is_symlink():
        if current.exists():
            raise ValueError("current exists but is not a symlink")
        return None
    target = current.resolve(strict=True)
    if target.parent != root / "releases" or not target.is_dir():
        raise ValueError("current does not point to a local release")
    return release_id(target.name)


def audit(root, event, old, new):
    record = {"time": datetime.now(timezone.utc).isoformat(), "event": event, "previous": old, "release": new}
    with (root / "history.jsonl").open("a") as file:
        file.write(json.dumps(record) + "\n")
        file.flush()
        os.fsync(file.fileno())


def switch(root, target):
    old = current_id(root)
    audit(root, "switch-intent", old, target)
    temporary = root / (".current-" + uuid.uuid4().hex)
    # Only our newly-created temporary link may be removed; never delete releases.
    try:
        temporary.symlink_to("releases/" + target)
        os.replace(temporary, root / "current")
    finally:
        if temporary.is_symlink():
            temporary.unlink()
    audit(root, "activated-awaiting-http-smoke", old, target)
    print(f"Active: {target}\nPrevious: {old or '(first release)'}\nHTTP smoke is still required; see infra/README.md.")


def add_assets(root, dist, manifest):
    # Detect every collision before adding files or switching the HTML release.
    for name, expected in manifest["files"].items():
        if name.startswith("_astro/"):
            target = root / "shared" / name
            for parent in [target, *target.parents]:
                if parent == root:
                    break
                if parent.is_symlink():
                    raise ValueError(f"Shared symlink rejected: {name}")
            if target.exists() and (not target.is_file() or digest(target) != expected):
                raise ValueError(f"Immutable asset collision: {name}")
    for name in manifest["files"]:
        if not name.startswith("_astro/"):
            continue
        target = root / "shared" / name
        if target.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
        temporary = target.parent / (".asset-" + uuid.uuid4().hex)
        try:
            with (dist / name).open("rb") as source, temporary.open("xb") as output:
                shutil.copyfileobj(source, output)
                output.flush()
                os.fsync(output.fileno())
            temporary.chmod(0o644)
            # link() publishes complete bytes without replacing an existing URL.
            os.link(temporary, target)
        finally:
            if temporary.is_file():
                temporary.unlink()


def checked_release(root, rid, target_env):
    release = root / "releases" / release_id(rid)
    metadata = root / "metadata" / (rid + ".json")
    if metadata.is_symlink():
        raise ValueError("Release metadata is a symlink")
    manifest = json.loads(metadata.read_text())
    if any(manifest.get(key) != value for key, value in target_env.items()):
        raise ValueError("Release does not match the target environment")
    if check_dist(release, target_env["context"], target_env["siteUrl"]) != manifest["files"]:
        raise ValueError("Stored release checksum mismatch")
    return release, manifest


def main():
    if sys.platform != "linux":
        raise ValueError("Release mutations require Linux and release.sh flock")
    if len(sys.argv) < 3:
        raise ValueError("Use release.sh; see infra/README.md")
    action, root_arg, *args = sys.argv[1:]
    root = root_path(root_arg)
    if action == "check-root":
        return
    # release.sh inherits FD 9. The helper deliberately refuses direct invocation.
    lock = os.fstat(9)
    lock_file = (root / ".deploy.lock").stat()
    if (lock.st_dev, lock.st_ino) != (lock_file.st_dev, lock_file.st_ino):
        raise ValueError("Run release.sh to hold the deployment lock")
    fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
    os.umask(0o022)
    if action == "init" and len(args) == 2:
        target_env = identity(*args)
        config = root / ".environment.json"
        if config.exists():
            if environment(root) != target_env:
                raise ValueError("Target already belongs to another environment")
        else:
            with config.open("x") as file:
                json.dump(target_env, file)
                file.write("\n")
        for name in ("releases", "metadata", "shared/_astro"):
            (root / name).mkdir(parents=True, exist_ok=True, mode=0o755)
        print("Target initialized. No release activated.")
        return
    target_env = environment(root)
    current_id(root)  # Fail before touching files if current is foreign/broken.
    if action == "deploy" and len(args) == 3:
        artifact, rid, expected_digest = Path(args[0]), release_id(args[1]), args[2]
        manifest = verify(artifact, target_env["context"], target_env["siteUrl"], expected_digest)
        if not manifest["commit"].startswith(rid.split("-")[1]):
            raise ValueError("Release ID SHA does not match artifact commit")
        release = root / "releases" / rid
        metadata = root / "metadata" / (rid + ".json")
        stage = root / "releases" / (".incoming-" + rid)
        if release.exists() or release.is_symlink() or metadata.exists() or stage.exists() or stage.is_symlink():
            raise ValueError("Release ID or incomplete upload already exists; inspect it, do not overwrite")
        shutil.copytree(artifact / "dist", stage, symlinks=True)
        if check_dist(stage, target_env["context"], target_env["siteUrl"]) != manifest["files"]:
            raise ValueError("Artifact changed during copy; current is untouched")
        for file in stage.rglob("*"):
            file.chmod(0o755 if file.is_dir() else 0o644)
        stage.chmod(0o755)
        add_assets(root, stage, manifest)
        stage.rename(release)
        with metadata.open("x") as file:
            json.dump(manifest, file, sort_keys=True, indent=2)
            file.write("\n")
        switch(root, rid)
    elif action == "rollback" and len(args) == 1:
        rid = release_id(args[0])
        release, manifest = checked_release(root, rid, target_env)
        add_assets(root, release, manifest)
        switch(root, rid)
    elif action == "deactivate" and len(args) == 1:
        rid = release_id(args[0])
        if current_id(root) != rid:
            raise ValueError("Active release differs from the explicit failed release ID")
        audit(root, "deactivate-intent", rid, None)
        (root / "current").unlink()  # Only removes the checked pointer; files remain.
        audit(root, "deactivated", rid, None)
        print("Site pointer removed. Artifacts retained. Check the resulting 404/maintenance response.")
    else:
        raise ValueError("Invalid action/arguments; see infra/README.md")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
