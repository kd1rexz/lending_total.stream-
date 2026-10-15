# Контракт реализации 1

Все пути от корня репозитория. Изменения согласует оркестратор. Типы находятся в src/types/content.ts.

## Общие компоненты

- Container.astro: `as?: 'div' | 'section' | 'header' | 'footer' | 'nav'`, `class?: string`, `id?: string`, default slot. Контейнер max-width 1280px + поля.
- ButtonLink.astro: `href: string`, `variant?: 'primary' | 'secondary' | 'text'`, `class?: string`, `arrow?: boolean` (по умолчанию true), default slot. Всегда ссылка.
- SectionHeading.astro: `number?: string`, `eyebrow?: string`, `title: string`, `description?: string`, `id?: string`, `align?: 'left' | 'center'`. Один h2.
- Logo.astro: `class?: string`, `compact?: boolean`, `dark?: boolean`; SVG + wordmark, без своей ссылки.
- Star.astro: `class?: string`, `color?: 'lime' | 'violet'`, `size?: number`; декоративный SVG. Общий модуль `src/scripts/scroll-stars.ts` плавно вращает звёзды по вертикальной прокрутке, сохраняя исходные трансформации секций. Без JavaScript и при reduced motion звёзды статичны.

## Props секций

- SiteHeader: `navigation: NavItem[]`. Закрытая шапка 64/72 px (порог 1024 px), высота хранится в `--header-height`. Локальные стили уменьшают знак до 40 px и надпись до 14 px, футер прежний.
- Hero: `poster?: ImageMetadata`. Сам владеет id="top". По правкам пользователя от 15 октября верхняя строка и бейдж preview удалены. В Hero нет разделителя. Минимальная высота основной части — max(30rem, 100svh − высота шапки), без верхнего ограничения: следующий блок не появляется на первом экране. Увеличенный текст свободно растягивает блок.
- Contacts: `contacts: Contact[]`, `isPreview: boolean`. id="contacts".
- SiteFooter: `contacts: Contact[]`.
- Services: `items: ServiceWithExamples[]`. id="services". `ServiceWithExamples` дополняет услугу массивом `examples: CaseStudy[]`, уже отфильтрованным слоем данных.
- Cases: `items: CaseStudy[]`, `isPreview: boolean`. id="cases". Preview без данных сохраняет якорь и нейтральное пустое состояние.
- Team: `profile: TeamProfile` с `name`, `role`, `description`, `portrait: ImageMetadata`. id="team". Показывает Юрия Минеева, CEO команды Total Stream, с предоставленным портретом и текстом. Профиль собирает слой content; карточки ролей удалены по последующей правке пользователя.
- Reliability: `items: EditorialItem[]`.
- FAQ: `items: FAQItem[]`.
- Trust: `items: TrustItem[]`. Блок «Нам доверяют», id="clients", следует после Cases. Сетка локальных логотипов: 4 колонки от 768 px, 2 ниже. TrustItem содержит name, logo: ImageMetadata, displayWidth и previewOnly; слой content разрешает файл из src/assets/clients и исключает previewOnly в production. PIMS, Apple и Google указаны пользователем; Nike, Samsung, Sony, NVIDIA, Spotify добавлены по его подтверждённому поручению как примеры для макета. Для demo-брендов видна подпись. Изображения ленивые, с alt; текстовые имитации логотипов не используются. Пустой блок скрыт.
- Reviews: `items: Review[]`; пустой блок скрыт.

## Данные и сборка

Модуль src/lib/content.ts экспортирует `async getPageContent(): Promise<PageContent>`. Он читает данные и Astro Content Collections, фильтрует опубликованное в production и разрешает явно обозначенные черновики в preview. SiteSettings хранится в src/data/site.json, общий источник для UI и CLI-валидатора. Контакты только массив, первоначально пустой.

Services/cases — JSON collections через file/glob loader; допускается файл cases.json с пустым массивом, чтобы не создавать фиктивные кейсы. CaseStudy.cover преобразуется в ImageMetadata коллекцией или слоем content. Изображения встроенного PDF допустимы только как визуальный референс preview с документированным источником, не как реальные клиентские проекты.

CaseStudy.serviceIds — массив идентификаторов услуг (по умолчанию пустой). Неизвестные и повторные идентификаторы отклоняются валидатором. После фильтрации по режиму сборки getPageContent связывает видимые кейсы с услугами. Production требует хотя бы один опубликованный пример для каждой опубликованной услуги; preview допускает пустые окна.

ServiceExamples.astro: `service: ServiceWithExamples`. Кнопка «Смотреть примеры» открывает нативный dialog на текущей странице; отдельного маршрута нет. Закрытие: крестик, Escape или начало и окончание клика снаружи; фокус возвращается кнопке, прокрутка фона блокируется. Подробности содержат обложку, задачу, работу и результат; запись — проверенная ссылка в новой вкладке, без embed. Без JavaScript то же содержимое доступно через нативный details. Реальные материалы не заменяются фиктивными примерами.

src/lib/build-context.mjs принадлежит оркестратору: `resolveBuildContext(env?) → { context, isPreview, siteUrl }`. Без BUILD_CONTEXT — preview, неизвестное значение ошибка; SITE_URL при наличии HTTPS-origin. Production без него отклоняется. Валидатор `scripts/validate-release.mjs` передаётся T03 после T01 и расширяет проверки данных. Не копировать эту логику в UI.

Astro output static, build.format file. Основные команды: pnpm dev (4321), dev:components (4322), check, build, build:components, test:validation, test:e2e, format:check. Установку зависимостей, изменение scripts и сборку общего dist запускает root.

## Визуальное направление

Кинематографичный тёмный Hero с крупным Unbounded, лаймовым CTA и спокойным монохромным постером из айдентики. Вёрстка выразительная и свободная, с тонкой сеткой и звёздами. Декоративные разделители удалены. Секции чередуют тёмные поверхности и крупную типографику; не превращать все блоки в одинаковые карточки. Текст на фиолетовом и тёмном фоне проверяется на контраст. Никаких вымышленных метрик и утверждений о клиентах. Исключение для локального макета: явно подписанные демонстрационные логотипы по запросу пользователя, исключённые из production.

Соблюдать существующее ТЗ по ширинам и доступности. Актуальные значения палитры после правки пользователя 15 октября: фон #141517, surface #202124, текст #F5F5F1, лайм #A4FF82, фиолетовый #4C0EF8 из присланного логотипа; светлый фиолетовый для текста #B69AFF. Лайм сохранён по уточнению пользователя. Контраст проверен в T19. Unbounded доступен через @fontsource-variable/unbounded, нужно импортировать только latin/cyrillic; Corsa заменяется системным sans до предоставления лицензии. По указанию пользователя бейдж «Рабочий макет» убран. Статус черновиков остаётся в реестре контента; noindex и ограничения production сохраняются.

## Правила исполнения

Секции не меняют index/layout/config/tokens. Root подключает их к отдельному стенду и к главной. Отчёты TXX в docs/reports. Вызовы проверок, меняющие общий dist, согласуются с root. Тестовые контакты находятся только в изолированном стенде/tests; основной сайт их не получает.
