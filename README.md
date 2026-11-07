# BRANDITEMS.IN catalogue

Static product catalogue with search, collection filters, product photos and WhatsApp enquiries. No website checkout or payment processing.

## Local use

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

Upload the contents of `dist/` to a static web host. This repository does not activate hosting, change DNS, or enable GitHub Pages.

Product links in WhatsApp enquiries currently point to the existing public catalogue. Update `SITE_URL` in `src/products.tsx` only after the final domain is deployed and verified.

All product photographs are in `public/`. Product information, prices, replica notices and social destinations are in `src/products.tsx`.
