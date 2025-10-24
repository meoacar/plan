const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function nullifyFakeAdminImage() {
  try {
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { image: null }
    });
    console.log('✓ Sahte admin image null yapıldı - artık default avatar gösterilecek');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

nullifyFakeAdminImage();
