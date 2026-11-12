// Postbuild: generate static /p/<anchor>/index.html pages with per-product Open Graph tags,
// so shared product links render a rich preview (photo, name, price) in WhatsApp etc.
// Product data is loaded from src/products.tsx; OG images come from public/og/ (scripts/make-og.py).
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

// Read the same product data and canonical-ID function as the React app.
// Transpile to a temporary sibling module so React resolves from node_modules.
const modulePath = new URL('./.products-prerender.mjs', import.meta.url);
writeFileSync(modulePath, ts.transpileModule(readFileSync('src/products.tsx', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React },
}).outputText);
let products, productAnchor;
try { ({ products, productAnchor } = await import(modulePath.href)); }
finally { unlinkSync(modulePath); }
const template = readFileSync('dist/index.html', 'utf8');
const SITE = 'https://branditems.in';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const entries = [];
const seen = new Set();
for (const product of products) {
    const canonical = productAnchor(product);
    // bi aliases preserve every previously published product URL.
    for (const anchor of new Set([canonical, 'bi' + product.id])) {
        if (seen.has(anchor)) throw new Error(`Conflicting product URL: ${anchor}`);
        seen.add(anchor);
        entries.push({ anchor, canonical, image: 'bi' + product.id, name: product.name,
            cat: product.category, price: product.price });
    }
}

const catLabel = (c) => (c === 'Watch' ? 'Watch' : c === 'Sunglass' ? 'Sunglasses' : 'Accessories');

let made = 0;
for (const e of entries) {
    const title = `${e.name} - ${e.price} | BRANDITEMS.IN`;
    const desc = `${catLabel(e.cat)} · ${e.price} · COD available · Order on WhatsApp`;
    const url = `${SITE}/p/${e.canonical}`;
    const img = `${SITE}/og/${e.image}.jpg`;
    if (!existsSync(`dist/og/${e.image}.jpg`)) throw new Error(`Missing OG image: ${e.image}`);
    const meta =
        `<link rel="canonical" href="${url}"/>` +
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
        .replace(/<meta (?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*\/>/g, '')
        .replace('<head>', '<head><base href="/">')
        .replace('</head>', meta + '</head>');
    const dir = join('dist', 'p', e.anchor);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
    made++;
}
console.log(`prerendered ${made} product pages`);
