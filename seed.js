import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  { name: 'آویز آتریوم', nameEn: 'Atrium Pendant', slug: 'atrium-pendant', category: 'آویز', price: 4850000, oldPrice: 5600000, stock: 8, badge: 'پرفروش', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85', description: 'فرمی مجسمه‌وار با نور گرم و پخش یکنواخت؛ مناسب میز ناهارخوری و فضاهای شاخص.' },
  { name: 'چراغ رومیزی نوا', nameEn: 'Nova Table Lamp', slug: 'nova-table-lamp', category: 'رومیزی', price: 3290000, stock: 10, badge: 'جدید', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85&sat=-30', description: 'چراغی مینیمال برای میز کار، میز کنار تخت و گوشه‌های دنج خانه.' },
  { name: 'دیوارکوب آرکا', nameEn: 'Arca Wall Light', slug: 'arca-wall-light', category: 'دیواری', price: 2180000, stock: 12, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=85', description: 'خطوط ساده و نور ملایم برای راهرو، اتاق خواب و دیوارهای دکوراتیو.' },
  { name: 'چراغ ایستاده لونا', nameEn: 'Luna Floor Lamp', slug: 'luna-floor-lamp', category: 'ایستاده', price: 6950000, oldPrice: 7600000, stock: 5, badge: 'منتخب', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85&crop=entropy', description: 'ترکیب تناسبات ظریف و نور محیطی برای ساختن فضایی آرام و لوکس.' },
  { name: 'اسپات خطی لاین', nameEn: 'Line Spot', slug: 'line-spot', category: 'سقفی', price: 1590000, stock: 20, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=85&fit=crop', description: 'راهکاری ساده برای نورپردازی متمرکز و معماری داخلی معاصر.' },
  { name: 'آویز اورب', nameEn: 'Orb Pendant', slug: 'orb-pendant', category: 'آویز', price: 3890000, stock: 7, badge: 'پیشنهاد ما', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85&blur=0', description: 'حجمی نرم و چشم‌نواز که به‌تنهایی هم نقش یک عنصر دکوراتیو را دارد.' }
];

try {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: { name: process.env.ADMIN_NAME || 'Store Admin', passwordHash, role: 'ADMIN' },
      create: { name: process.env.ADMIN_NAME || 'Store Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash, role: 'ADMIN' }
    });
  }
  for (const product of products) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: {}, create: product });
  }
  console.log('Seed completed.');
} finally {
  await prisma.$disconnect();
}
