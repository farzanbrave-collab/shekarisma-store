import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const isProd = process.env.NODE_ENV === 'production';
const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim());

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, cb) {
    if (!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const tokenOptions = { httpOnly: true, secure: isProd, sameSite: cookieSameSite, path: '/' };
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
function signToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
const auth = asyncRoute(async (req, res, next) => {
  const token = req.cookies.sk_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) return res.status(401).json({ error: 'برای ادامه وارد حساب کاربری شوید.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'نشست معتبر نیست.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'نشست منقضی یا نامعتبر است.' });
  }
});
const admin = (req, res, next) => req.user?.role === 'ADMIN'
  ? next()
  : res.status(403).json({ error: 'دسترسی مدیر لازم است.' });

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(190),
  password: z.string().min(8).max(100)
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(100) });
const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  nameEn: z.string().trim().max(160).optional().nullable(),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1).max(80),
  description: z.string().max(3000).optional(),
  image: z.string().url().or(z.literal('')).optional(),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative(),
  badge: z.string().max(60).optional().nullable(),
  active: z.boolean().optional()
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'shekarisma-api' }));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const email = data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است.' });
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({ data: { name: data.name, email, passwordHash } });
  res.cookie('sk_session', signToken(user), { ...tokenOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(201).json({ user: publicUser(user) });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
  res.cookie('sk_session', signToken(user), { ...tokenOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('sk_session', { ...tokenOptions, maxAge: undefined });
  res.json({ ok: true });
});
app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get('/api/products', asyncRoute(async (req, res) => {
  const { q, category } = req.query;
  const products = await prisma.product.findMany({
    where: { active: true, ...(category ? { category: String(category) } : {}),
      ...(q ? { OR: [{ name: { contains: String(q), mode: 'insensitive' } }, { nameEn: { contains: String(q), mode: 'insensitive' } }] } : {}) },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ products });
}));
app.get('/api/products/:id', asyncRoute(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], active: true } });
  if (!product) return res.status(404).json({ error: 'محصول پیدا نشد.' });
  res.json({ product });
}));

app.get('/api/admin/products', auth, admin, asyncRoute(async (req, res) => {
  res.json({ products: await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }) });
}));
app.post('/api/admin/products', auth, admin, asyncRoute(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data });
  res.status(201).json({ product });
}));
app.patch('/api/admin/products/:id', auth, admin, asyncRoute(async (req, res) => {
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json({ product });
}));
app.delete('/api/admin/products/:id', auth, admin, asyncRoute(async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ product });
}));

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  address: z.string().trim().min(8).max(1000),
  postalCode: z.string().trim().max(20).optional(),
  note: z.string().trim().max(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(50) })).min(1).max(50)
});
app.post('/api/orders', auth, asyncRoute(async (req, res) => {
  const data = orderSchema.parse(req.body);
  const order = await prisma.$transaction(async tx => {
    const ids = [...new Set(data.items.map(i => i.productId))];
    const products = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
    if (products.length !== ids.length) throw Object.assign(new Error('یک یا چند محصول موجود نیست.'), { status: 400 });
    const byId = new Map(products.map(p => [p.id, p]));
    let total = 0;
    const rows = data.items.map(item => {
      const product = byId.get(item.productId);
      if (product.stock < item.quantity) throw Object.assign(new Error(`موجودی ${product.name} کافی نیست.`), { status: 409 });
      total += product.price * item.quantity;
      return { productId: product.id, productName: product.name, unitPrice: product.price, quantity: item.quantity };
    });
    for (const item of data.items) {
      const changed = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity }, active: true }, data: { stock: { decrement: item.quantity } } });
      if (changed.count !== 1) throw Object.assign(new Error('موجودی محصول تغییر کرده؛ دوباره تلاش کنید.'), { status: 409 });
    }
    return tx.order.create({ data: {
      userId: req.user.id, total, customerName: data.customerName, phone: data.phone,
      address: data.address, postalCode: data.postalCode, note: data.note,
      items: { create: rows }
    }, include: { items: true } });
  });
  res.status(201).json({ order });
}));
app.get('/api/orders/mine', auth, asyncRoute(async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
}));
app.get('/api/admin/orders', auth, admin, asyncRoute(async (req, res) => {
  const orders = await prisma.order.findMany({ include: { user: { select: { id: true, name: true, email: true } }, items: true }, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
}));
app.patch('/api/admin/orders/:id/status', auth, admin, asyncRoute(async (req, res) => {
  const parsed = z.object({ status: z.enum(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']) }).parse(req.body);
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: parsed.status }, include: { items: true } });
  res.json({ order });
}));

app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'اطلاعات ارسال‌شده معتبر نیست.', details: err.issues });
  if (err.code === 'P2002') return res.status(409).json({ error: 'این مقدار قبلاً ثبت شده است.' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'مورد درخواستی پیدا نشد.' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'خطای داخلی سرور.' : err.message });
});

app.listen(PORT, () => console.log(`Shekarisma API listening on ${PORT}`));
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
