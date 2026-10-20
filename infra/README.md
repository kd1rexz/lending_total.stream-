# Инструменты поставки Total Stream

T06 готовит инструменты. VPS, DNS и сертификаты этими изменениями не настроены; публикация не выполнялась. Общая архитектура и эксплуатация — в [deployment.md](../docs/deployment.md). Реальный запуск процедур относится к T11/T12.

## Состав и окружение

| Файл                             | Назначение                                                      |
| -------------------------------- | --------------------------------------------------------------- |
| `nginx/*.template`               | HTTP/ACME bootstrap и HTTPS, подключаемые в контексте `http {}` |
| `scripts/deploy/render-nginx.py` | Генерация конфигурации в stdout; не устанавливает её            |
| `scripts/deploy/artifact.py`     | Копия проверенного dist и SHA256-манифест вне веб-корня         |
| `scripts/deploy/release.sh`      | Linux flock и действия init/deploy/rollback/deactivate          |
| `scripts/deploy/release.py`      | Реализация действий; запускать через release.sh                 |
| `scripts/deploy/smoke.py`        | Проверка фактического HTTPS, файлов, кешей, редиректов и 404    |
| `scripts/deploy/test_tools.py`   | Локальные unit-проверки генератора, артефакта и shared-файлов   |

Нужны Python 3.10+ (только стандартная библиотека), Bash, а на VPS — Linux, `flock` из util-linux и Nginx. Для копирования с рабочей машины — SSH/rsync. Node и pnpm работают на машине сборки, на VPS они не нужны. Целевой каталог располагается на локальной файловой системе VPS. Параллельные действия выпуска используют один `.deploy.lock`.

Скрипты рассчитаны на отдельного доверенного пользователя публикации. Каталоги и артефакты не должны одновременно менять посторонние процессы. Они не являются песочницей для произвольных сторонних пакетов. `release.sh` намеренно останавливается на macOS; не подменять `uname`/`flock` для имитации серверной проверки.

## Переменные, которые заполняются при настройке

Все примеры ниже выполняются Bash с `set -euo pipefail`. Значения задаются оператором; вымышленные адреса не встроены в конфигурацию.

| Переменная               | Содержание                                                                  |
| ------------------------ | --------------------------------------------------------------------------- |
| `TS_DOMAIN`              | Реальное каноническое имя без схемы и пути                                  |
| `TS_ROOT`                | `/var/www/total-stream` или отдельный `/var/www/total-stream-staging`       |
| `TS_SITE_URL`            | `https://` и соответствующий `TS_DOMAIN`                                    |
| `TS_ENVIRONMENT`         | `production` или `staging` для Nginx/HTTP smoke                             |
| `BUILD_CONTEXT`          | `production` или `preview` для сборки/артефакта; staging использует preview |
| `TS_CERT`, `TS_CERT_KEY` | Абсолютные пути существующих fullchain.pem и privkey.pem                    |
| `TS_AUTH_FILE`           | Для staging: абсолютный путь htpasswd вне веб-корня                         |
| `TS_RELEASE_ID`          | Время UTC + короткий SHA, например формат `YYYYMMDDTHHMMSSZ-abcdef1`        |
| `TS_MANIFEST_SHA256`     | SHA256 manifest.json, записанный на доверенной машине сборки                |

Генератор отклоняет пустые/шаблонные домены, пустые TLS-пути, небезопасные символы и staging без auth-file. Он проверяет синтаксическую допустимость значений; существование сертификата, SAN, права и конфигурацию Nginx проверяет T11. При использовании `www` добавить `--alias "$TS_ALIAS_DOMAIN"` и включить это имя в сертификат. Staging не должен быть alias production.

## Nginx: сначала ACME, затем HTTPS

1. Администратор создаёт пользователя публикации, отдельные каталоги production/staging и `/var/www/acme/.well-known/acme-challenge`. Файлы сайта читаются Nginx; секреты и htpasswd находятся вне этих каталогов. Не использовать 777. Подготовку SSH/сети выполнять по deployment.md.
2. До получения сертификата сформировать bootstrap-конфигурацию. Все подстановки проверяются до записи stdout:

```bash
set -euo pipefail
: "${TS_DOMAIN:?}" "${TS_ENVIRONMENT:?}" "${TS_CONFIG_FILE:?}"
python3 scripts/deploy/render-nginx.py \
  --phase bootstrap --environment "$TS_ENVIRONMENT" \
  --domain "$TS_DOMAIN" > "$TS_CONFIG_FILE"
```

