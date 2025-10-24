const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllAvatars() {
  try {
    // Yanlış path'e sahip kullanıcıları bul ve düzelt
    const usersWithWrongPath = await prisma.user.findMany({
      where: {
        image: {
          startsWith: '/uploads/avatars/'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    console.log('Users with wrong avatar path:', usersWithWrongPath.length);

    for (const user of usersWithWrongPath) {
      console.log(`\nFixing: ${user.name} (${user.email})`);
      console.log(`Old path: ${user.image}`);
      
      // /uploads/avatars/ path'ini /avatars/ olarak değiştir
      const newPath = user.image.replace('/uploads/avatars/', '/avatars/');
      console.log(`New path: ${newPath}`);

      await prisma.user.update({
        where: { id: user.id },
        data: { image: newPath }
      });

      console.log('✓ Fixed!');
    }

    console.log('\n=== DONE ===');
    console.log(`Fixed ${usersWithWrongPath.length} users`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAvatars();
