import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGamificationGames() {
  console.log("🎮 Mini oyun verileri ekleniyor...");

  const games = [
    {
      id: "game-calorie-guess",
      code: "CALORIE_GUESS",
      name: "Kalori Tahmin Oyunu",
      description:
        "Yiyeceklerin kalorisini tahmin et! 10 soruda ne kadar doğru tahmin edebilirsin?",
      icon: "🎯",
      settings: {
        questionCount: 10,
        timePerQuestion: 30,
        accuracyTiers: {
          excellent: { range: 10, points: 100 }, // ±10%
          good: { range: 20, points: 50 }, // ±20%
          fair: { range: 30, points: 25 }, // ±30%
        },
        foodCategories: [
          "FRUIT",
          "VEGETABLE",
          "PROTEIN",
          "GRAIN",
          "DAIRY",
          "SNACK",
          "BEVERAGE",
        ],
      },
      rewardTiers: [
        { minScore: 0, maxScore: 99, coins: 0, tier: "none" },
        { minScore: 100, maxScore: 499, coins: 50, tier: "bronze" },
        { minScore: 500, maxScore: 799, coins: 100, tier: "silver" },
        { minScore: 800, maxScore: 1000, coins: 200, tier: "gold" },
      ],
      dailyLimit: 5,
      isActive: true,
      order: 1,
    },
    {
      id: "game-memory-cards",
      code: "MEMORY_CARDS",
      name: "Hafıza Kartları",
      description:
        "Sağlıklı yiyeceklerin eşleşmelerini bul! Hafızanı test et ve coin kazan.",
      icon: "🃏",
      settings: {
        gridSize: { rows: 4, cols: 4 },
        pairCount: 8,
        cardRevealTime: 1000,
        maxTime: 180, // 3 dakika
        foodCategories: [
          "FRUIT",
          "VEGETABLE",
          "PROTEIN",
          "GRAIN",
          "DAIRY",
          "NUT",
        ],
      },
      rewardTiers: [
        { minScore: 0, maxScore: 40, coins: 0, tier: "none" },
        { minScore: 41, maxScore: 60, coins: 25, tier: "bronze" },
        { minScore: 61, maxScore: 80, coins: 50, tier: "silver" },
        { minScore: 81, maxScore: 100, coins: 100, tier: "gold" },
      ],
      dailyLimit: 5,
      isActive: true,
      order: 2,
    },
    {
      id: "game-quick-click",
      code: "QUICK_CLICK",
      name: "Hızlı Tıklama Challenge",
      description:
        "30 saniyede sağlıklı yiyecekleri seç! Hızlı düşün, hızlı tıkla!",
      icon: "⚡",
      settings: {
        duration: 30,
        itemInterval: 2000,
        correctPoints: 10,
        wrongPenalty: -5,
        healthyCategories: [
          "FRUIT",
          "VEGETABLE",
          "PROTEIN",
          "GRAIN",
          "DAIRY",
          "NUT",
        ],
        unhealthyCategories: ["FAST_FOOD", "CANDY", "SODA", "CHIPS", "DESSERT"],
      },
      rewardTiers: [
        { minScore: 0, maxScore: 99, coins: 0, tier: "none" },
        { minScore: 100, maxScore: 199, coins: 30, tier: "bronze" },
        { minScore: 200, maxScore: 299, coins: 60, tier: "silver" },
        { minScore: 300, maxScore: 999, coins: 100, tier: "gold" },
      ],
      dailyLimit: 5,
      isActive: true,
      order: 3,
    },
  ];

  for (const game of games) {
    await prisma.miniGame.upsert({
      where: { id: game.id },
      update: game,
      create: game,
    });
  }

  console.log(`✅ ${games.length} mini oyun eklendi`);
  console.log("🎮 Mini oyun verileri başarıyla eklendi!");

  // Oyun açıklamaları
  console.log("\n📋 Oyun Detayları:");
  console.log("\n1. Kalori Tahmin Oyunu:");
  console.log("   - 10 soru, her soru için 30 saniye");
  console.log("   - ±10% doğruluk: 100 puan");
  console.log("   - ±20% doğruluk: 50 puan");
  console.log("   - ±30% doğruluk: 25 puan");
  console.log("   - Ödüller: 100+ puan = 50 coin, 500+ = 100 coin, 800+ = 200 coin");

  console.log("\n2. Hafıza Kartları:");
  console.log("   - 4x4 grid (8 çift kart)");
  console.log("   - Kartlar 1 saniye gösterilir");
  console.log("   - Maksimum 3 dakika süre");
  console.log("   - Skor = (100 - hamle sayısı) + bonus");
  console.log("   - Ödüller: 41-60 = 25 coin, 61-80 = 50 coin, 81-100 = 100 coin");

  console.log("\n3. Hızlı Tıklama Challenge:");
  console.log("   - 30 saniye süre");
  console.log("   - Her 2 saniyede yeni yiyecek");
  console.log("   - Doğru tıklama: +10 puan");
  console.log("   - Yanlış tıklama: -5 puan");
  console.log("   - Ödüller: 100+ = 30 coin, 200+ = 60 coin, 300+ = 100 coin");
}

seedGamificationGames()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
