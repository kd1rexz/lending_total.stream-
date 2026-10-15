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
- Hero: `poster?: ImageMetadata`. Сам владеет id="top". По правке пользователя от 15 октября верхняя строка и бейдж preview удалены.
- Contacts: `contacts: Contact[]`, `isPreview: boolean`. id="contacts".
- SiteFooter: `contacts: Contact[]`.
- Services: `items: ServiceWithExamples[]`. id="services". `ServiceWithExamples` дополняет услугу массивом `examples: CaseStudy[]`, уже отфильтрованным слоем данных.
- Cases: `items: CaseStudy[]`, `isPreview: boolean`. id="cases". Preview без данных сохраняет якорь и нейтральное пустое состояние.
- Team: `items: EditorialItem[]`. id="team". С 15 октября заменяет Process по указанию пользователя.
- Reliability: `items: EditorialItem[]`.
- FAQ: `items: FAQItem[]`.
- Trust: `items: TrustItem[]`; Reviews: `items: Review[]`. Пустые полностью скрыты.

## Данные и сборка

Модуль src/lib/content.ts экспортирует `async getPageContent(): Promise<PageContent>`. Он читает данные и Astro Content Collections, фильтрует опубликованное в production и разрешает явно обозначенные черновики в preview. SiteSettings хранится в src/data/site.json, общий источник для UI и CLI-валидатора. Контакты только массив, первоначально пустой.

Services/cases — JSON collections через file/glob loader; допускается файл cases.json с пустым массивом, чтобы не создавать фиктивные кейсы. CaseStudy.cover преобразуется в ImageMetadata коллекцией или слоем content. Изображения встроенного PDF допустимы только как визуальный референс preview с документированным источником, не как реальные клиентские проекты.

CaseStudy.serviceIds — массив идентификаторов услуг (по умолчанию пустой). Неизвестные и повторные идентификаторы отклоняются валидатором. После фильтрации по режиму сборки getPageContent связывает видимые кейсы с услугами. Production требует хотя бы один опубликованный пример для каждой опубликованной услуги; preview допускает пустые окна.

ServiceExamples.astro: `service: ServiceWithExamples`. Кнопка «Смотреть примеры» открывает нативный dialog на текущей странице; отдельного маршрута нет. Закрытие: крестик, Escape или начало и окончание клика снаружи; фокус возвращается кнопке, прокрутка фона блокируется. Подробности содержат обложку, задачу, работу и результат; запись — проверенная ссылка в новой вкладке, без embed. Без JavaScript то же содержимое доступно через нативный details. Реальные материалы не заменяются фиктивными примерами.

src/lib/build-context.mjs принадлежит оркестратору: `resolveBuildContext(env?) → { context, isPreview, siteUrl }`. Без BUILD_CONTEXT — preview, неизвестное значение ошибка; SITE_URL при наличии HTTPS-origin. Production без него отклоняется. Валидатор `scripts/validate-release.mjs` передаётся T03 после T01 и расширяет проверки данных. Не копировать эту логику в UI.

Astro output static, build.format file. Основные команды: pnpm dev (4321), dev:components (4322), check, build, build:components, test:validation, test:e2e, format:check. Установку зависимостей, изменение scripts и сборку общего dist запускает root.

## Визуальное направление

Кинематографичный тёмный Hero с крупным Unbounded, лаймовым CTA и спокойным монохромным постером из айдентики. Вёрстка выразительная и свободная, с тонкой сеткой, звёздами и узким шахматным разделителем. Секции чередуют тёмные поверхности и крупную типографику; не превращать все блоки в одинаковые карточки. Текст на фиолетовом и тёмном фоне проверяется на контраст. Никаких вымышленных метрик и брендов клиентов.

Соблюдать существующее ТЗ по ширинам и доступности. Временные значения палитры: фон #141517, surface #202124, текст #F5F5F1, лайм #A4FF82, фиолетовый #620DFF. T02 проверяет пары и фиксирует итоговые токены. Unbounded доступен через @fontsource-variable/unbounded, нужно импортировать только latin/cyrillic; Corsa заменяется системным sans до предоставления лицензии. По указанию пользователя бейдж «Рабочий макет» убран. Статус черновиков остаётся в реестре контента; noindex и ограничения production сохраняются.

## Правила исполнения

Секции не меняют index/layout/config/tokens. Root подключает их к отдельному стенду и к главной. Отчёты TXX в docs/reports. Вызовы проверок, меняющие общий dist, согласуются с root. Тестовые контакты находятся только в изолированном стенде/tests; основной сайт их не получает.
