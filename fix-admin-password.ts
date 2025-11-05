import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.update({
    where: { email: 'admin@zayiflamaplanim.com' },
    data: {
      passwordHash: hashedPassword,
    },
  });
  
  console.log('✅ Admin şifresi güncellendi:', admin.email);
  console.log('📧 Email: admin@zayiflamaplanim.com');
  console.log('🔑 Şifre: admin123');
  
  // Test et
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('✓ Şifre testi:', isValid ? 'BAŞARILI' : 'BAŞARISIZ');
}

main()
  .finally(() => prisma.$disconnect());
