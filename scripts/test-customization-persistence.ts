import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCustomizationPersistence() {
  console.log("🧪 Profil Özelleştirme Kalıcılık Testi\n");

  try {
    // Test kullanıcısı bul
    const testUser = await prisma.user.findFirst({
      where: {
        email: { contains: "@" },
      },
    });

    if (!testUser) {
      console.log("❌ Test kullanıcısı bulunamadı");
      return;
    }

    console.log(`✅ Test kullanıcısı: ${testUser.email}`);

    // Kullanıcının özelleştirmelerini kontrol et
    let customization = await prisma.profileCustomization.findUnique({
      where: { userId: testUser.id },
    });

    console.log("\n📊 Mevcut Özelleştirmeler:");
    console.log("- Active Frame:", customization?.activeFrame || "Yok");
    console.log("- Active Background:", customization?.activeBackground || "Yok");
    console.log("- Active Theme:", customization?.activeTheme || "Yok");
    console.log("- Active Badges:", customization?.activeBadges || []);
    console.log("\n- Unlocked Frames:", customization?.unlockedFrames || []);
    console.log("- Unlocked Backgrounds:", customization?.unlockedBackgrounds || []);
    console.log("- Unlocked Themes:", customization?.unlockedThemes || []);
    console.log("- Unlocked Badges:", customization?.unlockedBadges || []);

    // Kullanıcının rozetlerini kontrol et
    const badgeCount = await prisma.userBadge.count({
      where: { userId: testUser.id },
    });

    console.log(`\n🏆 Toplam Rozet: ${badgeCount}`);

    // Açılabilir öğeleri kontrol et
    const items = await prisma.customizationItem.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: testUser.id },
      include: { badge: true },
    });

    const badgeTypes = userBadges.map((ub) => ub.badge.type);

    console.log("\n🔓 Açılabilir Öğeler:");
    items.forEach((item) => {
      let isUnlocked = item.isDefault;

      if (!isUnlocked && item.badgeCount) {
        isUnlocked = badgeCount >= item.badgeCount;
      }

      if (!isUnlocked && item.badgeType) {
        isUnlocked = badgeTypes.includes(item.badgeType);
      }

      if (isUnlocked) {
        console.log(`  ✓ ${item.type}: ${item.name} (${item.code})`);
      }
    });

    // Test: Bir özelleştirme kaydet
    console.log("\n🧪 Test: Özelleştirme Kaydediliyor...");

    const testFrame = items.find(
      (i) =>
        i.type === "FRAME" &&
        (i.isDefault || (i.badgeCount && badgeCount >= i.badgeCount))
    );

    if (testFrame) {
      console.log(`  Seçilen çerçeve: ${testFrame.name}`);

      // Önce unlocked listesine ekle
      if (!customization) {
        customization = await prisma.profileCustomization.create({
          data: {
            userId: testUser.id,
            unlockedFrames: [testFrame.code],
            unlockedBackgrounds: ["default_bg"],
            unlockedThemes: ["classic_theme"],
            unlockedBadges: [],
            activeBadges: [],
            activeFrame: testFrame.code,
          },
        });
      } else {
        const unlockedFrames = customization.unlockedFrames.includes(
          testFrame.code
        )
          ? customization.unlockedFrames
          : [...customization.unlockedFrames, testFrame.code];

        customization = await prisma.profileCustomization.update({
          where: { userId: testUser.id },
          data: {
            unlockedFrames,
            activeFrame: testFrame.code,
          },
        });
      }

      console.log("  ✅ Kaydedildi!");

      // Tekrar oku
      const reloaded = await prisma.profileCustomization.findUnique({
        where: { userId: testUser.id },
      });

      console.log("\n📊 Yeniden Yüklenen Özelleştirmeler:");
      console.log("- Active Frame:", reloaded?.activeFrame);
      console.log("- Unlocked Frames:", reloaded?.unlockedFrames);

      if (reloaded?.activeFrame === testFrame.code) {
        console.log("\n✅ TEST BAŞARILI: Özelleştirme kalıcı!");
      } else {
        console.log("\n❌ TEST BAŞARISIZ: Özelleştirme kayboldu!");
      }
    } else {
      console.log("  ⚠️ Test için uygun çerçeve bulunamadı");
    }
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomizationPersistence();
