import { PrismaClient, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Özelleştirme öğeleri ekleniyor...");

  // ÇERÇEVELER (FRAMES)
  const frames = [
    {
      type: "FRAME" as const,
      code: "default_frame",
      name: "Varsayılan",
      description: "Standart profil çerçevesi",
      cssClass: "frame-default",
      unlockCondition: "Varsayılan olarak açık",
      isDefault: true,
      order: 0,
    },
    {
      type: "FRAME" as const,
      code: "bronze_frame",
      name: "Bronz Çerçeve",
      description: "İlk rozetini kazandığında açılır",
      cssClass: "frame-bronze",
      colors: { gradient: "linear-gradient(135deg, #cd7f32 0%, #b87333 100%)" },
      unlockCondition: "İlk rozet",
      badgeCount: 1,
      order: 1,
    },
    {
      type: "FRAME" as const,
      code: "silver_frame",
      name: "Gümüş Çerçeve",
      description: "5 rozet kazandığında açılır",
      cssClass: "frame-silver",
      colors: { gradient: "linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)" },
      unlockCondition: "5 rozet",
      badgeCount: 5,
      order: 2,
    },
    {
      type: "FRAME" as const,
      code: "gold_frame",
      name: "Altın Çerçeve",
      description: "10 rozet kazandığında açılır",
      cssClass: "frame-gold",
      colors: { gradient: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" },
      unlockCondition: "10 rozet",
      badgeCount: 10,
      order: 3,
    },
    {
      type: "FRAME" as const,
      code: "diamond_frame",
      name: "Elmas Çerçeve",
      description: "20 rozet kazandığında açılır",
      cssClass: "frame-diamond",
      colors: { gradient: "linear-gradient(135deg, #b9f2ff 0%, #00d4ff 100%)" },
      unlockCondition: "20 rozet",
      badgeCount: 20,
      order: 4,
    },
    {
      type: "FRAME" as const,
      code: "discipline_frame",
      name: "Disiplin Çerçevesi",
      description: "7 gün günah yemeği yemeden kazanılır",
      cssClass: "frame-discipline",
      colors: { gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      unlockCondition: "Glukozsuz Kahraman rozeti",
      badgeType: BadgeType.CHEAT_FREE_7_DAYS,
      isSpecial: true,
      order: 10,
    },
    {
      type: "FRAME" as const,
      code: "hero_frame",
      name: "Kahraman Çerçevesi",
      description: "Kilo verme kahramanı rozetiyle açılır",
      cssClass: "frame-hero",
      colors: { gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
      unlockCondition: "Kilo Verme Kahramanı rozeti",
      badgeType: BadgeType.WEIGHT_LOSS_HERO,
      isSpecial: true,
      order: 11,
    },
    {
      type: "FRAME" as const,
      code: "chef_frame",
      name: "Şef Çerçevesi",
      description: "Tarif ustası rozetiyle açılır",
      cssClass: "frame-chef",
      colors: { gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
      unlockCondition: "Tarif Ustası rozeti",
      badgeType: BadgeType.RECIPE_MASTER,
      isSpecial: true,
      order: 12,
    },
    {
      type: "FRAME" as const,
      code: "rainbow_frame",
      name: "Gökkuşağı Çerçeve",
      description: "Tüm kategorilerden rozet kazandığında açılır",
      cssClass: "frame-rainbow",
      colors: {
        gradient:
          "linear-gradient(135deg, #ef4444 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #ec4899 100%)",
      },
      unlockCondition: "Her kategoriden en az 1 rozet",
      badgeCount: 15,
      isSpecial: true,
      order: 20,
    },
  ];

  // ARKA PLANLAR (BACKGROUNDS)
  const backgrounds = [
    {
      type: "BACKGROUND" as const,
      code: "default_bg",
      name: "Minimal Gradient",
      description: "Varsayılan arka plan",
      cssClass: "bg-default",
      colors: { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
      unlockCondition: "Varsayılan olarak açık",
      isDefault: true,
      order: 0,
    },
    {
      type: "BACKGROUND" as const,
      code: "fitness_motivation_bg",
      name: "Fitness Motivasyon",
      description: "7 gün aktif kalarak açılır",
      cssClass: "bg-fitness",
      imageUrl: "/backgrounds/fitness-motivation.jpg",
      unlockCondition: "7 Gün Aktif rozeti",
      badgeType: BadgeType.ACTIVE_7_DAYS,
      order: 1,
    },
    {
      type: "BACKGROUND" as const,
      code: "healthy_life_bg",
      name: "Sağlıklı Yaşam",
      description: "30 gün aktif kalarak açılır",
      cssClass: "bg-healthy",
      imageUrl: "/backgrounds/healthy-life.jpg",
      unlockCondition: "30 Gün Aktif rozeti",
      badgeType: BadgeType.ACTIVE_30_DAYS,
      order: 2,
    },
    {
      type: "BACKGROUND" as const,
      code: "success_path_bg",
      name: "Başarı Yolu",
      description: "100 gün aktif kalarak açılır",
      cssClass: "bg-success",
      imageUrl: "/backgrounds/success-path.jpg",
      unlockCondition: "100 Gün Aktif rozeti",
      badgeType: BadgeType.ACTIVE_100_DAYS,
      order: 3,
    },
    {
      type: "BACKGROUND" as const,
      code: "healthy_food_bg",
      name: "Sağlıklı Beslenme",
      description: "30 gün fast food yemeden açılır",
      cssClass: "bg-healthy-food",
      imageUrl: "/backgrounds/healthy-food.jpg",
      unlockCondition: "Yağsavar rozeti",
      badgeType: BadgeType.FAST_FOOD_FREE_30_DAYS,
      isSpecial: true,
      order: 10,
    },
    {
      type: "BACKGROUND" as const,
      code: "galaxy_bg",
      name: "Galaksi",
      description: "50+ rozet kazandığında açılır",
      cssClass: "bg-galaxy",
      imageUrl: "/backgrounds/galaxy.jpg",
      unlockCondition: "50 rozet",
      badgeCount: 50,
      isSpecial: true,
      order: 20,
    },
  ];

  // TEMALAR (THEMES)
  const themes = [
    {
      type: "THEME" as const,
      code: "classic_theme",
      name: "Klasik",
      description: "Varsayılan tema",
      cssClass: "theme-classic",
      colors: {
        primary: "#10b981",
        secondary: "#3b82f6",
        accent: "#8b5cf6",
        background: "#ffffff",
        text: "#1f2937",
      },
      unlockCondition: "Varsayılan olarak açık",
      isDefault: true,
      order: 0,
    },
    {
      type: "THEME" as const,
      code: "fire_theme",
      name: "Ateş",
      description: "Kilo verme rozetleriyle açılır",
      cssClass: "theme-fire",
      colors: {
        primary: "#ef4444",
        secondary: "#f97316",
        accent: "#fbbf24",
        background: "#fef2f2",
        text: "#7f1d1d",
      },
      unlockCondition: "Kilo Verme Kahramanı rozeti",
      badgeType: BadgeType.WEIGHT_LOSS_HERO,
      order: 1,
    },
    {
      type: "THEME" as const,
      code: "ocean_theme",
      name: "Okyanus",
      description: "Sosyal rozetlerle açılır",
      cssClass: "theme-ocean",
      colors: {
        primary: "#3b82f6",
        secondary: "#06b6d4",
        accent: "#8b5cf6",
        background: "#eff6ff",
        text: "#1e3a8a",
      },
      unlockCondition: "100 Beğeni rozeti",
      badgeType: BadgeType.LIKES_100,
      order: 2,
    },
    {
      type: "THEME" as const,
      code: "forest_theme",
      name: "Orman",
      description: "Sağlıklı beslenme rozetleriyle açılır",
      cssClass: "theme-forest",
      colors: {
        primary: "#10b981",
        secondary: "#059669",
        accent: "#84cc16",
        background: "#f0fdf4",
        text: "#064e3b",
      },
      unlockCondition: "30 Gün Günah Yemeği Yok rozeti",
      badgeType: BadgeType.CHEAT_FREE_30_DAYS,
      order: 3,
    },
    {
      type: "THEME" as const,
      code: "night_theme",
      name: "Gece",
      description: "Premium rozetlerle açılır",
      cssClass: "theme-night",
      colors: {
        primary: "#8b5cf6",
        secondary: "#6366f1",
        accent: "#ec4899",
        background: "#1f2937",
        text: "#f9fafb",
      },
      unlockCondition: "20 rozet",
      badgeCount: 20,
      isSpecial: true,
      order: 10,
    },
    {
      type: "THEME" as const,
      code: "legend_theme",
      name: "Efsane",
      description: "Tüm challenge rozetleriyle açılır",
      cssClass: "theme-legend",
      colors: {
        primary: "#fbbf24",
        secondary: "#f59e0b",
        accent: "#ef4444",
        background: "#fffbeb",
        text: "#78350f",
      },
      unlockCondition: "Challenge Kazananı rozeti",
      badgeType: BadgeType.CHALLENGE_WINNER,
      isSpecial: true,
      order: 20,
    },
  ];

  // ÖZEL ROZETLER (PROFILE BADGES)
  const profileBadges = [
    {
      type: "BADGE" as const,
      code: "star_badge",
      name: "Yıldız",
      description: "En çok beğenilen plan sahibi",
      imageUrl: "/badges/star.svg",
      unlockCondition: "100 Beğeni rozeti",
      badgeType: BadgeType.LIKES_100,
      order: 1,
    },
    {
      type: "BADGE" as const,
      code: "heart_badge",
      name: "Kalp",
      description: "Topluluk yardımcısı",
      imageUrl: "/badges/heart.svg",
      unlockCondition: "Topluluk Yardımcısı rozeti",
      badgeType: BadgeType.COMMUNITY_HELPER,
      order: 2,
    },
    {
      type: "BADGE" as const,
      code: "fire_badge",
      name: "Ateş",
      description: "Streak ustası",
      imageUrl: "/badges/fire.svg",
      unlockCondition: "100 Gün Aktif rozeti",
      badgeType: BadgeType.ACTIVE_100_DAYS,
      order: 3,
    },
    {
      type: "BADGE" as const,
      code: "crown_badge",
      name: "Taç",
      description: "Lider",
      imageUrl: "/badges/crown.svg",
      unlockCondition: "Challenge Kazananı rozeti",
      badgeType: BadgeType.CHALLENGE_WINNER,
      order: 4,
    },
    {
      type: "BADGE" as const,
      code: "chef_badge",
      name: "Şef Şapkası",
      description: "Tarif ustası",
      imageUrl: "/badges/chef.svg",
      unlockCondition: "Tarif Ustası rozeti",
      badgeType: BadgeType.RECIPE_MASTER,
      order: 5,
    },
  ];

  // Tüm öğeleri ekle
  const allItems = [...frames, ...backgrounds, ...themes, ...profileBadges];

  for (const item of allItems) {
    await prisma.customizationItem.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }

  console.log(`✅ ${allItems.length} özelleştirme öğesi eklendi!`);

  // İstatistikler
  const stats = {
    frames: frames.length,
    backgrounds: backgrounds.length,
    themes: themes.length,
    badges: profileBadges.length,
  };

  console.log("\n📊 Özet:");
  console.log(`   Çerçeveler: ${stats.frames}`);
  console.log(`   Arka Planlar: ${stats.backgrounds}`);
  console.log(`   Temalar: ${stats.themes}`);
  console.log(`   Özel Rozetler: ${stats.badges}`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
