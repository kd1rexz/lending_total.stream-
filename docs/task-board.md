# Очередь разработки Total Stream

Обновлено 16 октября 2026 года. Локальный preview G1 реализован и проверен. Доску редактирует только оркестратор. Содержание и приёмка задач — в [плане разработки](development-plan.md).

## Состояние задач

| ID | Задача | Зависимости | Статус | Исполнитель | Результат |
| --- | --- | --- | --- | --- | --- |
| T00 | Инвентаризация и сохранение | Нет | done | Оркестратор | [Отчёт](reports/T00.md) |
| T01 | Каркас и контракты | T00 | done | Оркестратор | [Отчёт](reports/T01.md) |
| T02 | Дизайн-система | T01 | done | design_system | [Отчёт](reports/T02.md), screenshots output/qa/T02 |
| T03 | Контент и валидатор | T01 | done | content | [Отчёт](reports/T03.md), 13 тестов |
| T04 | Hero, навигация, контакты | T02 | done | design_system | [Отчёт](reports/T04.md), браузерные сценарии 360–1440 px |
| T05 | Содержательные секции | T02 | done | content | [Отчёт](reports/T05.md), заполненные/пустые случаи на отдельном стенде |
| T06 | Подготовка поставки | T01 | done | delivery | [Отчёт](reports/T06.md), 9 локальных тестов; серверная репетиция в T11 |
| T07 | Интеграция и SEO | T03, T04, T05 | done | Оркестратор | [Отчёт](reports/T07.md), сборка и SEO-режимы |
| T08 | Независимый QA | T07 | done | delivery | [Отчёт](reports/T08.md), 51 E2E, 24 целевых повтора, 64 замера контраста |
| T09 | Исправления и G1 | T08 | done | Оркестратор | [Отчёт](reports/T09.md), чистая установка/сборка, G1 |
| T10 | Финальный контент | T09, внешние материалы | waiting_external | Не назначен | Контакты, кейсы, утверждённые тексты и медиа намеренно отложены |
| T11 | VPS и staging | T06, T09, доступы и домены | waiting_external | Не назначен | Инструменты готовы; VPS/DNS/HTTPS и Linux-проверки ожидают среду |
| T12 | Публичный выпуск | T10, T11, поручение на публикацию | queued | Не назначен | — |
| T13 | Исправление логотипа | T09, выбор пользователя | done | Оркестратор | [Отчёт](reports/T13.md), оригинальный вариант 3; 27 браузерных проверок |
| T14 | Присланный PNG как исходник логотипа | T13, файл пользователя | done | Оркестратор | [Отчёт](reports/T14.md), PNG сохранён без изменений; сборка и проверка 360/1440 px |
| T15 | «О команде» вместо процесса работы | T09, правка пользователя | done | team_section / root | [Отчёт](reports/T15.md), секция и меню; визуальная приёмка 360/768/1440 px |
| T16 | Примеры услуг в окне поверх страницы | T09, правка пользователя | done | root / independent_qa | [Отчёт](reports/T16.md), [QA](reports/T16-QA.md); окна, клавиатура/noJS, заполненные fixtures |
| T17 | Упрощение первого экрана | T16, правка пользователя | done | root | [Отчёт](reports/T17.md), подписи убраны, отступы сокращены; 27 браузерных проверок |
| T18 | Юрий Минеев вместо карточек ролей | T17, фото и текст пользователя | done | root | [Отчёт](reports/T18.md), портрет и подтверждённая роль CEO; 27 браузерных проверок |
| T19 | Фиолетовый по присланному логотипу | T18, правка пользователя | done | root | [Отчёт](reports/T19.md), лайм сохранён; 6 браузерных аудитов и визуальная проверка |
| T20 | Компактная шапка и первый экран по высоте окна | T19, правка пользователя | done | root | [Отчёт](reports/T20.md), шапка 64/72 px; 39 браузерных проверок |
| T21 | Плавное вращение звёзд при прокрутке | T20, правка пользователя | done | root | [Отчёт](reports/T21.md), сглаживание, обратное вращение, reduced motion; 12 E2E и 6 проверок движения |
| T22 | Разделитель в стиле съёмки и эфира | T21, правка пользователя | done | root | [Отчёт](reports/T22.md), монтажная шкала; 27 браузерных проверок |
| T23 | Новый разделитель ниже Hero и блок клиентов | T22, правка пользователя | done | root | [Отчёт](reports/T23.md), первый экран без разделителя; PIMS, Apple, Google; 33 браузерные проверки |
| T24 | Настоящие логотипы компаний ниже кейсов | T23, правка пользователя | done | root | [Отчёт](reports/T24.md): 8 логотипов, 5 явно демонстрационных; полоса удалена; 33/33 E2E |
| T25 | Кнопки первого экрана и новый портрет Юрия | T24, правка пользователя | done | root | [Отчёт](reports/T25.md): капсула по референсу, новый портрет, обычная р; сборка и 9 финальных браузерных проверок |
| T26 | Повторная переработка кнопок Hero | T25, правка пользователя | done | root | [Отчёт](reports/T26.md): отдельные кнопки, круглые иконки; 12/12 браузерных проверок |
| T27 | Фиолетовый фон по основному цвету логотипа | T26, правка пользователя | done | root | [Отчёт](reports/T27.md): #4B0DF8, сборка и контраст проверены |
| T28 | Исходные кнопки и композиция первого экрана | T27, правка пользователя | done | root | [Отчёт](reports/T28.md): исходный ButtonLink, увеличенный отступ, звёзды по контенту; 30/30 E2E |
| T29 | Сверка с последним PDF дизайнера | T28, новый PDF пользователя | done | root | [Отчёт](reports/T29.md): новый фиолетовый #3509AE, лайм сохранён по ответу пользователя; остальные отличия перечислены; 6/6 WCAG |
| T30 | Линии и кнопки Hero по новому PDF | T29, уточнение пользователя | done | root | [Отчёт](reports/T30.md): скруглённые линии, две залитые кнопки; лайм сохранён; 9/9 E2E и 46 измерений контраста |
| T31 | Передача второму разработчику и push в GitHub | T30, поручение пользователя | done | root | [Отчёт](reports/T31.md): исходники в GitHub, инструкция и промпт; чистый клон, установка, check, 14 тестов, build и HTTP 200 |
| T32 | Более строгая фиолетово-лаймовая подача | T31, поручение пользователя | done | root | [Отчёт](reports/T32.md): ослаблено свечение, лайм только для CTA и небольших акцентов; check/build, 9/9 Chromium |
| T33 | Прозрачная шапка, упрощение секций и контакты | T32, поручение пользователя | done | root | [Отчёт](reports/T33.md): крупный логотип, удалена нумерация, три preview-заглушки; 17/17 Chromium |
| T34 | Исходный PNG, навигация и один CTA в Hero | T33, поручение пользователя | done | root | [Отчёт](reports/T34.md): исходный логотип без перекодирования, точный фиолетовый, 17/17 Chromium |
| T35 | Слово «ключ» по айдентике | T34, референс пользователя | done | root | [Отчёт](reports/T35.md): убрана подложка, #3509AE поверх фотографии; build и визуальная проверка |
| T36 | Яркий фиолетовый и выразительный CTA | T35, уточнение пользователя | done | root | [Отчёт](reports/T36.md): #4B0DF7 из скриншота, CTA по T30; build, 7/7 Chromium |
| T37 | Увеличение CTA | T36, правка пользователя | done | root | [Отчёт](reports/T37.md): 360×72 px, текст 18 px; build, 7/7 Chromium |
| T38 | Услуги, прокрутка, типографика и контакты | T37, поручение пользователя | done | root | [Отчёт](reports/T38.md): новые кнопки и подсказка, компактные контакты, 16/16 Chromium; Corsa ожидает файлы |
| T39 | Зацикленная подсказка прокрутки | T38, правка пользователя | done | root | [Отчёт](reports/T39.md): 26×40 px, прежняя подпись, infinite/reduced motion проверены |
| T40 | Синхронизация подсказки | T39, правка пользователя | done | root | [Отчёт](reports/T40.md): общий цикл, овал 22 px; фазы проверены |
| T41 | Мобильный заголовок и спокойные услуги | T40, правка пользователя | done | root | [Отчёт](reports/T41.md): фон восстановлен, нейтральные кнопки; 12/12 Chromium |
| T42 | Серые контакты и однострочный footer | T41, правка пользователя | done | root | [Отчёт](reports/T42.md): логотип в контактах, без подписей/точки; check/build, 9/9 Chromium |
| T43 | Footer, общая сетка и варианты услуг | T42, поручение пользователя | done | root | [Отчёт](reports/T43.md): восстановлена плашка, логотип в footer, равные колонки; check/build, 9/9 Chromium |
| T44 | Три варианта услуг подряд | T43, поручение пользователя | done | root | [Отчёт](reports/T44.md): grid, accordion, switcher в preview; check/build, 15/15 Chromium |
| T45 | Сетка с hover и смена форматов при прокрутке | T44, уточнения пользователя | done | root | [Отчёт](reports/T45.md): кликабельные карточки и scroll-переключатель после них; check/build, 18/18 Chromium |
| T46 | Hero CTA по скриншотам | T45, пользовательский референс | done | root | [Отчёт](reports/T46.md): графит/лайм, arrow/light/magnet/press; check/build, 12 адресных + повтор 4/4 CTA |
| T47 | Серые кнопки без контуров | T46, правка пользователя | done | root | [Отчёт](reports/T47.md): #2F2F2F, без декоративных обводок; build, 8/8 Chromium |

