import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import ts from 'typescript';
const file = new URL('./.products-test.mjs', import.meta.url);
writeFileSync(file, ts.transpileModule(readFileSync('src/products.tsx', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React },
}).outputText);
let data;
try { data = await import(file.href); } finally { unlinkSync(file); }
const { products, productAnchor, productFromAnchor, waEnquiry } = data;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let count = 0;
for (const product of products) {
    const canonical = productAnchor(product);
    for (const anchor of new Set([canonical, 'bi' + product.id])) {
        assert.equal(productFromAnchor(anchor), product, `Client route ${anchor}`);
        const html = readFileSync(`dist/p/${anchor}/index.html`, 'utf8');
        assert(html.includes(`<title>${esc(product.name)} - ${esc(product.price)}`), `Title ${anchor}`);
        assert(html.includes(`property="og:title" content="${esc(product.name)} - ${esc(product.price)}`), `OG title ${anchor}`);
        assert(html.includes(`property="og:url" content="https://branditems.in/p/${canonical}"`), `OG URL ${anchor}`);
        assert(html.includes(`property="og:image" content="https://branditems.in/og/bi${product.id}.jpg"`), `OG image ${anchor}`);
        assert(existsSync(`dist/og/bi${product.id}.jpg`));
        count++;
    }
    const wa = new URL(waEnquiry(product));
    assert.equal(wa.pathname, '/917994800208');
    assert(wa.searchParams.get('text').includes(`/p/${canonical}`));
}
assert.equal(productFromAnchor('wm99999999'), undefined);
assert.equal(productFromAnchor('bi99999999'), undefined);
for (const anchor of ['wm18396', 'bi18396', 'bi19411', 'wm19411']) {
    const p = productFromAnchor(anchor);
    assert(p); console.log(`${anchor}: ${p.name}, ${p.price}, canonical ${productAnchor(p)}`);
}
console.log(`PASS: ${products.length} products, ${count} static/client routes, metadata, local OG images and WhatsApp links`);
