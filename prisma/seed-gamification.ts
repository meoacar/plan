import { PrismaClient, BadgeType, GoalType } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGamification() {
  console.log("🎮 Gamification verileri ekleniyor...");

  // Rozetler
  const badges: Array<{
    type: BadgeType;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  }> = [
    {
      type: "FIRST_PLAN",
      name: "İlk Adım",
      description: "İlk planını oluşturdun!",
      icon: "🎯",
      xpReward: 50,
    },
    {
      type: "PLANS_5",
      name: "Plan Ustası",
      description: "5 plan oluşturdun",
      icon: "📝",
      xpReward: 100,
    },
    {
      type: "PLANS_10",
      name: "Plan Kahramanı",
      description: "10 plan oluşturdun",
      icon: "⭐",
      xpReward: 200,
    },
    {
      type: "PLANS_25",
      name: "Plan Efsanesi",
      description: "25 plan oluşturdun",
      icon: "👑",
      xpReward: 500,
    },
    {
      type: "LIKES_10",
      name: "Beğenilen",
      description: "Planların 10 beğeni aldı",
      icon: "❤️",
      xpReward: 75,
    },
    {
      type: "LIKES_50",
      name: "Popüler",
      description: "Planların 50 beğeni aldı",
      icon: "💖",
      xpReward: 150,
    },
    {
      type: "LIKES_100",
      name: "Süperstar",
      description: "Planların 100 beğeni aldı",
      icon: "🌟",
      xpReward: 300,
    },
    {
      type: "VIEWS_100",
      name: "İlgi Çekici",
      description: "Planların 100 görüntülenme aldı",
      icon: "👀",
      xpReward: 50,
    },
    {
      type: "VIEWS_500",
      name: "Trend",
      description: "Planların 500 görüntülenme aldı",
      icon: "🔥",
      xpReward: 100,
    },
    {
      type: "VIEWS_1000",
      name: "Viral",
      description: "Planların 1000 görüntülenme aldı",
      icon: "💥",
      xpReward: 250,
    },
    {
      type: "COMMENTS_10",
      name: "Konuşkan",
      description: "10 yorum yaptın",
      icon: "💬",
      xpReward: 50,
    },
    {
      type: "COMMENTS_50",
      name: "Topluluk Dostu",
      description: "50 yorum yaptın",
      icon: "🗣️",
      xpReward: 150,
    },
    {
      type: "ACTIVE_7_DAYS",
      name: "Haftalık Aktif",
      description: "7 gün üst üste giriş yaptın",
      icon: "📅",
      xpReward: 100,
    },
    {
      type: "ACTIVE_30_DAYS",
      name: "Aylık Aktif",
      description: "30 gün üst üste giriş yaptın",
      icon: "🗓️",
      xpReward: 300,
    },
    {
      type: "ACTIVE_100_DAYS",
      name: "Sadık Kullanıcı",
      description: "100 gün üst üste giriş yaptın",
      icon: "🏆",
      xpReward: 1000,
    },
    {
      type: "EARLY_ADOPTER",
      name: "Öncü",
      description: "Platformun ilk kullanıcılarındansın",
      icon: "🚀",
      xpReward: 200,
    },
    {
      type: "COMMUNITY_HELPER",
      name: "Yardımsever",
      description: "Toplulukta aktif olarak yardım ediyorsun",
      icon: "🤝",
      xpReward: 150,
    },
    {
      type: "WEIGHT_LOSS_HERO",
      name: "Zayıflama Kahramanı",
      description: "Hedefine ulaştın ve başarını paylaştın",
      icon: "💪",
      xpReward: 500,
    },
    {
      type: "FIRST_PARTNER",
      name: "İlk Partner",
      description: "İlk partnerini edindin",
      icon: "🤝",
      xpReward: 100,
    },
    {
      type: "SUPPORTIVE_PARTNER",
      name: "Destekleyici Partner",
      description: "50 destek notu ekledin",
      icon: "💬",
      xpReward: 200,
    },
    {
      type: "GOAL_ACHIEVER",
      name: "Hedef Avcısı",
      description: "10 ortak hedef tamamladın",
      icon: "🎯",
      xpReward: 300,
    },
    {
      type: "LONG_TERM_PARTNER",
      name: "Uzun Soluklu Partner",
      description: "90 gün aktif partnerlik",
      icon: "⏳",
      xpReward: 500,
    },
    {
      type: "MOTIVATOR",
      name: "Motivasyon Kaynağı",
      description: "100 motivasyon mesajı gönderdin",
      icon: "✨",
      xpReward: 250,
    },
    {
      type: "PROFILE_COMPLETE",
      name: "Profil Tamamlandı",
      description: "Profilini %100 tamamladın",
      icon: "✅",
      xpReward: 100,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ ${badges.length} rozet eklendi`);

  // Hedefler
  const goals: Array<{
    type: GoalType;
    name: string;
    description: string;
    target: number;
    xpReward: number;
  }> = [
    {
      type: "DAILY_LOGIN",
      name: "Günlük Giriş",
      description: "Bugün platforma giriş yap",
      target: 1,
      xpReward: 10,
    },
    {
      type: "WEEKLY_PLAN",
      name: "Haftalık Plan",
      description: "Bu hafta en az 1 plan oluştur",
      target: 1,
      xpReward: 50,
    },
    {
      type: "WEEKLY_COMMENT",
      name: "Haftalık Yorum",
      description: "Bu hafta en az 3 yorum yap",
      target: 3,
      xpReward: 30,
    },
    {
      type: "WEEKLY_LIKE",
      name: "Haftalık Beğeni",
      description: "Bu hafta en az 5 plan beğen",
      target: 5,
      xpReward: 20,
    },
    {
      type: "MONTHLY_ACTIVE",
      name: "Aylık Aktif",
      description: "Bu ay en az 15 gün aktif ol",
      target: 15,
      xpReward: 100,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { type: goal.type },
      update: goal,
      create: goal,
    });
  }

  console.log(`✅ ${goals.length} hedef eklendi`);
  console.log("🎮 Gamification verileri başarıyla eklendi!");
}

seedGamification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