| T48 | Светло-серый из логотипа для кнопок | T47, уточнение пользователя | done | root | [Отчёт](reports/T48.md): #AFAFAF, тёмный текст; build, 8/8 Chromium |

| T49 | Молочно-белая главная CTA | T48, выбор пользователя | done | root | [Отчёт](reports/T49.md): фон #F5F5F1, лаймовый круг; build passed |

| T50 | Лаймовая CTA с тёмным кругом | T49, выбор пользователя | done | root | [Отчёт](reports/T50.md): лайм #A4FF82, круг #141517; build passed |

| T51 | Белый круг и тёмная стрелка CTA | T50, правка пользователя | done | root | [Отчёт](reports/T51.md): круг #F5F5F1, стрелка #141517; build passed |

| T52 | Фирменный фиолетовый круг CTA | T51, правка пользователя | done | root | [Отчёт](reports/T52.md): круг #4B0DF7, светлая стрелка; build passed |

| T53 | Фиолетовая CTA с лаймовым кругом | T52, правка пользователя | done | root | [Отчёт](reports/T53.md): кнопка #4B0DF7, круг #A4FF82; build passed |

| T54 | Прозрачная CTA с белым контуром | T53, правка пользователя | done | root | [Отчёт](reports/T54.md): build passed |
| T55 | Восстановление мобильного меню | T54, правка пользователя | done | root | [Отчёт](reports/T55.md): build passed |

| T56 | Фиолетовое наведение меню | T55, правка пользователя | done | root | [Отчёт](reports/T56.md): scale 1.04, reduced motion, build и Chromium |

| T57 | Спокойный блок команды и возврат лайма | T56, правка пользователя | done | root | [Отчёт](reports/T57.md): фон как у кейсов, типографика, build и визуальная проверка 390/1440 |

| T58 | Затухание лаймовой точки | T57, правка пользователя | done | root | [Отчёт](reports/T58.md): синхронная анимация, build passed |

| T59 | Единый фиолетовый и три варианта команды | T58, правка пользователя | done | root | [Отчёт](reports/T59.md): 3 композиции рядом, build, Chromium 360/768/1440 |

| T60 | FAQ, услуги, Юрий и контактные акценты | T59, правки пользователя | done | root | [Отчёт](reports/T60.md): check/build, 13/13 E2E и финальные 5/5 карточек, 390/1440 визуально |

| T61 | Сетка с обратной стороной и два блока Юрия | T60, правки пользователя | done | root | [Отчёт](reports/T61.md): build, scroll 3/3 и flip 2/2, визуальная проверка 390/1440 |

| T62 | Четыре анимации выбранной сетки, Юрий и исходные контакты | T61, правки пользователя | done | root | [Отчёт](reports/T62.md): check/build, 3/3 карточки + 8/8 reflow/noJS |

