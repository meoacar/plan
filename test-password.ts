import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@zayiflamaplanim.com' },
  });
  
  if (!admin) {
    console.log('❌ Admin kullanıcısı bulunamadı');
    return;
  }
  
  console.log('Admin bulundu:', admin.email);
  console.log('Password hash var mı?', !!admin.passwordHash);
  
  if (admin.passwordHash) {
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
    console.log(`Şifre "${testPassword}" doğru mu?`, isValid);
    
    // Yeni hash oluştur ve karşılaştır
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Yeni hash:', newHash);
    const isNewValid = await bcrypt.compare(testPassword, newHash);
    console.log('Yeni hash doğru mu?', isNewValid);
  }
}

main()
  .finally(() => prisma.$disconnect());
