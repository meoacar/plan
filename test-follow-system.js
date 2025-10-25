// Takip sistemi test scripti
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFollowSystem() {
  try {
    console.log('🧪 Takip Sistemi Test Ediliyor...\n');

    // 1. Follow modelini kontrol et
    console.log('1️⃣ Follow modeli kontrol ediliyor...');
    const followCount = await prisma.follow.count();
    console.log(`   ✅ Follow kayıt sayısı: ${followCount}`);

    // 2. Status enum'ını kontrol et
    console.log('\n2️⃣ Status değerleri kontrol ediliyor...');
    const follows = await prisma.follow.findMany({
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
      },
    });
    
    follows.forEach((follow, index) => {
      console.log(`   ${index + 1}. Status: ${follow.status}, Kabul: ${follow.acceptedAt ? 'Evet' : 'Hayır'}`);
    });

    // 3. Status'a göre grupla
    console.log('\n3️⃣ Status istatistikleri:');
    const stats = await prisma.follow.groupBy({
      by: ['status'],
      _count: true,
    });
    
    stats.forEach((stat) => {
      console.log(`   ${stat.status}: ${stat._count} kayıt`);
    });

    // 4. NotificationType enum'ını kontrol et
    console.log('\n4️⃣ Bildirim tipleri kontrol ediliyor...');
    const notificationTypes = await prisma.notification.findMany({
      select: { type: true },
      distinct: ['type'],
    });
    
    console.log(`   ✅ Mevcut bildirim tipleri: ${notificationTypes.length} farklı tip`);
    notificationTypes.forEach((notif) => {
      console.log(`      - ${notif.type}`);
    });

    console.log('\n✅ Tüm testler başarılı!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code) {
      console.error('   Hata kodu:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testFollowSystem();