| T63 | Единый zoom-in, таймлайн и серые контакты | T62, правки пользователя | done | root | [Отчёт](reports/T63.md): check/build, 10/10 Chromium, 390/1440 визуально |

| T64 | Четыре смысловых фото и стабильный текст карточек | T63, правки пользователя | done | root | [Отчёт](reports/T64.md): imagegen 4 кадра, check/build, 10/10 Chromium |

| T65 | Курсоры по кликабельности | T64, правка пользователя | done | root | [Отчёт](reports/T65.md): browser cursor check, build |

| T66 | Три контактных CTA с иконками | T65, правка пользователя | done | root | [Отчёт](reports/T66.md): три темы, тестовые ссылки, build и scoped axe 390/1440 |

| T67 | Исходный текст и чистые контактные ссылки | T66, правка пользователя | done | root | [Отчёт](reports/T67.md): build, 2/2 Chromium/axe |

| T68 | Контакты в стиле лендинга и точная палитра | T67, правки владельца | done | root | [Отчёт](reports/T68.md): три набора SVG, коды владельца, check/build, Chromium и scoped axe |

`queued` означает, что задача ещё не назначена, а не что её зависимости уже выполнены. Следующий этап — T10/T11 после получения предусмотренных материалов и инфраструктуры.

## Точки готовности

| Точка | Статус | Основание |
| --- | --- | --- |
| G1 Локальный preview | Достигнута | T09: сборка, независимый QA и исправление контраста приняты |
| G2 Готово к публикации | Не достигнута | Требуются T10 и T11, проверка перед T12 |
| G3 Опубликовано | Не достигнута | Требуется T12 |

## Активное владение файлами

- T47 root — done, владение закрыто: кнопки без декоративных контуров, графит #2F2F2F из айдентики. Пути: `src/styles/tokens.css`, `src/components/ui/{ProjectCTA,ServiceExamples,ButtonLink}.astro`, `src/components/sections/SiteHeader.astro`, `docs/{contracts,task-board}.md`, `docs/reports/T47.md`.

- T46 root — done, владение закрыто: Hero CTA по скриншотам metic — нейтральная капсула, лаймовый круг, поворот стрелки, cursor light, spring magnet и press. Пути: `src/components/ui/ProjectCTA.astro`, `src/scripts/project-cta.ts`, `src/components/sections/Hero.astro`, `tests/e2e/project-cta.spec.ts`, `docs/{contracts,task-board,technical-spec}.md`, `docs/reports/T46.md`.

- T45 root — done, владение закрыто: сетка 2×2 с кликабельной карточкой и hover плюс возвращённый переключатель с закреплением при прокрутке по дополнению пользователя. Пути: `src/components/sections/{Services,ServiceVariants}.astro`, `src/pages/index.astro`, `tests/e2e/{service-variants,service-cards,service-scroll}.spec.ts`, `src/components/sections/ServiceScroll.astro`, `src/scripts/service-scroll.ts`, `docs/{contracts,task-board,technical-spec}.md`, `docs/reports/T45.md`.

- T44 root — done, владение закрыто: три рабочих варианта услуг подряд для выбора в preview. Пути: `src/components/sections/ServiceVariants.astro`, `src/components/ui/ServiceExamples.astro`, `src/pages/index.astro`, `tests/e2e/{service-examples,service-variants}.spec.ts`, `docs/{contracts,task-board,technical-spec}.md`, `docs/reports/T44.md`.

- T43 root — done, владение закрыто: восстановление нижней плашки, логотип в footer, симметричная сетка контактов и выравнивание секций; варианты услуг в отчёте. Пути: `src/components/sections/{Contacts,SiteFooter,Services,Reliability,Team}.astro`, `src/styles/tokens.css`, `docs/{contracts,task-board,technical-spec}.md`, `docs/reports/T43.md`.

- T42 root — done, владение закрыто: серые контакты, логотип под текстом, без точки/подписей-заглушек, однострочный footer. Пути: `src/components/sections/{Contacts,SiteFooter}.astro`, `src/pages/index.astro`, `tests/{e2e/landing.spec.ts,component-preview/src/pages/sections.astro}`, `docs/{contracts,task-board,technical-spec}.md`, `docs/reports/T42.md`.

- T41 root — done, владение закрыто: крупнее мобильный Hero, прежний фон услуг и спокойные кнопки, акцент на типографике. Пути: `src/components/sections/{Hero,Services}.astro`, `src/components/ui/ServiceExamples.astro`, `docs/{task-board,contracts,technical-spec}.md`, `docs/reports/T41.md`.

- T40 root — done, владение закрыто: синхронизация анимации подсказки и сужение овала. Пути: `src/components/sections/Hero.astro`, `docs/{contracts,task-board}.md`, `docs/reports/T40.md`.

- T39 root — done, владение закрыто: зацикленная подсказка прокрутки, прежняя подпись и увеличенный значок. Пути: `src/components/sections/Hero.astro`, `docs/{task-board,contracts}.md`, `docs/reports/T39.md`.

- T38 root — done, владение закрыто (Corsa Grotesk ожидает файлы): подсказка прокрутки, услуги и кнопки примеров, типографика команды, компактные контакты и удаление Наверх. Пути: `src/components/sections/{Hero,Services,Team,Contacts,SiteFooter}.astro`, `src/components/ui/ServiceExamples.astro`, `docs/{task-board,technical-spec,contracts}.md`, `docs/reports/T38.md`.

- T37 root — done, владение закрыто: увеличить CTA. Пути: `src/components/sections/Hero.astro`, `docs/{task-board,technical-spec,contracts}.md`, `docs/reports/T37.md`.

- T36 root — done, владение закрыто: яркий фиолетовый по скриншоту и возврат выразительного CTA. Пути: `src/styles/tokens.css`, `src/components/{brand/Star,sections/Hero}.astro`, `docs/{task-board,technical-spec,contracts}.md`, `docs/reports/T36.md`.

- T35 root — done, владение закрыто: убрать подложку слова «ключ» по присланному референсу. Пути: `src/components/sections/Hero.astro`, `docs/{task-board,technical-spec,contracts}.md`, `docs/reports/T35.md`.