3. После проверки результата сохранить резервную копию существующей конфигурации, установить файл в `sites-available`, включить его через `sites-enabled`, выполнить `sudo nginx -t` и только после успеха `sudo systemctl reload nginx`. В штатном Ubuntu `sites-enabled` включается внутри `http {}`. Проверить фактический nginx.conf; не подключать шаблоны внутрь другого server block. На этапе bootstrap все запросы, кроме ACME, перенаправляются на ещё не включённый HTTPS.
4. Получить сертификат через выбранный ACME-клиент. Для Certbot используется webroot `/var/www/acme`; все указанные домены уже должны разрешаться на VPS. Не включать HTTPS-конфигурацию с отсутствующими файлами сертификата.
5. Для staging создать htpasswd интерактивно (`htpasswd` без пароля в CLI), ограничить права владельцем и группой Nginx. Установить `TS_AUTH_FILE`; для production переменная не требуется.
6. Сформировать полную конфигурацию, заменяющую bootstrap:

```bash
set -euo pipefail
: "${TS_DOMAIN:?}" "${TS_ROOT:?}" "${TS_CERT:?}" "${TS_CERT_KEY:?}"
: "${TS_ENVIRONMENT:?}" "${TS_CONFIG_FILE:?}"
python3 scripts/deploy/render-nginx.py \
  --phase https --environment "$TS_ENVIRONMENT" \
  --domain "$TS_DOMAIN" --root "$TS_ROOT" \
  --cert "$TS_CERT" --cert-key "$TS_CERT_KEY" \
  --auth-file "${TS_AUTH_FILE:-}" > "$TS_CONFIG_FILE"
```

Повторить установку, `nginx -t`, reload и HTTP smoke. Редиректы сохраняют путь и query. `/_astro/` читается из shared; неизвестный путь возвращает настоящую 404 с `404.html`. Кеш ошибок — no-store. Карта кеша разрешает immutable только успешным/304 ответам хешированных ресурсов. В каждом location с собственными заголовками повторены nosniff и staging noindex, чтобы не потерять их при наследовании `add_header`.

Оба шаблона слушают IPv4 и IPv6; сетевую доступность и AAAA проверять отдельно. Включены TLS 1.2/1.3, gzip и MIME из системного `mime.types`. Корректность MIME AVIF/WOFF2/JS проверяет smoke; на старых пакетах потребуется обновление/исправление системной таблицы. HSTS до проверки доменов/HTTPS не включён. Во всех генерируемых server-блоках (HTTP/ACME, HTTPS, алиасы, staging) явно заданы `access_log off;` и `error_log /dev/null crit;`: запросы и IP не сохраняются в проектные журналы, включая сообщения об ошибках. Удалён прежний `log_format` с `$remote_addr`. Это отключает диагностику отдельных запросов по логам. При установке проверить итоговый `nginx -T`, `nginx -t`, наследование/include, default_server/TLS и внешние proxy/CDN/журналы хостинга. Глобальные ошибки до выбора хоста и сторонние журналы не контролируются этими шаблонами; ранее созданные файлы и резервные копии не удаляются. Проверки доступности и HTTP smoke сохраняются.

Проверить автоматическое продление: для Certbot — `sudo certbot renew --dry-run`. Deploy-hook ACME-клиента должен выполнять `nginx -t` и reload после успешного обновления. Обычная смена `current` reload не требует.

## Сборка и артефакт

Сборка выполняется из чистого checkout конкретного полного SHA с зафиксированным lockfile. Сам инструмент упаковки не доказывает происхождение исходников и не проверяет правдивость контента; это обязанности T10 и CI. Preview для staging собирается с реальным staging origin, production — с каноническим production origin. Упаковывается тот же dist, на котором завершились проверки, без последующей пересборки.

Независимая от провайдера CI последовательность:

1. Checkout указанного SHA; установить версии Node из `.node-version` и pnpm из `packageManager`.
2. `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm check`, `pnpm test:validation`.
3. Экспортировать явные `BUILD_CONTEXT` и `SITE_URL`; выполнить `pnpm build`, затем `pnpm test:e2e` с теми же переменными. Сохранить отчёты. Если E2E пересобирает dist, убедиться, что контекст и SHA прежние.
4. Проверить чистоту входных файлов после сборки; создать артефакт. Сохранить SHA, версии инструментов, контекст, URL, манифест и checksum архива.
5. Публикацию выполнять отдельным разрешённым шагом. CI-секрет SSH не попадает в HTML, артефакт или журнал. На VPS пользователь публикации не требует sudo для переключения релизов.

