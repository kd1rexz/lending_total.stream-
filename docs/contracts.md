# Контракт реализации 1

Все пути от корня репозитория. Изменения согласует оркестратор. Типы находятся в src/types/content.ts.

## Общие компоненты

- Container.astro: `as?: 'div' | 'section' | 'header' | 'footer' | 'nav'`, `class?: string`, `id?: string`, default slot. Контейнер max-width 1280px + поля.
- ButtonLink.astro: `href: string`, `variant?: 'primary' | 'secondary' | 'text'`, `class?: string`, `arrow?: boolean` (по умолчанию true), default slot. Всегда ссылка.
- SectionHeading.astro: `number?: string`, `eyebrow?: string`, `title: string`, `description?: string`, `id?: string`, `align?: 'left' | 'center'`. Один h2.
- Logo.astro: `class?: string`, `compact?: boolean`, `dark?: boolean`; SVG + wordmark, без своей ссылки.
- Star.astro: `class?: string`, `color?: 'lime' | 'violet'`, `size?: number`; декоративный SVG.
- CheckerPattern.astro: `class?: string`; декоративный паттерн.

## Props секций

- SiteHeader: `navigation: NavItem[]`.
- Hero: `isPreview: boolean`, `poster?: ImageMetadata`. Сам владеет id="top".
- Contacts: `contacts: Contact[]`, `isPreview: boolean`. id="contacts".
- SiteFooter: `contacts: Contact[]`.
- Services: `items: Service[]`. id="services".
- Cases: `items: CaseStudy[]`, `isPreview: boolean`. id="cases". Preview без данных сохраняет якорь и нейтральное пустое состояние.
- Process: `items: ProcessStep[]`. id="process".
- Reliability: `items: ProcessStep[]`.
- FAQ: `items: FAQItem[]`.
- Trust: `items: TrustItem[]`; Reviews: `items: Review[]`. Пустые полностью скрыты.

## Данные и сборка

Модуль src/lib/content.ts экспортирует `async getPageContent(): Promise<PageContent>`. Он читает данные и Astro Content Collections, фильтрует опубликованное в production и разрешает явно обозначенные черновики в preview. SiteSettings хранится в src/data/site.json, общий источник для UI и CLI-валидатора. Контакты только массив, первоначально пустой.

Services/cases — JSON collections через file/glob loader; допускается файл cases.json с пустым массивом, чтобы не создавать фиктивные кейсы. CaseStudy.cover преобразуется в ImageMetadata коллекцией или слоем content. Изображения встроенного PDF допустимы только как визуальный референс preview с документированным источником, не как реальные клиентские проекты.

src/lib/build-context.mjs принадлежит оркестратору: `resolveBuildContext(env?) → { context, isPreview, siteUrl }`. Без BUILD_CONTEXT — preview, неизвестное значение ошибка; SITE_URL при наличии HTTPS-origin. Production без него отклоняется. Валидатор `scripts/validate-release.mjs` передаётся T03 после T01 и расширяет проверки данных. Не копировать эту логику в UI.

Astro output static, build.format file. Основные команды: pnpm dev (4321), dev:components (4322), check, build, build:components, test:validation, test:e2e, format:check. Установку зависимостей, изменение scripts и сборку общего dist запускает root.

## Визуальное направление

Кинематографичный тёмный Hero с крупным Unbounded, лаймовым CTA и спокойным монохромным постером из айдентики. Вёрстка выразительная и свободная, с тонкой сеткой, звёздами и узким шахматным разделителем. Секции чередуют тёмные поверхности и крупную типографику; не превращать все блоки в одинаковые карточки. Текст на фиолетовом и тёмном фоне проверяется на контраст. Никаких вымышленных метрик и брендов клиентов.

Соблюдать существующее ТЗ по ширинам и доступности. Временные значения палитры: фон #141517, surface #202124, текст #F5F5F1, лайм #A4FF82, фиолетовый #620DFF. T02 проверяет пары и фиксирует итоговые токены. Unbounded доступен через @fontsource-variable/unbounded, нужно импортировать только latin/cyrillic; Corsa заменяется системным sans до предоставления лицензии. Основной preview содержит небольшое обозначение «Рабочий макет»; черновые тексты не выдаются за подтверждённые.

## Правила исполнения

Секции не меняют index/layout/config/tokens. Root подключает их к отдельному стенду и к главной. Отчёты TXX в docs/reports. Вызовы проверок, меняющие общий dist, согласуются с root. Тестовые контакты находятся только в изолированном стенде/tests; основной сайт их не получает.