- T34 root — done, владение закрыто: исходный PNG без оптимизации, расстояние wordmark, крупная навигация и один компактный CTA под текстом Hero по последней правке пользователя, точный фиолетовый. Пути: `AGENTS.md`, `src/data/assets.json`, `src/components/{brand/Logo,brand/Star,sections/SiteHeader,sections/Hero}.astro`, `src/styles/tokens.css`, `docs/{task-board,contracts,technical-spec,content-register}.md`, `docs/reports/T34.md`.

- T33 root — done, владение закрыто: прозрачная шапка, крупный логотип, удаление служебных надписей/нумерации, preview-заглушки контактов. Пути: `src/components/sections/*.astro`, `src/styles/tokens.css`, `tests/e2e/landing.spec.ts`, `docs/{task-board,technical-spec,contracts,content-register}.md`, `docs/reports/T33.md`.

- T32 root — done, владение закрыто: более строгая палитра по поручению пользователя; `src/components/sections/{Hero,Services,Cases,Contacts,Team,Reviews,Reliability,FAQ}.astro`, `src/components/ui/ServiceExamples.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T32.md`.

Workspace: `/Users/daniil/Desktop/total stream`, ветка `codex/total-stream-landing`, исходный коммит `2845293`; интеграция в общем рабочем дереве.

- T31 root завершён, владение закрыто: `README.md`, `docs/{developer-onboarding,task-board}.md`, `docs/reports/T31.md`. Инструкция для второго разработчика и его ChatGPT подготовлена; воспроизводимость из нового клона GitHub проверена. Посторонний untracked `build_competitor_pdf.py` не включён.

- T30 root завершён, владение закрыто: `src/components/sections/Hero.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T30.md`, `output/qa/T30/`. Фоновые линии и кнопки адаптированы по страницам 4–5 нового PDF; основной CTA остаётся лаймовым. Общий ButtonLink, контент и остальные секции не изменены.

- T04 design_system завершён, правки остановлены; файлы возвращены root.
- T05 content и допроверка optional-стенда завершены, правки остановлены; файлы возвращены root.
- T08 delivery завершён, правки остановлены. Передача 13 октября в 18:00 МСК, финальный снимок dist и время проверок в T08. Файлы возвращены root.
- T15 team_section и T16 independent_qa: правки завершены и остановлены, результаты приняты root 15 октября 2026. Файлы возвращены root; контрольные суммы и проверки в отчётах.
- T19 root завершён: `src/styles/{tokens,global}.css`, `src/components/{brand,ui,sections}/*.astro` (только палитра), `src/pages/404.astro`, `tests/component-preview/src/pages/*.astro` (цветовые props и токены), `AGENTS.md`, `README.md`, `docs/{technical-spec,development-plan,contracts,content-register,task-board}.md`, `docs/reports/T19.md`, `output/qa/T19/`. Растровые исходники не изменены. Пробная замена лайма отменена по уточнению пользователя; итоговый код меняет только два фиолетовых токена в `tokens.css`. Владение закрыто.

- T20 root завершён, владение закрыто: `src/components/sections/{SiteHeader,Hero}.astro`, `src/styles/tokens.css`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T20.md`, `output/qa/T20/`. Размер логотипа настраивается только в шапке, без изменения исходного PNG и футера.

- T21 root завершён, владение закрыто: `src/components/brand/Star.astro`, `src/scripts/scroll-stars.ts`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T21.md`, `output/qa/T21/`. Вращаются только декоративные звёзды, исходник и компонент логотипа не меняются.

- T22 root завершён, владение закрыто: `src/components/brand/{CheckerPattern,BroadcastDivider}.astro`, `src/components/sections/Hero.astro`, `tests/component-preview/src/pages/index.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T22.md`, `output/qa/T22/`. Замена разделителя и учёт его высоты в Hero.

- T23 root завершён, владение закрыто: `src/components/brand/BroadcastDivider.astro`, `src/components/sections/{Hero,Trust}.astro`, `src/pages/index.astro`, `src/data/editorial.json`, `docs/{technical-spec,contracts,content-register,task-board}.md`, `docs/reports/T23.md`, `output/qa/T23/`. Компании — только названные пользователем: PIMS, Apple, Google.

- T24 root завершён, владение закрыто: `src/assets/clients/*`, `src/components/sections/Trust.astro`, `src/pages/index.astro`, `src/lib/content.ts`, `src/types/content.ts`, `src/data/{assets,editorial}.json`, `docs/{technical-spec,contracts,content-register,task-board}.md`, `docs/reports/T24.md`, `output/qa/T24/`. Официальные файлы логотипов и нормализация данных; изменения `src/lib/content-schema.mjs`, `tests/component-preview/src/pages/optional.astro` и индекса стенда также принадлежат root. По последнему указанию удалить `src/components/brand/BroadcastDivider.astro` и все подключения. Пользователь подтвердил дополнительные бренды как примеры для макета: Nike, Samsung, Sony, NVIDIA, Spotify. Они отмечаются previewOnly и не выводятся в production. Также разрешено добавить нейтральный SVG в tests/component-preview/src/assets/ для проверки контракта Trust.

- T25 root завершён, владение закрыто: `src/components/sections/{Hero,Team}.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T25.md`, `output/qa/T25/`. Кнопки Hero по последнему референсу (тёмная капсула и лаймовый градиент), их адаптивность и состояния; удалить подпись «Событие. Люди. Эфир.». Сердечко отменено пользователем: вернуть обычную р. Разрешены также src/assets/images/yuri-mineev.jpg, src/lib/content.ts, src/data/assets.json, tests/component-preview/src/pages/sections.astro, docs/content-register.md для замены портрета на новый пользовательский JPG.

- T26 root завершён, владение закрыто: `src/components/sections/Hero.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T26.md`, `output/qa/T26/`. Переработать только две кнопки первого экрана, сохранив подписи и якоря; убрать общую капсулу.

