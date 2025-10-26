import { PrismaClient, BadgeType } from "@prisma/client";
import { unlockCustomizationItems, checkBadgeCountUnlocks } from "../src/lib/unlock-customization";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Rozet Ödül Sistemi Test Ediliyor...\n");

  // Test kullanıcısı bul veya oluştur
  let testUser = await prisma.user.findFirst({
    where: { email: { contains: "test" } },
  });

  if (!testUser) {
    console.log("❌ Test kullanıcısı bulunamadı. Lütfen bir test kullanıcısı oluşturun.");
    return;
  }

  console.log(`✅ Test kullanıcısı: ${testUser.name} (${testUser.email})\n`);

  // 1. Özelleştirme kaydı kontrolü
  console.log("1️⃣ Özelleştirme kaydı kontrol ediliyor...");
  let customization = await prisma.profileCustomization.findUnique({
    where: { userId: testUser.id },
  });

  if (!customization) {
    console.log("   Özelleştirme kaydı oluşturuluyor...");
    customization = await prisma.profileCustomization.create({
      data: {
        userId: testUser.id,
        unlockedFrames: ["default_frame"],
        unlockedBackgrounds: ["default_bg"],
        unlockedThemes: ["classic_theme"],
        unlockedBadges: [],
        activeBadges: [],
      },
    });
    console.log("   ✅ Özelleştirme kaydı oluşturuldu");
  } else {
    console.log("   ✅ Özelleştirme kaydı mevcut");
  }

  console.log(`   Açık çerçeveler: ${customization.unlockedFrames.length}`);
  console.log(`   Açık arka planlar: ${customization.unlockedBackgrounds.length}`);
  console.log(`   Açık temalar: ${customization.unlockedThemes.length}\n`);

  // 2. Rozet sayısı kontrolü
  console.log("2️⃣ Mevcut rozetler kontrol ediliyor...");
  const badgeCount = await prisma.userBadge.count({
    where: { userId: testUser.id },
  });
  console.log(`   Toplam rozet: ${badgeCount}\n`);

  // 3. Test rozeti ekle
  console.log("3️⃣ Test rozeti ekleniyor (CHEAT_FREE_7_DAYS)...");
  const testBadge = await prisma.badge.findUnique({
    where: { type: BadgeType.CHEAT_FREE_7_DAYS },
  });

  if (!testBadge) {
    console.log("   ❌ Test rozeti bulunamadı. Lütfen seed-cheat-badges.ts çalıştırın.");
    return;
  }

  // Rozet zaten var mı kontrol et
  const existingBadge = await prisma.userBadge.findFirst({
    where: {
      userId: testUser.id,
      badgeId: testBadge.id,
    },
  });

  if (!existingBadge) {
    await prisma.userBadge.create({
      data: {
        userId: testUser.id,
        badgeId: testBadge.id,
      },
    });
    console.log("   ✅ Rozet eklendi");
  } else {
    console.log("   ℹ️  Rozet zaten mevcut");
  }

  // 4. Özelleştirme öğelerini aç
  console.log("\n4️⃣ Özelleştirme öğeleri açılıyor...");
  const unlocked = await unlockCustomizationItems(testUser.id, testBadge.type);
  
  if (unlocked.unlockedItems.length > 0) {
    console.log(`   ✅ ${unlocked.unlockedItems.length} yeni öğe açıldı:`);
    unlocked.unlockedItems.forEach((item) => {
      console.log(`      - ${item.type}: ${item.name}`);
    });
  } else {
    console.log("   ℹ️  Yeni açılan öğe yok (zaten açık)");
  }

  // 5. Rozet sayısı bazlı unlock kontrolü
  console.log("\n5️⃣ Rozet sayısı bazlı unlock kontrol ediliyor...");
  const countUnlocked = await checkBadgeCountUnlocks(testUser.id);
  
  if (countUnlocked.unlockedItems.length > 0) {
    console.log(`   ✅ ${countUnlocked.unlockedItems.length} yeni öğe açıldı:`);
    countUnlocked.unlockedItems.forEach((item) => {
      console.log(`      - ${item.type}: ${item.name}`);
    });
  } else {
    console.log("   ℹ️  Yeni açılan öğe yok");
  }

  // 6. Güncel durum
  console.log("\n6️⃣ Güncel durum:");
  const updatedCustomization = await prisma.profileCustomization.findUnique({
    where: { userId: testUser.id },
  });

  console.log(`   Açık çerçeveler: ${updatedCustomization?.unlockedFrames.length}`);
  console.log(`   Açık arka planlar: ${updatedCustomization?.unlockedBackgrounds.length}`);
  console.log(`   Açık temalar: ${updatedCustomization?.unlockedThemes.length}`);
  console.log(`   Açık özel rozetler: ${updatedCustomization?.unlockedBadges.length}`);

  // 7. Tüm özelleştirme öğelerini listele
  console.log("\n7️⃣ Tüm özelleştirme öğeleri:");
  const allItems = await prisma.customizationItem.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }],
  });

  const itemsByType = allItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(itemsByType).forEach(([type, items]) => {
    console.log(`\n   ${type}:`);
    items.forEach((item) => {
      const isUnlocked = 
        updatedCustomization?.unlockedFrames.includes(item.code) ||
        updatedCustomization?.unlockedBackgrounds.includes(item.code) ||
        updatedCustomization?.unlockedThemes.includes(item.code) ||
        updatedCustomization?.unlockedBadges.includes(item.code);
      
      const status = isUnlocked ? "✅" : "🔒";
      console.log(`      ${status} ${item.name} - ${item.unlockCondition}`);
    });
  });

  console.log("\n✨ Test tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