```bash
set -euo pipefail
: "${BUILD_CONTEXT:?}" "${TS_SITE_URL:?}" "${TS_ARTIFACT_DIR:?}"
test -z "$(git status --porcelain --untracked-files=normal)"
TS_SOURCE_SHA="$(git rev-parse HEAD)"
python3 scripts/deploy/artifact.py dist "$TS_ARTIFACT_DIR" \
  --context "$BUILD_CONTEXT" --site-url "$TS_SITE_URL" \
  --commit "$TS_SOURCE_SHA" \
  --node-version "$(node --version)" --pnpm-version "$(pnpm --version)"
```

`TS_ARTIFACT_DIR` — новый каталог вне dist, например внутри игнорируемого `output/`. Сохранить напечатанный Manifest SHA256 в записи релиза и передать его отдельным параметром; deploy проверяет именно это значение, не доверяет одному только переданному рядом JSON. Манифест содержит полный SHA и SHA256 каждого публичного файла. В dist допускаются только согласованные статические типы, `index.html` и `404.html`; скрытые файлы, симлинки, исходники, стенд и незахешированные `_astro` отклоняются. Проверяются локальные HTML/CSS ссылки, SEO режима и целостность копии.

Для архива и внешней резервной копии (на Linux/CI):

```bash
set -euo pipefail
: "${TS_ARTIFACT_DIR:?}" "${TS_ARCHIVE:?}"
tar -C "$TS_ARTIFACT_DIR" -czf "$TS_ARCHIVE" dist manifest.json
sha256sum "$TS_ARCHIVE" > "$TS_ARCHIVE.sha256"
```

`TS_ARCHIVE` — абсолютный путь вне dist и каталога артефакта. На macOS контрольную сумму архива можно получить `shasum -a 256`. Для публикации передавать проверенный каталог артефакта по SSH/rsync в новый приватный upload-каталог вне веб-корня. Не применять `rsync --delete`. Автоматическое распаковывание непроверенных архивов в инструментах не предусмотрено.

## Инициализация, выпуск, откат

На Linux, после создания `TS_ROOT` и назначения владельца, из checkout инструментов выполнить:

```bash
set -euo pipefail
: "${TS_ROOT:?}" "${BUILD_CONTEXT:?}" "${TS_SITE_URL:?}"
bash scripts/deploy/release.sh init "$TS_ROOT" "$BUILD_CONTEXT" "$TS_SITE_URL"
```

Создаются releases, metadata, shared/_astro и `.environment.json`. Контекст и URL закрепляются за каталогом; повторная init с другими параметрами останавливается. Структура каталога должна быть обычной, без симлинков в служебных путях. Запуск не активирует сайт.

После загрузки артефакта в `TS_UPLOAD_DIR`:

```bash
set -euo pipefail
: "${TS_ROOT:?}" "${TS_UPLOAD_DIR:?}" "${TS_RELEASE_ID:?}" "${TS_MANIFEST_SHA256:?}"
bash scripts/deploy/release.sh deploy \
  "$TS_ROOT" "$TS_UPLOAD_DIR" "$TS_RELEASE_ID" "$TS_MANIFEST_SHA256"
```

Скрипт удерживает flock, сверяет окружение, манифест и байты, копирует dist в отдельный `.incoming-<id>`, снова проверяет копию, добавляет shared-ресурсы и переименовывает релиз. При совпадении URL ресурса с другими байтами выпуск останавливается. Новые shared-файлы появляются атомарно; старые не удаляются. `current` заменяется через атомарный `os.replace` временной ссылки на той же файловой системе. Метаданные и history.jsonl лежат вне web root.

Сохранить напечатанный Previous. Сообщение `activated-awaiting-http-smoke` означает только переключение файлов; оно не подтверждает работающий HTTPS. Сразу выполнить smoke ниже. При отказе smoke вернуть именно предыдущий записанный релиз:

```bash
set -euo pipefail
: "${TS_ROOT:?}" "${TS_PREVIOUS_RELEASE_ID:?}"
bash scripts/deploy/release.sh rollback "$TS_ROOT" "$TS_PREVIOUS_RELEASE_ID"
```