- T27 root завершён, владение закрыто: `src/styles/tokens.css`, `AGENTS.md`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T27.md`, `output/qa/T27/`. Уточнить базовый фиолетовый по исходному PNG; лайм и сам логотип сохраняются.

- T28 root завершён, владение закрыто: `src/components/sections/Hero.astro`, `docs/{technical-spec,contracts,task-board}.md`, `docs/reports/T28.md`, `output/qa/T28/`. Вернуть исходный вид двух CTA и пересобрать отступы/декор первого экрана. Общий ButtonLink и остальные секции не редактируются.

- T29 root завершён, владение закрыто: `src/styles/tokens.css`, `src/data/assets.json`, `AGENTS.md`, `docs/{technical-spec,contracts,content-register,task-board}.md`, `docs/references/color-palette.pdf`, `docs/reports/T29.md`, `output/qa/T29/`. Сверка нового дизайнерского PDF с сохранением последних пользовательских решений о структуре, кнопках и логотипе.

T02, T03 и T06 завершены; владение их файлами возвращено root. Плановая карта владения находится в разделе 5 плана. Одни и те же пути нельзя одновременно выдавать двум исполнителям.

## Внешние зависимости

| Данные | Влияют на | Режим до получения |
| --- | --- | --- |
| Реальные контакты и основной домен | T10, T12 | Preview с некликабельной подписью и noindex |
| Реальные кейсы, фотографии и подтверждённые тексты | T10 | Нейтральные пустые состояния и редакторские черновики |
| Логотип, палитра, файлы и права на шрифты | Финальная визуальная приёмка T10 | Рабочие значения и предусмотренный fallback |
| VPS, DNS, staging-домен и доступы | T11 | Локальные шаблоны и проверки T06 |
| Канал мониторинга и ответственный | Передача T12 | Описанная, но не активированная схема мониторинга |

Эти данные намеренно отложены. Их отсутствие не блокирует назначение задач локальной реализации и не является поводом повторно спрашивать пользователя сейчас.

## Решения и изменения

| Дата | Решение |
| --- | --- |
| 13 октября 2026 | Репозиторий разработки — `https://github.com/kd1rexz/lending_total.stream-.git`; подключён как origin, fetch выполнен, удалённых refs пока нет |
| 13 октября 2026 | Первый концепт: фиолетовый и лаймовый; контакты без форм; кейсы на главной; собственный VPS с Nginx |
| 13 октября 2026 | План предусматривает одного оркестратора и до трёх исполнителей с непересекающимися файлами |
| 13 октября 2026 | Разделены локальная готовность, готовность выпуска и фактическая публикация |
| 14 октября 2026 | Пользователь выбрал логотип «вариант 3» на первой странице PDF; оригинальное изображение заменяет самостоятельно нарисованный знак |
| 15 октября 2026 | Пользователь прислал отдельный PNG логотипа; src/assets/brand/logo-source.png становится основным исходником вместо PDF |
| 15 октября 2026 | Пользователь заменил блок «Как работаем» на «О команде»; кнопки услуг открывают примеры в окне поверх текущей страницы |
| 15 октября 2026 | По просьбе пользователя удалены подписи «Видеопродакшн / прямой эфир» и «Рабочий макет» в Hero; отступы сокращены, режим preview и noindex сохранены |
| 15 октября 2026 | Блок команды посвящён Юрию Минееву. Пользователь предоставил фото и описание Total Stream, отдельно подтвердил роль CEO вместо SEO. Не добавлять неподтверждённую биографию |
| 15 октября 2026 | По уточнению пользователя лайм #A4FF82 сохранён. Фиолетовый заменён на #4C0EF8 по присланному логотипу; светлый текстовый тон — #B69AFF. Фон, кнопки и исходник логотипа сохранены |
| 15 октября 2026 | Уменьшены шапка и её логотип; Hero адаптирован к высоте окна с сохранением доступности при увеличении текста. Палитра T19 сохранена |
| 15 октября 2026 | Декоративные звёзды плавно вращаются вслед за прокруткой. Логотип неподвижен; reduced motion отключает вращение |
| 15 октября 2026 | Шахматный разделитель заменён декоративной монтажной шкалой «Съёмка → Эфир»: таймкод, клипы камер и звуковая волна; высота учтена в Hero |
| 15 октября 2026 | Монтажная шкала отклонена пользователем. Новый разделитель — тонкая полоса кинохлопушки после услуг, вне первого экрана. Под Hero добавлен блок «Нам доверяют» с указанными пользователем PIMS, Apple и Google |
| 15 октября 2026 | По правке пользователя удалена диагональная полоса. Блок компаний перенесён после кейсов, названия заменены локальными изображениями логотипов. Пользователь разрешил дополнительные крупные бренды как примеры для макета: пять записей previewOnly с явной подписью |
| 15 октября 2026 | Кнопки Hero оформлены общей тёмной капсулой с лаймовым градиентом и иконками по последнему референсу. Подпись «Событие. Люди. Эфир.» удалена. Сердечко в букве р отменено последующим указанием пользователя; обычное имя восстановлено. Портрет заменён новым пользовательским чёрно-белым JPG |
| 15 октября 2026 | Общая капсула кнопок отклонена пользователем. Кнопки Hero сделаны отдельными и компактными: сплошной лайм со стрелкой в тёмном круге, тёмная кнопка кейсов с Play; промежуток 12 px |
| 15 октября 2026 | Базовый фиолетовый уточнён по наиболее частому непрозрачному пикселю логотипа: #4B0DF8 вместо усреднённого #4C0EF8. Единый токен применяется к фиолетовым фонам и декору |
| 15 октября 2026 | По просьбе пользователя восстановлены первоначальные кнопки Hero через ButtonLink. Увеличен отступ от описания, декоративные звёзды привязаны к заголовку и уровню кнопок |
| 15 октября 2026 | Сверены 14 страниц нового PDF дизайнера. Пользователь выбрал сохранить согласованный лайм и взять новый фиолетовый: #3509AE, перевод образца Display P3 в sRGB. Corsa Grotesk не предоставлен; нейтральные цвета остаются адаптацией. Подробности T29 |
| 15 октября 2026 | По уточнению о линиях и кнопках Hero адаптирован по новому PDF: скруглённые фоновые траектории, две залитые капсулы с прописными подписями и мягким свечением. Основная кнопка сохраняет лайм, вторичная светлая; отступы T28 сохранены. Подробности T30 |
| 16 октября 2026 | По прямому поручению владельца исходники отправлены в существующий GitHub, общая ветка codex/total-stream-landing. Добавлена инструкция для второго разработчика и его ChatGPT, предусмотрены отдельные клоны/ветки и PR в общую ветку. Публикация сайта на VPS не выполнялась. Подробности T31 |

