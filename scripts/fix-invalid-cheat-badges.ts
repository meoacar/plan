import { PrismaClient } from "@prisma/client";
import { differenceInDays } from "date-fns";

const prisma = new PrismaClient();

async function fixInvalidCheatBadges() {
  console.log("🔍 Geçersiz günah sayacı rozetleri kontrol ediliyor...\n");

  // Tüm günah sayacı rozetlerini al
  const cheatBadgeTypes = [
    "CHEAT_FREE_7_DAYS",
    "CHEAT_FREE_30_DAYS",
    "FAST_FOOD_FREE_30_DAYS",
  ] as const;

  const userBadges = await prisma.userBadge.findMany({
    where: {
      badge: {
        type: {
          in: cheatBadgeTypes as any,
        },
      },
    },
    include: {
      badge: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`📊 Toplam ${userBadges.length} rozet bulundu.\n`);

  let removedCount = 0;
  let refundedXP = 0;

  for (const userBadge of userBadges) {
    const userId = userBadge.userId;

    // İlk günah yemeği tarihini bul
    const firstCheat = await prisma.cheatMeal.findFirst({
      where: { userId },
      orderBy: { date: "asc" },
    });

    if (!firstCheat) {
      console.log(
        `⚠️  ${userBadge.user.name} - Hiç günah yemeği yok ama rozet var! Siliniyor...`
      );
      await prisma.userBadge.delete({
        where: { id: userBadge.id },
      });
      removedCount++;
      continue;
    }

    const daysSinceFirstCheat = differenceInDays(
      userBadge.earnedAt,
      new Date(firstCheat.date)
    );

    let shouldRemove = false;
    let reason = "";

    // 7 günlük rozetler için kontrol
    if (
      userBadge.badge.type === "CHEAT_FREE_7_DAYS" &&
      daysSinceFirstCheat < 7
    ) {
      shouldRemove = true;
      reason = `7 günlük rozet ama sadece ${daysSinceFirstCheat} gündür kullanıyor`;
    }

    // 30 günlük rozetler için kontrol
    if (
      (userBadge.badge.type === "CHEAT_FREE_30_DAYS" ||
        userBadge.badge.type === "FAST_FOOD_FREE_30_DAYS") &&
      daysSinceFirstCheat < 30
    ) {
      shouldRemove = true;
      reason = `30 günlük rozet ama sadece ${daysSinceFirstCheat} gündür kullanıyor`;
    }

    if (shouldRemove) {
      console.log(
        `❌ ${userBadge.user.name} - ${userBadge.badge.name}: ${reason}`
      );
      console.log(
        `   İlk kaçamak: ${firstCheat.date.toLocaleDateString()}, Rozet kazanma: ${userBadge.earnedAt.toLocaleDateString()}`
      );

      // Rozeti sil
      await prisma.userBadge.delete({
        where: { id: userBadge.id },
      });

      // XP'yi geri al
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            decrement: userBadge.badge.xpReward,
          },
        },
      });

      removedCount++;
      refundedXP += userBadge.badge.xpReward;
      console.log(`   ✅ Rozet silindi, ${userBadge.badge.xpReward} XP geri alındı\n`);
    }
  }

  console.log("\n📊 Özet:");
  console.log(`✅ Kontrol edilen rozet: ${userBadges.length}`);
  console.log(`❌ Silinen geçersiz rozet: ${removedCount}`);
  console.log(`💰 Geri alınan toplam XP: ${refundedXP}`);
  console.log(`✨ Geçerli rozet: ${userBadges.length - removedCount}`);
}

fixInvalidCheatBadges()
  .then(() => {
    console.log("\n✅ İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
