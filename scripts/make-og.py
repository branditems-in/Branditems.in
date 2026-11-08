#!/usr/bin/env python3
"""Generate per-product Open Graph images into public/og/ from product data in src/products.tsx."""
import re, os
from PIL import Image

SRC = open('src/products.tsx').read()
OUT = 'public/og'
os.makedirs(OUT, exist_ok=True)

def unescape(s):
    return s.replace('\\"', '"').replace('\\\\', '\\')

entries = []
for m in re.finditer(r'p\((\d+), "((?:[^"\\]|\\.)*)", \'(Watch|Sunglass|Accessories)\', "((?:[^"\\]|\\.)*)"', SRC):
    pid, name, cat, price = m.groups()
    block = SRC[m.end():m.end()+2500]
    ph = re.search(r'\[\[(\d+),(\d+),(\d+),(\d+),(\d+)\]', block)
    entries.append((pid, unescape(name), cat, unescape(price), ('sheet',) + ph.groups() if ph else None))
for m in re.finditer(r'q\((\d+), "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"', SRC):
    pid, name, price = m.groups()
    block = SRC[m.end():m.end()+1500]
    ph = re.search(r'\[\["([^"]+)",(\d+),(\d+)\]', block)
    entries.append((pid, unescape(name), 'Sunglass', unescape(price), ('file', ph.group(1)) if ph else None))

for m in re.finditer(r'qw\((\d+), "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)"', SRC):
    pid, name, price = m.groups()
    block = SRC[m.end():m.end()+2500]
    ph = re.search(r'\[\["([^"]+)",(\d+),(\d+)\]', block)
    entries.append((pid, unescape(name), 'Watch', unescape(price), ('file', ph.group(1)) if ph else None))

made = skipped = failed = 0
for pid, name, cat, price, photo in entries:
    out = f'{OUT}/bi{pid}.jpg'
    if os.path.exists(out):
        skipped += 1
        continue
    try:
        if photo[0] == 'sheet':
            _, s, x, y, w, h = photo
            im = Image.open(f'public/sheets/sheet-{int(s):04d}.webp').convert('RGB').crop((int(x), int(y), int(x)+int(w), int(y)+int(h)))
        else:
            im = Image.open(f'public/{photo[1]}').convert('RGB')
        im.thumbnail((800, 800), Image.LANCZOS)
        im.save(out, 'JPEG', quality=82)
        made += 1
    except Exception as e:
        failed += 1
        print('FAIL', pid, name, e)
print(f'total={len(entries)} made={made} skipped={skipped} failed={failed}')