При смене статуса добавлять ссылку на реальный отчёт, версию проверенных файлов и краткое основание. Отсутствующий отчёт не заменяется обещанием выполнить проверку позже.

- T48 root — done, владение закрыто: светло-серая заливка кнопок #AFAFAF из исходного логотипа. Пути: src/styles/tokens.css, src/components/ui/{ProjectCTA,ServiceExamples,ButtonLink}.astro, src/components/sections/SiteHeader.astro, docs/{contracts,technical-spec,task-board}.md, docs/reports/T48.md.

- T49 root — done, владение закрыто: молочно-белая главная CTA. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T49.md.

- T50 root — done, владение закрыто: лаймовая CTA с кругом цвета тёмного фона. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T50.md.

- T51 root — done, владение закрыто: белый круг и тёмная стрелка CTA. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T51.md.

- T52 root — done, владение закрыто: фирменный фиолетовый круг CTA. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T52.md.

- T53 root — done, владение закрыто: фиолетовая CTA с лаймовым кругом. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T53.md.

- T54 root — done, владение закрыто: прозрачная CTA с белым контуром по прямой правке пользователя. Пути: src/components/ui/ProjectCTA.astro, docs/{contracts,task-board}.md, docs/reports/T54.md.

- T55 root — done, владение закрыто: восстановление исходного оформления мобильного меню. Пути: src/components/sections/SiteHeader.astro, docs/{contracts,task-board}.md, docs/reports/T55.md.

- T56 root — done, владение закрыто: фиолетовое наведение меню, масштаб и ограничение лайма элементами CTA. Пути: src/components/sections/{SiteHeader,Cases,FAQ}.astro, src/styles/global.css, docs/{contracts,task-board}.md, docs/reports/T56.md.

- T57 root — done, владение закрыто: спокойный блок команды и возврат салатовых акцентов вне меню. Пути: src/components/sections/{Team,Cases,FAQ}.astro, src/styles/global.css, src/data/editorial.json, docs/{contracts,task-board}.md, docs/reports/T57.md.

- T58 root — done, владение закрыто: затухание лаймовой точки подсказки прокрутки. Пути: src/components/sections/Hero.astro, docs/{contracts,task-board}.md, docs/reports/T58.md.

- T59 root — done, владение закрыто: единый фиолетовый айдентики и три композиции команды рядом. Пути: src/styles/tokens.css, src/components/sections/TeamVariants.astro, src/pages/index.astro, docs/{contracts,task-board}.md, docs/reports/T59.md.

- T60 root — done, владение закрыто: FAQ, услуги, три полноразмерных блока Юрия, контакты и меню. Пути: src/components/sections/{FAQ,Services,ServiceScroll,TeamVariants,Contacts,SiteHeader}.astro, src/components/ui/{ServiceExamples,ServiceProjects}.astro, src/scripts/{faq,service-scroll}.ts, src/styles/tokens.css, tests/e2e/{service-scroll,service-cards,faq-animation}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T60.md.

- T61 root — done, владение закрыто: промежуточная сетка с обратной стороной, два блока Юрия и замедленная прокрутка. Пути: src/components/sections/{ServiceFlip,TeamVariants}.astro, src/pages/index.astro, src/data/editorial.json, src/scripts/service-scroll.ts, tests/e2e/service-flip.spec.ts, docs/{contracts,task-board}.md, docs/reports/T61.md.

- T62 root — done, владение закрыто: четыре анимации и фото в выбранной сетке, компактный Юрий, восстановление исходных контактов. Пути: src/components/sections/{ServiceFlip,TeamVariants,Contacts}.astro, src/scripts/service-flip.ts, src/pages/index.astro, src/assets/images/service-preview-generated.png, src/data/assets.json, tests/e2e/{service-flip,landing}.spec.ts; устаревшие тесты удалённых вариантов service-cards/service-scroll/service-examples, docs/{contracts,task-board}.md, docs/reports/T62.md.

- T63 root — done, владение закрыто: единый zoom-in услуг, таймлайн подготовки и возврат серых контактов. Пути: src/components/sections/{ServiceFlip,Reliability,Contacts}.astro, src/scripts/service-flip.ts (удаление устаревшего эффекта), tests/e2e/{service-flip,landing}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T63.md.

- T64 root — done, владение закрыто: четыре смысловых изображения, стабильный текст карточек, стрелочный курсор и звёзды desktop. Пути: src/components/sections/{Hero,ServiceFlip}.astro, src/assets/images/service-{multicamera,hybrid,remote,recording}-generated.png, src/data/assets.json, tests/e2e/service-flip.spec.ts, docs/{contracts,task-board}.md, docs/reports/T64.md.

- T65 root — done, владение закрыто: единый курсор стрелка, палец только на интерактивных элементах. Пути: src/styles/global.css, docs/{contracts,task-board}.md, docs/reports/T65.md.

- T66 root — done, владение закрыто: три последовательных варианта контактного CTA с иконками и реальными ссылками при наличии данных. Пути: src/components/sections/ContactVariants.astro, src/components/ui/ContactIcon.astro, src/pages/index.astro, tests/e2e/{contact-variants,landing,service-flip}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T66.md. Пользователь разрешил тестовые кликабельные контакты, телефон из восьмёрок; site.json.contacts остаётся пуст для production.

- T67 root — done, владение закрыто: исходные тексты всех трёх контактов, удаление служебных подписей. Пути: src/components/sections/ContactVariants.astro, tests/e2e/contact-variants.spec.ts, docs/{contracts,task-board}.md, docs/reports/T67.md.

