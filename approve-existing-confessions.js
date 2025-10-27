// Mevcut itirafları otomatik olarak onayla
// Bu script sadece bir kez çalıştırılmalı

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveExistingConfessions() {
  try {
    console.log('🔍 Mevcut itiraflar kontrol ediliyor...');

    // Status'u null veya undefined olan itirafları bul
    const pendingConfessions = await prisma.confession.findMany({
      where: {
        OR: [
          { status: null },
          { status: 'PENDING' }
        ]
      }
    });

    console.log(`📊 ${pendingConfessions.length} adet onay bekleyen itiraf bulundu.`);

    if (pendingConfessions.length === 0) {
      console.log('✅ Tüm itiraflar zaten onaylanmış!');
      return;
    }

    // Tüm bekleyen itirafları onayla
    const result = await prisma.confession.updateMany({
      where: {
        OR: [
          { status: null },
          { status: 'PENDING' }
        ]
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      }
    });

    console.log(`✅ ${result.count} adet itiraf başarıyla onaylandı!`);
    console.log('🎉 İşlem tamamlandı!');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
approveExistingConfessions();
