import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGamificationRewards() {
  console.log("🎁 Ödül verileri ekleniyor...");

  // Dijital Ödüller - Rozetler
  const badgeRewards = [
    {
      id: "reward-badge-gold-star",
      type: "BADGE",
      category: "DIGITAL",
      name: "Altın Yıldız Rozeti",
      description: "Profilinde parlayan özel bir altın yıldız rozeti",
      imageUrl: "/rewards/badge-gold-star.png",
      price: 500,
      stock: null,
      digitalData: {
        badgeCode: "GOLD_STAR",
        badgeIcon: "⭐",
        badgeColor: "#FFD700",
      },
      isActive: true,
      isFeatured: true,
      order: 1,
    },
    {
      id: "reward-badge-diamond",
      type: "BADGE",
      category: "DIGITAL",
      name: "Elmas Rozeti",
      description: "Nadir ve değerli elmas rozeti",
      imageUrl: "/rewards/badge-diamond.png",
      price: 1000,
      stock: null,
      digitalData: {
        badgeCode: "DIAMOND",
        badgeIcon: "💎",
        badgeColor: "#B9F2FF",
      },
      isActive: true,
      isFeatured: true,
      order: 2,
    },
    {
      id: "reward-badge-fire",
      type: "BADGE",
      category: "DIGITAL",
      name: "Ateş Rozeti",
      description: "Motivasyonunu gösteren ateş rozeti",
      imageUrl: "/rewards/badge-fire.png",
      price: 300,
      stock: null,
      digitalData: {
        badgeCode: "FIRE",
        badgeIcon: "🔥",
        badgeColor: "#FF4500",
      },
      isActive: true,
      isFeatured: false,
      order: 3,
    },
    {
      id: "reward-badge-rainbow",
      type: "BADGE",
      category: "DIGITAL",
      name: "Gökkuşağı Rozeti",
      description: "Renkli ve neşeli gökkuşağı rozeti",
      imageUrl: "/rewards/badge-rainbow.png",
      price: 400,
      stock: null,
      digitalData: {
        badgeCode: "RAINBOW",
        badgeIcon: "🌈",
        badgeColor: "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
      },
      isActive: true,
      isFeatured: false,
      order: 4,
    },
  ];

  // Dijital Ödüller - Profil Temaları
  const themeRewards = [
    {
      id: "reward-theme-dark-mode",
      type: "THEME",
      category: "DIGITAL",
      name: "Karanlık Mod Teması",
      description: "Gözlerini yormayan şık karanlık tema",
      imageUrl: "/rewards/theme-dark.png",
      price: 200,
      stock: null,
      digitalData: {
        themeCode: "DARK_MODE",
        primaryColor: "#1a1a1a",
        secondaryColor: "#2d2d2d",
        accentColor: "#4a9eff",
      },
      isActive: true,
      isFeatured: false,
      order: 5,
    },
    {
      id: "reward-theme-ocean",
      type: "THEME",
      category: "DIGITAL",
      name: "Okyanus Teması",
      description: "Sakinleştirici mavi tonlarında okyanus teması",
      imageUrl: "/rewards/theme-ocean.png",
      price: 250,
      stock: null,
      digitalData: {
        themeCode: "OCEAN",
        primaryColor: "#006994",
        secondaryColor: "#0099cc",
        accentColor: "#00d4ff",
      },
      isActive: true,
      isFeatured: false,
      order: 6,
    },
    {
      id: "reward-theme-sunset",
      type: "THEME",
      category: "DIGITAL",
      name: "Gün Batımı Teması",
      description: "Sıcak turuncu ve pembe tonlarında gün batımı teması",
      imageUrl: "/rewards/theme-sunset.png",
      price: 300,
      stock: null,
      digitalData: {
        themeCode: "SUNSET",
        primaryColor: "#ff6b35",
        secondaryColor: "#ff8c42",
        accentColor: "#ffa07a",
      },
      isActive: true,
      isFeatured: true,
      order: 7,
    },
  ];

  // Dijital Ödüller - Avatar Çerçeveleri
  const frameRewards = [
    {
      id: "reward-frame-gold",
      type: "FRAME",
      category: "DIGITAL",
      name: "Altın Çerçeve",
      description: "Profil fotoğrafın için lüks altın çerçeve",
      imageUrl: "/rewards/frame-gold.png",
      price: 350,
      stock: null,
      digitalData: {
        frameCode: "GOLD_FRAME",
        frameStyle: "border: 3px solid #FFD700; box-shadow: 0 0 10px #FFD700;",
      },
      isActive: true,
      isFeatured: false,
      order: 8,
    },
    {
      id: "reward-frame-rainbow",
      type: "FRAME",
      category: "DIGITAL",
      name: "Gökkuşağı Çerçeve",
      description: "Renkli animasyonlu gökkuşağı çerçeve",
      imageUrl: "/rewards/frame-rainbow.png",
      price: 450,
      stock: null,
      digitalData: {
        frameCode: "RAINBOW_FRAME",
        frameStyle: "border: 3px solid; border-image: linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet) 1; animation: rainbow 3s linear infinite;",
      },
      isActive: true,
      isFeatured: true,
      order: 9,
    },
  ];

  // Fiziksel Ödüller - İndirim Kodları
  const discountRewards = [
    {
      id: "reward-discount-10",
      type: "DISCOUNT_CODE",
      category: "PHYSICAL",
      name: "%10 İndirim Kodu",
      description: "Partner mağazalarımızda geçerli %10 indirim kodu",
      imageUrl: "/rewards/discount-10.png",
      price: 100,
      stock: 100,
      physicalData: {
        discountPercent: 10,
        validDays: 30,
        partnerStores: ["Store A", "Store B", "Store C"],
        codeTemplate: "DIET10-{RANDOM}",
      },
      isActive: true,
      isFeatured: false,
      order: 10,
    },
    {
      id: "reward-discount-20",
      type: "DISCOUNT_CODE",
      category: "PHYSICAL",
      name: "%20 İndirim Kodu",
      description: "Partner mağazalarımızda geçerli %20 indirim kodu",
      imageUrl: "/rewards/discount-20.png",
      price: 250,
      stock: 50,
      physicalData: {
        discountPercent: 20,
        validDays: 30,
        partnerStores: ["Store A", "Store B", "Store C"],
        codeTemplate: "DIET20-{RANDOM}",
      },
      isActive: true,
      isFeatured: true,
      order: 11,
    },
    {
      id: "reward-discount-50",
      type: "DISCOUNT_CODE",
      category: "PHYSICAL",
      name: "%50 İndirim Kodu",
      description: "Partner mağazalarımızda geçerli %50 indirim kodu",
      imageUrl: "/rewards/discount-50.png",
      price: 600,
      stock: 20,
      physicalData: {
        discountPercent: 50,
        validDays: 30,
        partnerStores: ["Store A", "Store B"],
        codeTemplate: "DIET50-{RANDOM}",
      },
      isActive: true,
      isFeatured: true,
      order: 12,
    },
  ];

  // Fiziksel Ödüller - Hediye Çekleri
  const giftCardRewards = [
    {
      id: "reward-gift-50",
      type: "GIFT_CARD",
      category: "PHYSICAL",
      name: "50 TL Hediye Çeki",
      description: "Partner mağazalarımızda kullanabileceğin 50 TL hediye çeki",
      imageUrl: "/rewards/gift-50.png",
      price: 500,
      stock: 30,
      physicalData: {
        amount: 50,
        currency: "TRY",
        validDays: 90,
        partnerStores: ["Store A", "Store B", "Store C", "Store D"],
        codeTemplate: "GIFT50-{RANDOM}",
      },
      isActive: true,
      isFeatured: false,
      order: 13,
    },
    {
      id: "reward-gift-100",
      type: "GIFT_CARD",
      category: "PHYSICAL",
      name: "100 TL Hediye Çeki",
      description: "Partner mağazalarımızda kullanabileceğin 100 TL hediye çeki",
      imageUrl: "/rewards/gift-100.png",
      price: 1000,
      stock: 20,
      physicalData: {
        amount: 100,
        currency: "TRY",
        validDays: 90,
        partnerStores: ["Store A", "Store B", "Store C", "Store D"],
        codeTemplate: "GIFT100-{RANDOM}",
      },
      isActive: true,
      isFeatured: true,
      order: 14,
    },
  ];

  // Premium Özellikler
  const premiumRewards = [
    {
      id: "reward-ad-free-7",
      type: "AD_FREE",
      category: "PREMIUM",
      name: "7 Gün Reklamsız",
      description: "7 gün boyunca reklamsız deneyim",
      imageUrl: "/rewards/ad-free.png",
      price: 150,
      stock: null,
      premiumData: {
        feature: "AD_FREE",
        durationDays: 7,
      },
      isActive: true,
      isFeatured: false,
      order: 15,
    },
    {
      id: "reward-ad-free-30",
      type: "AD_FREE",
      category: "PREMIUM",
      name: "30 Gün Reklamsız",
      description: "30 gün boyunca reklamsız deneyim",
      imageUrl: "/rewards/ad-free.png",
      price: 500,
      stock: null,
      premiumData: {
        feature: "AD_FREE",
        durationDays: 30,
      },
      isActive: true,
      isFeatured: true,
      order: 16,
    },
    {
      id: "reward-premium-stats-30",
      type: "PREMIUM_STATS",
      category: "PREMIUM",
      name: "30 Gün Premium İstatistikler",
      description: "Detaylı analiz ve istatistiklere 30 gün erişim",
      imageUrl: "/rewards/premium-stats.png",
      price: 400,
      stock: null,
      premiumData: {
        feature: "PREMIUM_STATS",
        durationDays: 30,
        features: [
          "Detaylı kalori analizi",
          "İlerleme grafikleri",
          "Karşılaştırmalı raporlar",
          "Özel öneriler",
        ],
      },
      isActive: true,
      isFeatured: true,
      order: 17,
    },
    {
      id: "reward-custom-profile-30",
      type: "CUSTOM_PROFILE",
      category: "PREMIUM",
      name: "30 Gün Özel Profil",
      description: "Profilini tamamen özelleştir - 30 gün",
      imageUrl: "/rewards/custom-profile.png",
      price: 350,
      stock: null,
      premiumData: {
        feature: "CUSTOM_PROFILE",
        durationDays: 30,
        features: [
          "Özel arka plan",
          "Özel renkler",
          "Özel yazı tipleri",
          "Profil düzeni özelleştirme",
        ],
      },
      isActive: true,
      isFeatured: false,
      order: 18,
    },
  ];

  const allRewards = [
    ...badgeRewards,
    ...themeRewards,
    ...frameRewards,
    ...discountRewards,
    ...giftCardRewards,
    ...premiumRewards,
  ];

  for (const reward of allRewards) {
    await prisma.reward.upsert({
      where: { id: reward.id },
      update: reward,
      create: reward,
    });
  }

  console.log(`✅ ${badgeRewards.length} rozet ödülü eklendi`);
  console.log(`✅ ${themeRewards.length} tema ödülü eklendi`);
  console.log(`✅ ${frameRewards.length} çerçeve ödülü eklendi`);
  console.log(`✅ ${discountRewards.length} indirim kodu eklendi`);
  console.log(`✅ ${giftCardRewards.length} hediye çeki eklendi`);
  console.log(`✅ ${premiumRewards.length} premium özellik eklendi`);
  console.log(`🎁 Toplam ${allRewards.length} ödül başarıyla eklendi!`);
}

seedGamificationRewards()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
