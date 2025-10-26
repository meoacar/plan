/**
 * Eksik Yorum Bildirimlerini Oluştur
 * 
 * Bu script, bildirim sistemi eklenmeden önce yapılmış yorumlar için
 * geriye dönük bildirim oluşturur.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMissingCommentNotifications() {
  console.log('🔍 Eksik yorum bildirimleri oluşturuluyor...\n');

  try {
    // Tüm yorumları al
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        plan: {
          select: {
            id: true,
            title: true,
            slug: true,
            userId: true,
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Toplam ${comments.length} yorum bulundu\n`);

    let created = 0;
    let skipped = 0;
    let selfComments = 0;

    for (const comment of comments) {
      // Kendi planına yorum yapanları atla
      if (comment.userId === comment.plan.userId) {
        selfComments++;
        continue;
      }

      // Bu yorum için zaten bildirim var mı kontrol et
      const existingNotification = await prisma.notification.findFirst({
        where: {
          type: 'PLAN_COMMENT',
          relatedId: comment.id,
          userId: comment.plan.userId
        }
      });

      if (existingNotification) {
        skipped++;
        continue;
      }

      // Bildirim oluştur
      await prisma.notification.create({
        data: {
          userId: comment.plan.userId,
          type: 'PLAN_COMMENT',
          title: 'Planınıza Yorum Yapıldı',
          message: `${comment.user.name} "${comment.plan.title}" planınıza yorum yaptı`,
          actionUrl: `/plan/${comment.plan.slug}#comments`,
          actorId: comment.userId,
          relatedId: comment.id,
          createdAt: comment.createdAt, // Yorumun tarihini kullan
        }
      });

      created++;
      console.log(`✅ Bildirim oluşturuldu: ${comment.user.name} → ${comment.plan.user.name}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 ÖZET:');
    console.log('='.repeat(60));
    console.log(`✅ Oluşturulan bildirim: ${created}`);
    console.log(`⏭️  Atlanan (zaten var): ${skipped}`);
    console.log(`👤 Kendi yorumu (atlandı): ${selfComments}`);
    console.log(`📊 Toplam yorum: ${comments.length}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingCommentNotifications();
