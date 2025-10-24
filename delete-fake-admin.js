const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteFakeAdmin() {
  try {
    // Sahte admin'i bul (admin@example.com)
    const fakeAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    if (!fakeAdmin) {
      console.log('Sahte admin bulunamadı.');
      return;
    }

    console.log('Sahte admin bulundu:');
    console.log(JSON.stringify(fakeAdmin, null, 2));

    // Sil
    await prisma.user.delete({
      where: { id: fakeAdmin.id }
    });

    console.log('\n✓ Sahte admin silindi!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteFakeAdmin();
