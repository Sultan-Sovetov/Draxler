# DRAXLER — SEO-аудит «ДО»

Дата: 13.11.2026 · Сборка: `next build --webpack` (Next 16.4.3, состояние рабочей копии до правок) · Сервер: `next start` локально.
Инструменты: собственный скрипт `tools/seo-audit.mjs` (разбор отданного сервером HTML) + Lighthouse 12.8.2 (Chrome headless, мобильный и десктопный пресеты).

---

## 1. Lighthouse

| Страница | Режим | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 92 | 80 | 100 | 100 | 1.3 s | 190 ms | 0 |
| `/` | desktop | 98 | 90 | 100 | 100 | 0.7 s | 10 ms | 0.003 |
| `/catalog` | mobile | 59 | 88 | 100 | 100 | 10.8 s | 630 ms | 0 |
| `/catalog` | desktop | 83 | 95 | 96 | 100 | 2.9 s | 90 ms | 0 |
| `/projects/g-wagon` | mobile | **52** | **73** | 89 | **80** | **17.3 s** | 650 ms | 0 |
| `/projects/g-wagon` | desktop | 83 | **73** | 93 | **80** | 3.0 s | 30 ms | 0 |
| `/blog/inside-the-draxler-g-wagon-study` | mobile | 81 | 91 | 100 | 100 | 3.7 s | 360 ms | 0 |
| `/blog/inside-the-draxler-g-wagon-study` | desktop | 99 | 96 | 100 | 100 | 0.8 s | 20 ms | 0 |

