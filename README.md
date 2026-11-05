# Shekarisma API

Express 5 + PostgreSQL + Prisma backend for the Shekarisma React/Vite storefront.

## Local setup

1. Install Node.js 20.19+ and PostgreSQL.
2. Copy `.env.example` to `.env` and fill in the database URL, a random 32+ character JWT secret, frontend origin, and admin credentials.
3. From this directory run:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

The API runs at `http://localhost:4000`. Health check: `/api/health`.

## Deploy

Deploy this folder as a Node web service (Render, Railway, or another Node host). Set the service root directory to `server`, build command to `npm install && npx prisma generate`, and start command to `npx prisma migrate deploy && npm run prisma:seed && npm start`. Add all variables from `.env.example` in the host dashboard. Provision a managed PostgreSQL database and use its connection string as `DATABASE_URL`.

For GitHub Pages at `https://farzanbrave-collab.github.io/shekarisma-store/`, set `FRONTEND_ORIGIN` to `https://farzanbrave-collab.github.io`. Use HTTPS for the API and keep `COOKIE_SAME_SITE=none` in production. Never commit `.env` or real secrets.

## API

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`
- Admin: `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`
- `POST /api/orders`, `GET /api/orders/mine`
- Admin: `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`

Authentication uses an HttpOnly JWT cookie. Admin access is assigned only to the account configured by `ADMIN_EMAIL` and seeded by `npm run prisma:seed`. Order creation checks product availability and decrements stock inside a database transaction.

## Important

This is the backend foundation; it does not yet connect the existing React UI to these endpoints. Payment processing, email/SMS notifications, image uploads, and production security review still need to be added before accepting real customer payments.