- T68 root — done, владение закрыто: переработка трёх контактов, три семейства официальных SVG и коды палитры владельца. Пути: src/components/sections/ContactVariants.astro, src/components/ui/ContactIcon.astro, src/styles/tokens.css, src/assets/icons/contact/**, docs/{contracts,technical-spec,task-board}.md, docs/reports/T68.md, tests/e2e/{contact-variants,landing}.spec.ts. Розовый не изменять и не добавлять.

- T69 root — done, владение закрыто: восстановить оформление до T68 вне контактов, изолировать новую палитру. Пути: src/styles/tokens.css, src/components/sections/ContactVariants.astro, tests/e2e/contact-variants.spec.ts, docs/{contracts,technical-spec,task-board}.md, docs/reports/T69.md.

- T70 root — done, владение закрыто: выбран первый контактный блок, три ссылки вертикально, силуэтные иконки телефона/Telegram по референсу. Пути: src/components/sections/ContactVariants.astro, src/components/ui/ContactIcon.astro, tests/e2e/{contact-variants,landing}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T70.md.

- T71 root — done, владение закрыто: скрытая нативная полоса, индикатор прокрутки из подсказки Hero и мягкий контактный акцент. Пути: src/styles/global.css, src/components/ui/ScrollProgress.astro, src/scripts/scroll-progress.ts, src/pages/index.astro, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T71.md.

- T72 root — done, владение закрыто: сохранить длину 50svh и толщину рамки, убрать финишную точку, ускорить плавный перенос и увести подпись вниз. Пути: src/components/ui/ScrollProgress.astro, src/scripts/scroll-progress.ts, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T72.md.

- T73 root — done, владение закрыто: перенос по времени 900ms и затухание подписи 1100ms, возврат только у самого верха. Пути: src/scripts/scroll-progress.ts, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T73.md.

- T74 root — done, владение закрыто: UX-разбор и постановка движения ползунка, стабильная геометрия, разнесённые фазы переноса/растяжения и подпись. Пути: src/scripts/scroll-progress.ts, src/components/ui/ScrollProgress.astro, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T74.md.

- T75 root — done, владение закрыто: единый синхронный перенос/растяжение/затухание, непрерывный старт точки. Пути: src/scripts/scroll-progress.ts, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T75.md.

- T76 root — done, владение закрыто: удалить экспериментальный индикатор, вернуть исходную подсказку Hero. Пути: src/pages/index.astro, src/components/ui/ScrollProgress.astro, src/scripts/scroll-progress.ts, tests/e2e/scroll-progress.spec.ts, docs/{contracts,task-board}.md, docs/reports/T76.md.

- T77 root — done, владение закрыто: плавный уход вниз и затухание исходной подсказки Hero. Пути: src/components/sections/Hero.astro, src/scripts/hero-cue.ts, docs/{contracts,task-board}.md, docs/reports/T77.md.

- T78 root — done, владение закрыто: уход подсказки вниз относительно viewport, независимо от движения Hero. Пути: src/components/sections/Hero.astro, src/scripts/hero-cue.ts, docs/{contracts,task-board}.md, docs/reports/T78.md.

- T79 root — done, владение закрыто: замедлить уход подсказки, завершать затухание к пересечению её центра с краем viewport. Пути: src/components/sections/Hero.astro, src/scripts/hero-cue.ts, docs/{contracts,task-board}.md, docs/reports/T79.md.

- T80 root — done, владение закрыто: стабильная экранная подсказка без перемещения DOM при скролле, плавный обратный переход и смена направления. Пути: src/scripts/hero-cue.ts, src/components/sections/Hero.astro, tests/e2e/hero-cue.spec.ts, docs/{contracts,task-board}.md, docs/reports/T80.md.

- T81 root — done, владение закрыто: ранний запуск возврата подсказки за 96px до верха без изменения скорости. Пути: src/scripts/hero-cue.ts, tests/e2e/hero-cue.spec.ts, docs/{contracts,task-board}.md, docs/reports/T81.md.

- T82 root — done, владение закрыто: командный UX/UI-аудит текущего лендинга без правок сайта. root: docs/task-board.md, docs/reports/T82.md, output/qa/T82/**; visual: docs/reports/T82-visual.md; conversion: docs/reports/T82-conversion.md; mobile: docs/reports/T82-mobile.md. Анализ ноутбука и touch, обсуждение рекомендаций между агентами.

- T83 root — done, владение закрыто: реализовать аудит только для услуг/размеров карточек, Юрия, контактов и подготовки. Пути: src/components/sections/{ServiceFlip,TeamVariants,ContactVariants,Reliability}.astro, src/data/editorial.json (только reliability), tests/e2e/{service-flip,contact-variants,section-refinement}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T83.md, output/qa/T83/**. Остальные блоки и общие токены не менять.

- T84 root — done, владение закрыто: скрываемая по направлению шапка; три preview-композиции кейсов; удалить подпись demo-логотипов; компактный FAQ; согласованный контактный блок. Пути: src/components/sections/{SiteHeader,Hero,Trust,FAQ,ContactVariants,CaseVariants}.astro, src/scripts/header-scroll.ts, src/pages/index.astro, tests/e2e/{landing,contact-variants,header-scroll,case-variants}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T84.md, output/qa/T84/**.

- T85 root — done, владение закрыто: постоянно прозрачная шапка с более мягким переходом, возврат исходного Cases. Пути: src/components/sections/SiteHeader.astro, src/pages/index.astro, src/components/sections/CaseVariants.astro (удаление), tests/e2e/{case-variants,header-scroll}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T85.md.

- T86 root — done, владение закрыто: быстрая шапка без fade, минимальная карусель кейсов (фото/название/описание), фиолетовое «в эфир». Пути: src/components/sections/{SiteHeader,Cases,ContactVariants}.astro, src/scripts/case-carousel.ts, tests/e2e/{header-scroll,case-carousel,landing}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T86.md, output/qa/T86/**.

- T87 root — done, владение закрыто: три близкие компактные композиции карусели кейсов, фото около трети и развёрнутое описание работ. Пути: src/components/sections/Cases.astro, src/pages/index.astro, tests/e2e/case-carousel.spec.ts, docs/{contracts,task-board}.md, docs/reports/T87.md, output/qa/T87/**. Остальные блоки не менять.

- T88 root — done, владение закрыто: восстановить сохранённую композицию кейсов с сеткой/звездой/лаймовыми углами первым вариантом, два родственных варианта с рамками. Пути: src/components/sections/Cases.astro, src/pages/index.astro, tests/e2e/case-carousel.spec.ts, docs/{contracts,task-board}.md, docs/reports/T88.md, output/qa/T88/**.

- T89 root — done, владение закрыто: выбранный второй Cases, увеличенное фото/подпись, управление внутри панели, подавление image-hover. Пути: src/components/sections/Cases.astro, src/pages/index.astro, tests/e2e/{case-carousel,landing}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T89.md, output/qa/T89/**.

- T90 root — done, владение закрыто: убрать подпись кейса, увеличить высоту фото, центрировать управление под текстом по нижнему краю фото. Пути: src/components/sections/Cases.astro, tests/e2e/case-carousel.spec.ts, docs/{contracts,task-board}.md, docs/reports/T90.md, output/qa/T90/**.

- T91 root — done, владение закрыто: сравнение микровзаимодействий FAQ и меню, CTA glow/press, стрелки кейсов и текстовые контакты с копированием. Пути: src/components/sections/{Cases,FAQ,SiteHeader,Hero,ContactVariants}.astro, src/components/ui/ProjectCTA.astro, src/scripts/contact-copy.ts, tests/e2e/{case-carousel,interaction-options}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T91.md, output/qa/T91/**.

- T92 root — done, владение закрыто: единые underline/press, мягкое прожатие с минимальной длительностью, fade-кейсы без бокового скролла, общая FAQ-анимация3 без фиолетового. Пути: src/components/sections/{Cases,FAQ,SiteHeader,Hero}.astro, src/components/ui/ProjectCTA.astro, src/pages/index.astro, src/scripts/{case-carousel,faq,press-feedback}.ts, tests/e2e/{case-carousel,interaction-options}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T92.md, output/qa/T92/**.

- T93 root — done, владение закрыто: вернуть лёгкий подъём надписи меню вместе с подчёркиванием. Пути: src/components/sections/SiteHeader.astro, tests/e2e/interaction-options.spec.ts, docs/{contracts,task-board}.md, docs/reports/T93.md.

- T94 root — done, владение закрыто: сгладить смену кейсов без заметного замедления, убрать провал яркости и скачки повторных кликов. Пути: src/scripts/case-carousel.ts, src/components/sections/Cases.astro (слой управления), docs/{contracts,task-board}.md, docs/reports/T94.md.

- T95 root — done, владение закрыто: убрать magnet CTA, добавить общий press контактам/FAQ/логотипу. Пути: src/scripts/{project-cta,press-feedback,faq}.ts, src/components/ui/ProjectCTA.astro, tests/e2e/{project-cta,interaction-options}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T95.md.

- T96 root — done, владение закрыто: вернуть magnet CTA с уменьшенной на25% амплитудой и согласовать силу press по размеру элемента. Пути: src/scripts/{project-cta,press-feedback}.ts, src/components/ui/ProjectCTA.astro, src/components/sections/{Cases,Hero,SiteHeader,ContactVariants}.astro (CSS press fallback), tests/e2e/{project-cta,interaction-options}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T96.md.

- T97 root — done, владение закрыто: вернуть обычный press3% всем кнопкам, оставить мягким только FAQ и текстовые контакты. Пути: src/scripts/press-feedback.ts, src/components/ui/ProjectCTA.astro, src/components/sections/{Cases,Hero,SiteHeader,ContactVariants}.astro (CSS fallback), tests/e2e/{interaction-options,project-cta}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T97.md.

- T98 root — done, владение закрыто: touch-поведение CTA/услуг, мобильное меню без смещения шапки, Команда в навигации, tap-feedback. Пути: src/components/sections/{SiteHeader,ServiceFlip,Cases}.astro, src/components/ui/ProjectCTA.astro, src/scripts/{navigation,project-cta,press-feedback}.ts, src/data/navigation.json, tests/e2e/{landing,mobile-interactions}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T98.md, output/qa/T98/**.

- T99 root — done, владение закрыто: mobile CTA без tint, menu быстрый underline вместо lime, contact только presslime без hover. Пути: src/components/ui/ProjectCTA.astro, src/components/sections/{SiteHeader,ContactVariants}.astro, tests/e2e/mobile-interactions.spec.ts, docs/{contracts,task-board}.md, docs/reports/T99.md, output/qa/T99/**.

- T100 root — done, владение закрыто: нижний логотип ведёт к #top в обеих версиях; убрать underline мобильного меню, сохранить press. Пути: src/components/sections/{SiteFooter,SiteHeader}.astro, src/scripts/press-feedback.ts, tests/e2e/mobile-interactions.spec.ts, docs/{contracts,task-board}.md, docs/reports/T100.md.

- T101 root — done, владение закрыто: оформить 404 в стиле лендинга, затемнить всплывающую шапку вне Hero; дать рекомендации по юридической подготовке и SEO без публикации. Пути: src/pages/404.astro, src/components/sections/SiteHeader.astro, src/scripts/header-scroll.ts, tests/e2e/{header-scroll,not-found}.spec.ts, docs/{contracts,task-board}.md, docs/reports/T101.md, output/qa/T101/**.

- T102 root — done, владение закрыто: согласовать затемнение мобильного меню с шапкой вне Hero, сохранить прозрачное меню на Hero. Пути: src/components/sections/SiteHeader.astro, tests/e2e/header-scroll.spec.ts, docs/{contracts,task-board}.md, docs/reports/T102.md.


- T103 root — done, владение закрыто: SEO без домена и без открытия индексации, штатный sitemap, метаданные/структурированные данные без вымышленных фактов, preview-заглушки реквизитов в футере. Пути: src/lib/seo.mjs, src/pages/sitemap.xml.ts, src/layouts/BaseLayout.astro, src/components/sections/SiteFooter.astro, src/pages/index.astro, scripts/verify-dist.mjs, tests/validation/seo.test.mjs, tests/e2e/seo.spec.ts, docs/{contracts,task-board,seo-launch}.md, docs/reports/T103.md.


- T104 root — done, владение закрыто: компактные реквизиты справа от нижнего логотипа на desktop и mobile. Пути: src/components/sections/SiteFooter.astro, docs/{contracts,task-board}.md, docs/reports/T104.md, output/qa/T104/**.


- T105 root — done, владение закрыто: отключить журналы запросов/IP в конфигурациях Nginx, проверить генератор и сайт, коммит/push по поручению пользователя. Пути: infra/nginx/{http,https}.conf.template, scripts/deploy/{render-nginx.py,test_nginx.py}, infra/README.md, docs/{deployment,seo-launch,contracts,task-board}.md, docs/reports/T105.md.
