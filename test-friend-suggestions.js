const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFriendSuggestions() {
  try {
    // Tüm kullanıcıları listele
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        goalWeight: true,
        city: true,
        _count: {
          select: {
            followers: true,
            plans: true,
          },
        },
      },
      take: 10,
    });

    console.log('=== ALL USERS ===');
    allUsers.forEach(user => {
      console.log(`\nName: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Image: ${user.image}`);
      console.log(`Role: ${user.role}`);
      console.log(`Goal Weight: ${user.goalWeight}`);
      console.log(`City: ${user.city}`);
      console.log(`Followers: ${user._count.followers}`);
      console.log(`Plans: ${user._count.plans}`);
    });

    // Admin kullanıcısını bul
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    console.log('\n=== ADMIN USER ===');
    console.log(JSON.stringify(admin, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFriendSuggestions();
