const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zayiflamaplanim.com' },
    update: {
      role: 'ADMIN',
      passwordHash: hashedPassword
    },
    create: {
      email: 'admin@zayiflamaplanim.com',
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('\n✅ Admin kullanıcı oluşturuldu!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email: admin@zayiflamaplanim.com');
  console.log('🔑 Şifre: admin123');
  console.log('👤 Rol:', admin.role);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

createAdmin()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error('❌ Hata:', e);
    prisma.$disconnect();
    process.exit(1);
  });
