// Postbuild: generate static /p/<anchor>/index.html pages with per-product Open Graph tags,
// so shared product links render a rich preview (photo, name, price) in WhatsApp etc.
// Product data is parsed from src/products.tsx; OG images come from public/og/ (scripts/make-og.py).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync('src/products.tsx', 'utf8');
const template = readFileSync('dist/index.html', 'utf8');
const SITE = 'https://branditems.in';

const unescape = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const entries = [];
for (const m of SRC.matchAll(/p\((\d+), "((?:[^"\\]|\\.)*)", '(Watch|Sunglass|Accessories)', "((?:[^"\\]|\\.)*)"/g)) {
    entries.push({ anchor: 'bi' + m[1], name: unescape(m[2]), cat: m[3], price: unescape(m[4]) });
}
for (const m of SRC.matchAll(/q\((\d+), "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"/g)) {
    entries.push({ anchor: 'bi' + m[1], name: unescape(m[2]), cat: 'Sunglass', price: unescape(m[3]) });
}

const catLabel = (c) => (c === 'Watch' ? 'Watch' : c === 'Sunglass' ? 'Sunglasses' : 'Accessories');

let made = 0;
for (const e of entries) {
    const title = `${e.name} - ${e.price} | BRANDITEMS.IN`;
    const desc = `${catLabel(e.cat)} · ${e.price} · COD available · Order on WhatsApp`;
    const url = `${SITE}/p/${e.anchor}`;
    const img = `${SITE}/og/${e.anchor}.jpg`;
    const meta =
        `<meta property="og:type" content="product"/>` +
        `<meta property="og:site_name" content="BRANDITEMS.IN"/>` +
        `<meta property="og:title" content="${esc(title)}"/>` +
        `<meta property="og:description" content="${esc(desc)}"/>` +
        `<meta property="og:url" content="${url}"/>` +
        `<meta property="og:image" content="${img}"/>` +
        `<meta name="twitter:card" content="summary_large_image"/>` +
        `<meta name="twitter:title" content="${esc(title)}"/>` +
        `<meta name="twitter:description" content="${esc(desc)}"/>` +
        `<meta name="twitter:image" content="${img}"/>`;
    const html = template
        .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
        .replace('</head>', meta + '</head>');
    const dir = join('dist', 'p', e.anchor);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
    made++;
}
console.log(`prerendered ${made} product pages`);
