const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPartnerships() {
  try {
    // Admin kullanıcısını bul (username'e göre)
    const admin = await prisma.user.findFirst({
      where: { username: 'admin' }
    });
    
    // Mehmet ACAR'ı bul
    const mehmet = await prisma.user.findFirst({
      where: { name: 'Mehmet ACAR' }
    });
    
    console.log('Admin:', admin ? { id: admin.id, name: admin.name, email: admin.email } : 'Bulunamadı');
    console.log('Mehmet:', mehmet ? { id: mehmet.id, name: mehmet.name, email: mehmet.email } : 'Bulunamadı');
    
    if (admin && mehmet) {
      // Aralarındaki partnershipleri bul
      const partnerships = await prisma.accountabilityPartnership.findMany({
        where: {
          OR: [
            { requesterId: admin.id, partnerId: mehmet.id },
            { requesterId: mehmet.id, partnerId: admin.id }
          ]
        },
        include: {
          requester: { select: { name: true } },
          partner: { select: { name: true } }
        }
      });
      
      console.log('\nPartnerships:', JSON.stringify(partnerships, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPartnerships();
