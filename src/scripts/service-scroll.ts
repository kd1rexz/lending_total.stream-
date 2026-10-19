document.querySelectorAll<HTMLElement>('[data-scroll-services]').forEach((root) => {
  const stage = root.querySelector<HTMLElement>('[data-scroll-stage]');
  const labels = [...root.querySelectorAll<HTMLElement>('[data-scroll-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-scroll-panel]')];
  if (!stage || !labels.length || labels.length !== panels.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let desired = 0;
  let revision = 0;
  let busy = false;
  let scheduled = false;
  let effect: Animation | undefined;
  const mark = () =>
    labels.forEach((label, i) => label.toggleAttribute('data-active', i === current));
  const transition = async () => {
    if (busy || desired === current || !root.classList.contains('is-pinned')) return;
    busy = true;
    const token = revision;
    const old = panels[current];
    effect = old.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 400,
      easing: 'ease-in',
      fill: 'forwards',
    });
    try {
      await effect.finished;
    } catch {
      return;
    }
    if (token !== revision) return;
    effect.cancel();
    current = desired;
    panels.forEach((panel, i) => (panel.hidden = i !== current));
    mark();
    effect = panels[current].animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
    try {
      await effect.finished;
    } catch {
      return;
    }
    if (token !== revision) return;
    effect = undefined;
    busy = false;
    void transition();
  };
  const onScroll = () => {
    if (scheduled || !root.classList.contains('is-pinned')) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const travel = root.offsetHeight - stage.offsetHeight;
      if (travel <= 0) return;
      const progress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / travel));
      desired = Math.min(panels.length - 1, Math.floor(progress * panels.length));
      void transition();
    });
  };
  const configure = () => {
    revision++;
    effect?.cancel();
    effect = undefined;
    busy = false;
    root.classList.remove('is-pinned');
    let maxHeight = 0;
    panels.forEach((_, index) => {
      panels.forEach((panel, i) => (panel.hidden = i !== index));
      maxHeight = Math.max(maxHeight, stage.scrollHeight);
    });
    if (!reduced.matches && maxHeight <= innerHeight - 8) {
      root.style.setProperty('--scroll-height', `${innerHeight * (1 + panels.length * 2)}px`);
      root.classList.add('is-pinned');
      panels.forEach((panel, i) => (panel.hidden = i !== current));
      mark();
      onScroll();
    } else {
      panels.forEach((panel) => (panel.hidden = false));
      labels.forEach((label) => label.removeAttribute('data-active'));
    }
    root.dataset.enhanced = '';
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', configure);
  reduced.addEventListener('change', configure);
  void document.fonts.ready.then(configure);
});
