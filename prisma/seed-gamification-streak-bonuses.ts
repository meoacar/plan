import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGamificationStreakBonuses() {
  console.log("🔥 Streak bonus verileri ekleniyor...");

  const streakBonuses = [
    {
      id: "streak-bonus-7",
      streakDays: 7,
      coinReward: 100,
      xpReward: 50,
      badgeType: "ACTIVE_7_DAYS",
      description: "7 gün üst üste giriş yaptın! İşte bonusun!",
    },
    {
      id: "streak-bonus-14",
      streakDays: 14,
      coinReward: 250,
      xpReward: 100,
      badgeType: null,
      description: "14 gün streak! Harika gidiyorsun!",
    },
    {
      id: "streak-bonus-30",
      streakDays: 30,
      coinReward: 500,
      xpReward: 250,
      badgeType: "ACTIVE_30_DAYS",
      description: "30 gün streak! İnanılmaz bir başarı!",
    },
    {
      id: "streak-bonus-60",
      streakDays: 60,
      coinReward: 1000,
      xpReward: 500,
      badgeType: null,
      description: "60 gün streak! Sen bir efsanesin!",
    },
    {
      id: "streak-bonus-100",
      streakDays: 100,
      coinReward: 2000,
      xpReward: 1000,
      badgeType: "ACTIVE_100_DAYS",
      description: "100 gün streak! Sadık kullanıcı rozeti senin!",
    },
    {
      id: "streak-bonus-180",
      streakDays: 180,
      coinReward: 3500,
      xpReward: 1500,
      badgeType: null,
      description: "180 gün streak! Yarım yıl boyunca hiç aksatmadın!",
    },
    {
      id: "streak-bonus-365",
      streakDays: 365,
      coinReward: 10000,
      xpReward: 5000,
      badgeType: null,
      description: "365 gün streak! Tam bir yıl! Bu inanılmaz bir başarı!",
    },
  ];

  for (const bonus of streakBonuses) {
    await prisma.streakBonus.upsert({
      where: { id: bonus.id },
      update: bonus,
      create: bonus,
    });
  }

  console.log(`✅ ${streakBonuses.length} streak bonusu eklendi`);
  console.log("🔥 Streak bonus verileri başarıyla eklendi!");

  // Bonus detayları
  console.log("\n📋 Streak Bonus Detayları:");
  streakBonuses.forEach((bonus) => {
    console.log(
      `\n${bonus.streakDays} gün: ${bonus.coinReward} coin + ${bonus.xpReward} XP${
        bonus.badgeType ? ` + ${bonus.badgeType} rozeti` : ""
      }`
    );
    console.log(`   "${bonus.description}"`);
  });

  console.log("\n💡 Not: Streak bonusları otomatik olarak verilir.");
  console.log(
    "   Kullanıcı belirtilen gün sayısına ulaştığında bonus hesabına eklenir."
  );
}

seedGamificationStreakBonuses()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
