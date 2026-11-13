// Static SEO audit against a running server.
// Usage: node tools/seo-audit.mjs http://localhost:3100 > report-fragment.md
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const PAGES = [
    "/",
    "/catalog",
    "/catalog/vip",
    "/catalog/vip/drx-101",
    "/catalog/sport",
    "/projects",
    "/projects/g-wagon",
    "/blog",
    "/blog/inside-the-draxler-g-wagon-study",
    "/this-page-does-not-exist",
];

const pick = (html, re) => {
    const m = html.match(re);
    return m ? m[1].trim() : "";
};
const meta = (html, attr, name) =>
    pick(html, new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, "i")) ||
    pick(html, new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, "i"));
const count = (html, re) => (html.match(re) || []).length;

async function audit(path) {
    const res = await fetch(base + path, { redirect: "manual" });
    const html = await res.text();
    const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
    const desc = meta(html, "name", "description");
    const canonical = pick(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
    const imgs = html.match(/<img\b[^>]*>/gi) || [];
    const imgsNoAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;
    const links = (html.match(/<a\b[^>]*href="(\/[^"#]*)"/gi) || []).length;
    return {
        path,
        status: res.status,
        title,
        titleLen: title.length,
        descLen: desc.length,
        canonical: canonical ? "yes" : "—",
        og: [meta(html, "property", "og:title"), meta(html, "property", "og:description"), meta(html, "property", "og:image")].filter(Boolean).length,
        twitter: meta(html, "name", "twitter:card") || "—",
        h1: count(html, /<h1\b/gi),
        imgs: imgs.length,
        imgsNoAlt,
        jsonLd: count(html, /application\/ld\+json/gi),
        internalLinks: links,
        lang: pick(html, /<html[^>]*lang="([^"]*)"/i) || "—",
        robots: meta(html, "name", "robots") || "—",
        htmlKb: Math.round(html.length / 1024),
    };
}

async function head(path) {
    try {
        const res = await fetch(base + path);
        const body = await res.text();
        return { path, status: res.status, bytes: body.length };
    } catch (e) {
        return { path, status: "ERR", bytes: 0 };
    }
}

const rows = [];
for (const p of PAGES) rows.push(await audit(p));
const files = await Promise.all(["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/icon.svg", "/opengraph-image.jpg", "/apple-icon", "/favicon.ico"].map(head));

console.log(`| Page | HTTP | Title (len) | Desc len | Canonical | OG tags (of 3) | Twitter | H1 | img / no-alt | JSON-LD | Crawlable links | robots | HTML KB |`);
console.log(`|---|---|---|---|---|---|---|---|---|---|---|---|---|`);
for (const r of rows) {
    console.log(`| \`${r.path}\` | ${r.status} | ${r.title.replace(/\|/g, "/").slice(0, 70)} (${r.titleLen}) | ${r.descLen} | ${r.canonical} | ${r.og} | ${r.twitter} | ${r.h1} | ${r.imgs} / ${r.imgsNoAlt} | ${r.jsonLd} | ${r.internalLinks} | ${r.robots} | ${r.htmlKb} |`);
}
console.log("");
console.log(`| File | HTTP | Bytes |`);
console.log(`|---|---|---|`);
for (const f of files) console.log(`| \`${f.path}\` | ${f.status} | ${f.bytes} |`);
const titles = rows.filter((r) => r.status === 200).map((r) => r.title);
const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
console.log("");
console.log(`Duplicate titles across 200-pages: **${new Set(dupes).size}** ${dupes.length ? "(" + [...new Set(dupes)].join("; ") + ")" : ""}`);
console.log(`html lang: ${rows[0].lang}`);
