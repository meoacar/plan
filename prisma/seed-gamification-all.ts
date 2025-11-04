import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function seedGamificationAll() {
  console.log("🎮 Tüm gamification verileri ekleniyor...\n");

  try {
    // 1. Görevler
    console.log("1️⃣ Görevler ekleniyor...");
    execSync("npm run db:seed:gamification-quests", { stdio: "inherit" });
    console.log("✅ Görevler tamamlandı\n");

    // 2. Ödüller
    console.log("2️⃣ Ödüller ekleniyor...");
    execSync("npm run db:seed:gamification-rewards", { stdio: "inherit" });
    console.log("✅ Ödüller tamamlandı\n");

    // 3. Mini Oyunlar
    console.log("3️⃣ Mini oyunlar ekleniyor...");
    execSync("npm run db:seed:gamification-games", { stdio: "inherit" });
    console.log("✅ Mini oyunlar tamamlandı\n");

    // 4. Streak Bonusları
    console.log("4️⃣ Streak bonusları ekleniyor...");
    execSync("npm run db:seed:gamification-streak-bonuses", {
      stdio: "inherit",
    });
    console.log("✅ Streak bonusları tamamlandı\n");

    console.log("🎉 Tüm gamification verileri başarıyla eklendi!");
    console.log("\n📊 Özet:");
    console.log("   ✅ Görevler (günlük, haftalık, özel)");
    console.log("   ✅ Ödüller (dijital, fiziksel, premium)");
    console.log("   ✅ Mini oyunlar (3 oyun)");
    console.log("   ✅ Streak bonusları (7 milestone)");
    console.log("\n💡 Kullanım:");
    console.log("   - Görevler: /api/quests");
    console.log("   - Mağaza: /api/shop/rewards");
    console.log("   - Oyunlar: /api/games");
    console.log("   - Streak: /api/streak/status");
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    process.exit(1);
  }
}

seedGamificationAll()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
