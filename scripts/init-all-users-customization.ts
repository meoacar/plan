import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Tüm kullanıcılar için özelleştirme başlatılıyor...\n");

  // Özelleştirmesi olmayan kullanıcıları bul
  const users = await prisma.user.findMany({
    where: {
      profileCustomization: null,
    },
  });

  console.log(`📊 ${users.length} kullanıcı için özelleştirme oluşturulacak...\n`);

  let created = 0;
  for (const user of users) {
    try {
      await prisma.profileCustomization.create({
        data: {
          userId: user.id,
          unlockedFrames: ["default_frame"],
          unlockedBackgrounds: ["default_bg"],
          unlockedThemes: ["classic_theme"],
          unlockedBadges: [],
          activeBadges: [],
        },
      });
      created++;
      console.log(`✅ ${user.name || user.email} - Özelleştirme oluşturuldu`);
    } catch (error) {
      console.log(`❌ ${user.name || user.email} - Hata:`, error);
    }
  }

  console.log(`\n✨ Tamamlandı! ${created}/${users.length} kullanıcı için özelleştirme oluşturuldu.`);

  // Rozet sayısına göre öğeleri aç
  console.log("\n🔓 Rozet sayısına göre öğeler açılıyor...");
  
  const allUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: { badges: true },
      },
    },
  });

  for (const user of allUsers) {
    const badgeCount = user._count.badges;
    
    if (badgeCount === 0) continue;

    const customization = await prisma.profileCustomization.findUnique({
      where: { userId: user.id },
    });

    if (!customization) continue;

    const updates: any = {};
    const newFrames = [];

    // Rozet sayısına göre çerçeveleri aç
    if (badgeCount >= 1 && !customization.unlockedFrames.includes("bronze_frame")) {
      newFrames.push("bronze_frame");
    }
    if (badgeCount >= 5 && !customization.unlockedFrames.includes("silver_frame")) {
      newFrames.push("silver_frame");
    }
    if (badgeCount >= 10 && !customization.unlockedFrames.includes("gold_frame")) {
      newFrames.push("gold_frame");
    }
    if (badgeCount >= 20 && !customization.unlockedFrames.includes("diamond_frame")) {
      newFrames.push("diamond_frame");
    }

    if (newFrames.length > 0) {
      updates.unlockedFrames = [...customization.unlockedFrames, ...newFrames];
      
      await prisma.profileCustomization.update({
        where: { userId: user.id },
        data: updates,
      });

      console.log(`✅ ${user.name || user.email} - ${badgeCount} rozet, ${newFrames.length} yeni çerçeve açıldı`);
    }
  }

  console.log("\n🎉 Tüm işlemler tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
