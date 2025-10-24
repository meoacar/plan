const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function transferAndDeleteFakeAdmin() {
  try {
    // Gerçek admin'i bul
    const realAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zayiflamaplanim.com' },
      select: { id: true, name: true, email: true }
    });

    // Sahte admin'i bul
    const fakeAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: { id: true, name: true, email: true }
    });

    if (!realAdmin) {
      console.log('Gerçek admin bulunamadı!');
      return;
    }

    if (!fakeAdmin) {
      console.log('Sahte admin bulunamadı.');
      return;
    }

    console.log('Gerçek Admin:', realAdmin);
    console.log('Sahte Admin:', fakeAdmin);

    // SiteSettings'i gerçek admin'e transfer et
    const siteSettings = await prisma.siteSettings.findMany({
      where: { updatedBy: fakeAdmin.id }
    });

    console.log(`\nTransferring ${siteSettings.length} SiteSettings...`);

    for (const setting of siteSettings) {
      await prisma.siteSettings.update({
        where: { id: setting.id },
        data: { updatedBy: realAdmin.id }
      });
    }

    console.log('✓ SiteSettings transferred!');

    // Sahte admin'in diğer ilişkilerini kontrol et ve transfer et
    const plans = await prisma.plan.count({ where: { userId: fakeAdmin.id } });
    console.log(`\nPlans: ${plans}`);

    if (plans > 0) {
      await prisma.plan.updateMany({
        where: { userId: fakeAdmin.id },
        data: { userId: realAdmin.id }
      });
      console.log('✓ Plans transferred!');
    }

    // ActivityLog'ları transfer et
    const activityLogs = await prisma.activityLog.count({ where: { userId: fakeAdmin.id } });
    console.log(`\nActivityLogs: ${activityLogs}`);

    if (activityLogs > 0) {
      await prisma.activityLog.updateMany({
        where: { userId: fakeAdmin.id },
        data: { userId: realAdmin.id }
      });
      console.log('✓ ActivityLogs transferred!');
    }

    // Diğer tüm ilişkileri sil (cascade delete için)
    console.log('\nDeleting related records...');
    
    await prisma.comment.deleteMany({ where: { userId: fakeAdmin.id } });
    await prisma.like.deleteMany({ where: { userId: fakeAdmin.id } });
    await prisma.favorite.deleteMany({ where: { userId: fakeAdmin.id } });
    await prisma.follow.deleteMany({ where: { OR: [{ followerId: fakeAdmin.id }, { followingId: fakeAdmin.id }] } });
    
    console.log('✓ Related records deleted!');

    // Şimdi sahte admin'i sil
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

transferAndDeleteFakeAdmin();
