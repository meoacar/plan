const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminAvatar() {
  try {
    // Admin kullanıcılarını bul
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, image: true }
    });

    console.log('Admin users:', JSON.stringify(admins, null, 2));

    // Admin'in image'ini güncelle
    if (admins.length > 0) {
      const admin = admins[0];
      console.log('\nUpdating admin avatar from:', admin.image);
      console.log('To: /avatars/3.png');

      const updated = await prisma.user.update({
        where: { id: admin.id },
        data: { image: '/avatars/3.png' }
      });

      console.log('\nUpdated successfully!');
      console.log('New image:', updated.image);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminAvatar();
