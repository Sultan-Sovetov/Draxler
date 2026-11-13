# DRAXLER — SEO-аудит «ПОСЛЕ»

Дата: 13.11.2026 · Те же инструменты и те же страницы, что в [SEO_REPORT_BEFORE.md](SEO_REPORT_BEFORE.md): `tools/seo-audit.mjs` + Lighthouse 12.8.2 на production-сборке (`next build` → `next start`).

---

## 1. Итог в цифрах

| Метрика | ДО | ПОСЛЕ |
|---|---|---|
| Lighthouse SEO (8 прогонов) | 100 / 100 / 100 / 100 / **80 / 80** / 100 / 100 | **100 во всех 8** |
| Страниц с уникальным title и description | 1 из 9 | **9 из 9** (дублей: 0) |
| Страниц с canonical | 0 | **9 из 9** |
| Open Graph (title, description, image) | 0–2 из 3 | **3 из 3 везде** + картинка 1200×630 (66 КБ) |
| Twitter card | только у статей (`summary`) | **везде `summary_large_image`** |
| JSON-LD (структурированные данные) | 0 | **2–4 блока на каждой странице** |
| `robots.txt` / `sitemap.xml` / `manifest` | 404 / 404 / 404 | **200 / 200 / 200** |
| URL в sitemap | — | **56** статичных + товары из Supabase, добавляются автоматически (на момент проверки было 177, см. п. 5) |
| Мягкие 404 (`/catalog/nope`, `/catalog/vip/nope`) | 200 | **404** |
| H1 на `/catalog` | нет | **есть** (визуально не виден, дизайн не изменён) |
| Ссылок для робота на главной | 6 | **13** (меню теперь из настоящих ссылок) |
| Страница G-Wagon | **падала** (ошибка React 19 + R3F 8) | **работает** (3D-конфигуратор и диск) |

## 2. Lighthouse: было → стало

| Страница | Режим | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | mobile | 92 → 89 | 80 → **86** | 100 → 100 | 100 → 100 |
| `/` | desktop | 98 → 98 | 90 → 90 | 100 → 100 | 100 → 100 |
| `/catalog` | mobile | 59 → 59 | 88 → **95** | 100 → 100 | 100 → 100 |
| `/catalog` | desktop | 83 → 84 | 95 → 95 | 96 → 96 | 100 → 100 |
| `/projects/g-wagon` | mobile | 52 → **89** | 73 → **96** | 89 → **100** | 80 → **100** |
| `/projects/g-wagon` | desktop | 83 → 57 ⚠️ | 73 → **96** | 93 → **100** | 80 → **100** |
| `/blog/inside-the-draxler-g-wagon-study` | mobile | 81 → 82 | 91 → **96** | 100 → 100 | 100 → 100 |
| `/blog/inside-the-draxler-g-wagon-study` | desktop | 99 → **100** | 96 → 96 | 100 → 100 | 100 → 100 |

Как читать спорные цифры:
- **G-Wagon, ПК, Performance 83 → 57.** «ДО» — это измерение уже упавшей страницы: 3D там вообще не запускался. Теперь конфигуратор и диск реально загружаются (TBT ≈ 10.7 с — это разбор и компиляция 3D-моделей). Десктоп по заданию не трогали. Снизить можно, если грузить конфигуратор по клику «Открыть 3D», а не при прокрутке.
- **Главная, телефон, LCP 1.3 → 2.9 с.** Раньше LCP засчитывался по тексту прелоадера, который держал экран ~7.6 с. Теперь на телефоне прелоадер ~1.7 с, и LCP — это реальное фото в hero. Для человека страница стала доступна примерно на 6 с раньше.

## 3. Метаданные по страницам (HTML от сервера)

| Page | HTTP | Title (len) | Desc len* | Canonical | OG (of 3) | Twitter | H1 | img / no-alt | JSON-LD | Crawlable links | robots |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 200 | DRAXLER — Bespoke Forged Wheels \| Custom Monoblock & Multi-Piece | 161 | ✓ | 3 | large | 1 | 16 / 0 | 2 | 13 | index, follow |
| `/catalog` | 200 | Forged Wheel Catalog — Luxury, Off-Road & Sport Series \| DRAXLER | 164 | ✓ | 3 | large | 1 | 48 / 0 | 4 | 34 | index, follow |
| `/catalog/vip` | 200 | Luxury Forged Wheels for Executive Saloons & SUVs \| DRAXLER | 165 | ✓ | 3 | large | 1 | 30 / 0 | 4 | 24 | index, follow |
| `/catalog/vip/drx-101` | 200 | DRX-101 Forged Wheel — Luxury series \| DRAXLER | 147 | ✓ | 3 | large | 1 | 2 / 0 | 4 | 13 | index, follow |
| `/catalog/sport` | 200 | Sport Forged Wheels for Supercars & Track \| DRAXLER | 151 | ✓ | 3 | large | 1 | 24 / 0 | 4 | 21 | index, follow |
| `/projects` | 200 | Our Projects — Forged Wheel Fitment Studies \| DRAXLER | 144 | ✓ | 3 | large | 1 | 16 / 0 | 4 | 11 | index, follow |
| `/projects/g-wagon` | 200 | G-Wagon Forged Wheels — Fitment Guide & 3D Configurator \| DRAXLER | 156 | ✓ | 3 | large | 1 | 11 / 0 | 4 | 16 | index, follow |
| `/blog` | 200 | Blog — Projects, New Cars & Wheel Engineering \| DRAXLER | 147 | ✓ | 3 | large | 1 | 8 / 0 | 4 | 18 | index, follow |
| `/blog/inside-the-draxler-g-wagon-study` | 200 | Inside the DRAXLER G‑Wagon Study \| DRAXLER | 148 | ✓ | 3 | large | 1 | 5 / 0 | 4 | 19 | index, follow |
| `/this-page-does-not-exist` | 404 | — | — | — | — | — | 1 | — | 2 | 0 | noindex |

