import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Basit seed başlıyor...');

  // Admin kullanıcısı
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zayiflamaplanim.com' },
    update: {},
    create: {
      id: 'admin-user-id-123',
      email: 'admin@zayiflamaplanim.com',
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Admin: admin@zayiflamaplanim.com / admin123');

  console.log('🎉 Seed tamamlandı! Artık giriş yapabilirsiniz.');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
