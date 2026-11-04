# Shekarisma — Lighting Store Demo

A responsive Persian/English lighting-store frontend prototype built with React, Vite and CSS.

## Included in this demo
- Persian RTL and English LTR language switch
- Dark/light theme switch
- Purple luxury/minimal visual direction
- Responsive landing page and product catalog
- Product search and category filters
- Demo cart with quantity controls
- Admin dashboard: add, edit and delete products
- Basic brand appearance settings
- Local persistence with `localStorage`
- SEO foundation: semantic sections, title, description, Open Graph basics, alt text, lazy-loaded product images

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```

## Demo mode — important
This version is a **frontend prototype**. Product edits, cart and appearance settings are stored in the current browser using `localStorage`. This is useful for demonstrating the interface, but it is not a secure multi-user store.

Before going live, implement:
1. Node.js + Express API
2. PostgreSQL database and Prisma schema/migrations
3. Admin authentication, password hashing, sessions/cookies and role-based authorization
4. Server-side product/order validation and inventory management
5. Image storage (S3-compatible storage or Cloudinary)
6. Real payment gateway integration and verified payment callbacks
7. Server-rendered or prerendered product pages, sitemap.xml, robots.txt, canonical URLs and structured Product/Organization/Breadcrumb JSON-LD
8. Privacy policy, terms, shipping/returns pages, contact details and real business information

Never put admin credentials or payment secrets in frontend code. Do not expose the demo admin dashboard publicly as a production admin system.

## Customization
- Starter products: `src/data.js`
- Storefront and admin UI: `src/App.jsx`
- Design tokens and responsive styles: `src/styles.css`
- SEO metadata: `index.html`

Replace demo product images, contact details, product copy, prices and brand assets with approved real content before launch.