\* Длина считается по HTML, где `&` и `"` записаны как `&amp;` / `&quot;`. Видимый текст в Google укладывается в 160 символов (обрезка в `clampDescription`).

| Файл | HTTP | Размер |
|---|---|---|
| `/robots.txt` | 200 | 119 Б |
| `/sitemap.xml` | 200 | 15 КБ |
| `/manifest.webmanifest` | 200 | 353 Б |
| `/icon.svg` | 200 | 252 Б |
| `/apple-icon` | 200 | 2.3 КБ |
| `/opengraph-image.jpg` | 200 | 66 КБ |

## 4. Что сделано

**Индексация**
- `src/app/robots.ts`: разрешено всё, кроме `/api/`, указан sitemap.
- `src/app/sitemap.ts`: главная, каталог, 3 категории, все статичные диски (с картинками), проекты, G-Wagon, блог, 8 статей и диски из Supabase. Пересобирается раз в сутки.
- Настоящий 404 для несуществующих категорий и дисков. Если Supabase недоступна, реальный товар **не** получает 404 и рендерится как обычно.

**Метаданные** (`src/lib/seo.ts → pageMetadata`)
- `metadataBase` = `https://draxlerwheels.com`; домен меняется через переменную окружения `NEXT_PUBLIC_SITE_URL`.
- Уникальные title, description, keywords, canonical, Open Graph и Twitter для каждого раздела, категории, диска и статьи. У статей `og:type=article` с датой, автором и тегами.
- Клиентские страницы получили тонкие серверные обёртки `page.tsx`, а их код переехал в `*Client.tsx`. Разметка и анимации не изменились.
- `theme-color`, `manifest`, SVG-иконка, apple-touch-icon, OG-картинка 1200×630 в фирменном стиле.

**Структурированные данные (JSON-LD)**
- Везде: `Organization` (контакты, Instagram) + `WebSite`.
- Каталог и категории: `CollectionPage` + `ItemList`. Диск: `Product` (бренд, материал, размеры, фото). Проекты: `ItemList`. G-Wagon: `FAQPage` (4 вопроса из блока Q&A). Блог: `Blog`. Статья: `BlogPosting`.
- `BreadcrumbList` на всех внутренних страницах.

**Ссылки и доступность**
- Меню (ПК и мобильное) сделано из `<a href>`, плавный скролл сохранён; Ctrl/Cmd-клик открывает в новой вкладке.
- У кнопок аккордеона в мобильном меню появились `aria-label` и `aria-expanded`; у WeChat убран `href="#"`.
- H1 на `/catalog`.

**Скорость и стабильность**
- Исправлено падение 3D на Next 16: React 19.2, `@react-three/fiber` 9, `@react-three/drei` 10.
- На G-Wagon фото переведены на `next/image` (WebP/AVIF и адаптивные размеры вместо PNG по 2–2.5 МБ).
- Серверные запросы к Supabase для SEO идут через REST с кэшем на час, без WebSocket-клиента, который падает на Node 20.

## 5. Что осталось и рекомендации

1. **Supabase во время проверки отвечала ошибкой** (`statement timeout`, ~49 с даже на простой `select`). Поэтому в этом прогоне в sitemap 56 URL, а при живой базе было 177. Стоит проверить нагрузку и индексы на таблице `products`: от этого зависит и каталог на сайте.
2. **`/catalog` на телефоне: LCP ~13 с.** Причина — тяжёлые PNG дисков и клиентская подгрузка товаров из Supabase. Следующий шаг: перегнать `public/catalog/**/*.png` в WebP и рендерить список товаров на сервере.
3. В `Product` нет `offers` (цены). Google не покажет «товарный» сниппет с ценой, пока не будет реальной цены или формата «от X». Придумывать цену мы не стали.
4. После деплоя: отправить `https://draxlerwheels.com/sitemap.xml` в Google Search Console (файл верификации уже лежит в `public/`), а превью проверить через Rich Results Test и отладчик Facebook/WhatsApp.
5. Сайт только на английском. Под русскоязычный трафик (Казахстан, Россия) стоит сделать версию `/ru` с `hreflang`. Это отдельная задача.