> ⚠️ **Критично:** `/projects/g-wagon` после загрузки JS падает целиком («This page couldn't load»): `TypeError: Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')`.
> Причина — незакоммиченный переход на Next 16 (внутри React 19), при этом в проекте остались `@react-three/fiber@8` / `drei@9`, рассчитанные только на React 18. Падают все 3D-сцены: конфигуратор на главной, конфигуратор и диск DRX-202 на странице G-Wagon. Отсюда SEO 80 (у упавшей страницы нет `<title>`, `lang`, description) и LCP 17 с.

Повторяющиеся замечания Lighthouse: `color-contrast`, `button-name` (кнопки без подписи), `target-size`, `aria-required-children`, `uses-responsive-images` / `modern-image-formats` (PNG по 2–2.5 МБ), `unused-javascript`, `render-blocking-resources`, `errors-in-console`.

## 2. Метаданные по страницам (HTML, отданный сервером)

| Page | HTTP | Title (len) | Desc len | Canonical | OG tags (of 3) | Twitter | H1 | img / no-alt | JSON-LD | Crawlable links | robots | HTML KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 16 / 0 | 0 | 6 | — | 44 |
| `/catalog` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | **0** | 48 / 0 | 0 | 27 | — | 78 |
| `/catalog/vip` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 30 / 0 | 0 | 17 | — | 50 |
| `/catalog/vip/drx-101` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 2 / 0 | 0 | 6 | — | 28 |
| `/catalog/sport` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 24 / 0 | 0 | 14 | — | 43 |
| `/projects` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 16 / 0 | 0 | 4 | — | 55 |
| `/projects/g-wagon` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 11 / 0 | 0 | 9 | — | 27 |
| `/blog` | 200 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 8 / 0 | 0 | 11 | — | 33 |
| `/blog/inside-the-draxler-g-wagon-study` | 200 | Inside the DRAXLER G‑Wagon Study — DRAXLER Blog (47) | 148 | — | 2 | summary | 1 | 5 / 0 | 0 | 12 | — | 37 |
| `/this-page-does-not-exist` | 404 | DRAXLER — Engineered Excellence / Premium Performance Wheels (60) | 158 | — | 0 | — | 1 | 0 / 0 | 0 | 0 | noindex | 10 |

| Файл | HTTP |
|---|---|
| `/robots.txt` | **404** |
| `/sitemap.xml` | **404** |
| `/manifest.webmanifest` | **404** |
| `/opengraph-image` (картинка для соцсетей) | **404** |
| `/favicon.ico` | 200 |

Дубли title на страницах с кодом 200: **8 из 9 страниц** имеют один и тот же title и description.

Мягкие 404 (несуществующая страница отдаёт 200 и «Not Found» внутри):
- `/catalog/nope` → **200**
- `/catalog/vip/nope` → **200**
- `/blog/nope` → 404 (ок)

## 3. Найденные проблемы (по приоритету)

| # | Проблема | Влияние |
|---|---|---|
| 1 | Страница G-Wagon и все 3D-сцены падают на Next 16 (R3F 8 несовместим с React 19) | Страница не индексируется корректно, пользователи видят ошибку |
| 2 | Нет `robots.txt` и `sitemap.xml` | Google хуже находит страницы, особенно 46 карточек дисков и 8 статей |
| 3 | Одинаковые title/description у всех страниц, кроме статей (страницы — клиентские компоненты, метаданные не заданы) | Дубли в выдаче, низкий CTR, каннибализация |
| 4 | Нет `canonical` и `metadataBase` | Риск дублей (www/без www, параметры, хвостовые слэши) |
| 5 | Нет Open Graph / Twitter-карточек (кроме частичных в статьях, без картинки) | Плохие превью в WhatsApp / Telegram / Instagram — основных каналах |
| 6 | Нет структурированных данных (JSON-LD) | Нет расширенных сниппетов: Organization, Product, Article, FAQ, BreadcrumbList |
| 7 | Меню сделано на `<button>`, а не на ссылках | На главной всего 6 ссылок, по которым может пройти поисковый робот |
| 8 | На `/catalog` нет H1 | Слабый сигнал о теме страницы |
| 9 | Мягкие 404 для несуществующих категорий/дисков | Мусорные URL попадают в индекс |
| 10 | Тяжёлые PNG (до 2.4 МБ) через `<img>` на G-Wagon | LCP, Performance, мобильный трафик |
| 11 | Нет `manifest`, `theme-color`, apple-touch-icon | Мелочь, но влияет на мобильный «вид» сайта и оценку PWA |
| 12 | Ссылка WeChat в футере с `href="#"`, иконки-кнопки без подписей | Доступность (а11y) |
| 13 | Прелоадер на главной держит экран ~6.6 с | Ухудшает воспринимаемую скорость; Google рендерит контент в HTML, поэтому на индексацию не влияет |

## 4. План работ

1. Починить падение 3D: React 19 + `@react-three/fiber@9` + `@react-three/drei@10` (совместимо с Next 16, ничего в дизайне не меняется).
2. `src/app/robots.ts` и `src/app/sitemap.ts` (главная, каталог, 3 категории, 46 дисков, проекты, G-Wagon, блог, 8 статей).
3. `metadataBase`, шаблон заголовка `%s — DRAXLER`, canonical, Open Graph, Twitter, keywords, `theme-color`, `manifest` в корневом layout.
4. Уникальные title/description/canonical/OG для каждого раздела через серверные `layout.tsx` (клиентские страницы не трогаются) и `generateMetadata` для категорий, дисков и статей.
5. JSON-LD: `Organization` + `WebSite` (глобально), `ItemList` (каталог), `Product` + `BreadcrumbList` (диск), `Article` + `BreadcrumbList` (статья), `FAQPage` (G-Wagon), `CollectionPage` (проекты/блог).
6. Настоящий 404 для несуществующих категорий/дисков (`notFound()` в серверном layout).
7. Меню: `<a href>` вместо `<button>` (поведение плавного скролла сохраняется).
8. H1 на `/catalog` (визуально без изменений), подписи у иконок-кнопок, WeChat без `href="#"`.
9. Сгенерированная OG-картинка 1200×630 в фирменном стиле.
10. Повторный аудит тем же скриптом и Lighthouse → `SEO_REPORT_AFTER.md`.