Rollback заново проверяет сохранённый релиз/окружение и shared-файлы, переключает current под тем же lock. После него повторить smoke с манифестом восстановленного релиза. При неудачном первом выпуске, когда Previous отсутствует, снять только ссылку:

```bash
set -euo pipefail
: "${TS_ROOT:?}" "${TS_RELEASE_ID:?}"
bash scripts/deploy/release.sh deactivate "$TS_ROOT" "$TS_RELEASE_ID"
```

Deactivation явно проверяет активный ID; файлы не удаляет. После снятия ссылки Nginx уже не имеет страницы 404 из релиза: проверить фактическую ошибку, при необходимости установить согласованную maintenance-конфигурацию. Это снятие первого выпуска, а не откат на несуществующую версию.

При ошибке копирования частичный `.incoming-<id>` остаётся для осмотра, current не переключается. Не повторять выпуск с тем же ID вслепую. Скрипты не очищают произвольные пути, не удаляют релизы/shared и не выполняют Nginx reload. Плановую очистку выполнять отдельно: минимум пять релизов; shared минимум 30 дней и все файлы, используемые сохранёнными релизами. Наблюдать свободное место.

## HTTP smoke и серверная приёмка

```bash
set -euo pipefail
: "${TS_SITE_URL:?}" "${TS_ENVIRONMENT:?}" "${TS_MANIFEST_FILE:?}"
python3 scripts/deploy/smoke.py \
  --url "$TS_SITE_URL" --environment "$TS_ENVIRONMENT" \
  --manifest "$TS_MANIFEST_FILE"
```

Для второго релиза и отката добавить `--previous-manifest "$TS_PREVIOUS_MANIFEST_FILE"`; для альтернативного домена — `--alias "$TS_ALIAS_URL"`. Манифесты берутся из доверенного артефакта или server metadata, не скачиваются с сайта. Smoke проверяет TLS штатным trust store без `--insecure`, root 200 и байты, каждый опубликованный ресурс, MIME, Cache-Control, настоящие 404, HTTP→HTTPS и сохранение query, а также старые `_astro`.

На staging передать `TS_SMOKE_USER` и `TS_SMOKE_PASSWORD` через секреты CI или интерактивный ввод Bash. Пароль не передаётся аргументом процесса, не помещается в URL/репозиторий/журнал. Не включать shell tracing:

```bash
read -r -p 'Staging user: ' TS_SMOKE_USER
read -r -s -p 'Staging password: ' TS_SMOKE_PASSWORD
export TS_SMOKE_USER TS_SMOKE_PASSWORD
```

После smoke выполнить `unset TS_SMOKE_USER TS_SMOKE_PASSWORD`. Проверяется 401 без авторизации для главной и ресурса, а с авторизацией — noindex у всех проверенных ответов. Защита ACME-исключения и работа продления проверяются отдельно.

В T11 на настоящем Linux/Nginx выполнить два релиза одного окружения с различающимися хешами ресурсов → smoke второго с манифестом первого → rollback на первый → smoke первого с манифестом второго. Дополнительно проверить конфликт двух одновременных операций (вторая получает отказ flock), коллизию shared URL, неудачный первый выпуск и восстановление конфигурации. Использовать изолированный staging, не production. Сохранить версии ОС/Nginx, команды, release IDs, логи и результаты в T11.

## Локальные проверки и пределы

```bash
PYTHONDONTWRITEBYTECODE=1 python3 scripts/deploy/test_nginx.py
PYTHONDONTWRITEBYTECODE=1 python3 scripts/deploy/test_tools.py
bash -n scripts/deploy/release.sh
```

Эти проверки не доказывают HTTP-поведение и не заменяют `nginx -t`. test_nginx.py проверяет генератор на Windows и Linux; test_tools.py требует Unix-модуль fcntl. Полноценная репетиция с Nginx выполняется на Linux в T11. В проверке T105 на Windows Docker Engine недоступен, поэтому nginx -t не выполнялся. Никакие адреса, доступы и данные VPS сейчас не нужны для локального preview.

Основания для конфигурации: [Nginx try_files и error_page](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files), [наследование add_header](https://nginx.org/en/docs/http/ngx_http_headers_module.html), [Basic Auth](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html). Проверены 13 октября 2026 года.
