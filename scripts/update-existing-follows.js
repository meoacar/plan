// Mevcut takipleri ACCEPTED durumuna güncelle
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingFollows() {
  try {
    console.log('Mevcut takipler güncelleniyor...');

    const result = await prisma.follow.updateMany({
      where: {
        status: 'PENDING',
        // Eski kayıtlar (bugünden önce oluşturulmuş)
        createdAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    console.log(`✅ ${result.count} takip kaydı ACCEPTED olarak güncellendi`);

    // İstatistikleri göster
    const stats = await prisma.follow.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\nTakip durumu istatistikleri:');
    stats.forEach((stat) => {
      console.log(`  ${stat.status}: ${stat._count}`);
    });
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingFollows();
