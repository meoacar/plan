import { PrismaClient, BadgeType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding gamification badges...')

  // Görev Tamamlama Rozetleri
  await prisma.badge.upsert({
    where: { type: BadgeType.QUEST_MASTER_10 },
    update: {},
    create: {
      id: 'badge-quest-master-10',
      type: BadgeType.QUEST_MASTER_10,
      name: 'Görev Çırak',
      description: '10 görev tamamladın! Görev sistemine harika bir başlangıç yaptın.',
      icon: '🎯',
      xpReward: 100,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.QUEST_MASTER_50 },
    update: {},
    create: {
      id: 'badge-quest-master-50',
      type: BadgeType.QUEST_MASTER_50,
      name: 'Görev Uzmanı',
      description: '50 görev tamamladın! Görevleri tamamlamada gerçek bir uzman oldun.',
      icon: '🎖️',
      xpReward: 500,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.QUEST_MASTER_100 },
    update: {},
    create: {
      id: 'badge-quest-master-100',
      type: BadgeType.QUEST_MASTER_100,
      name: 'Görev Efsanesi',
      description: '100 görev tamamladın! Görev sisteminin gerçek bir efsanesisin.',
      icon: '👑',
      xpReward: 1000,
    },
  })

  // Coin Toplama Rozetleri
  await prisma.badge.upsert({
    where: { type: BadgeType.COIN_COLLECTOR_1000 },
    update: {},
    create: {
      id: 'badge-coin-collector-1000',
      type: BadgeType.COIN_COLLECTOR_1000,
      name: 'Coin Toplayıcı',
      description: 'Toplam 1000 coin kazandın! Coin biriktirmeye başladın.',
      icon: '🪙',
      xpReward: 150,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.COIN_COLLECTOR_5000 },
    update: {},
    create: {
      id: 'badge-coin-collector-5000',
      type: BadgeType.COIN_COLLECTOR_5000,
      name: 'Coin Uzmanı',
      description: 'Toplam 5000 coin kazandın! Coin ekonomisinde uzman oldun.',
      icon: '💰',
      xpReward: 750,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.COIN_COLLECTOR_10000 },
    update: {},
    create: {
      id: 'badge-coin-collector-10000',
      type: BadgeType.COIN_COLLECTOR_10000,
      name: 'Coin Milyoneri',
      description: 'Toplam 10000 coin kazandın! Gerçek bir coin milyonerisin.',
      icon: '💎',
      xpReward: 1500,
    },
  })

  // Oyun Rozetleri
  await prisma.badge.upsert({
    where: { type: BadgeType.GAME_CALORIE_MASTER },
    update: {},
    create: {
      id: 'badge-game-calorie-master',
      type: BadgeType.GAME_CALORIE_MASTER,
      name: 'Kalori Ustası',
      description: 'Kalori Tahmin oyununda 800+ puan aldın! Kalori bilgin mükemmel.',
      icon: '🎮',
      xpReward: 200,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.GAME_MEMORY_MASTER },
    update: {},
    create: {
      id: 'badge-game-memory-master',
      type: BadgeType.GAME_MEMORY_MASTER,
      name: 'Hafıza Şampiyonu',
      description: 'Hafıza Kartları oyununda 20 hamle altında bitirdin! Hafızan harika.',
      icon: '🧠',
      xpReward: 200,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.GAME_QUICK_CLICK_MASTER },
    update: {},
    create: {
      id: 'badge-game-quick-click-master',
      type: BadgeType.GAME_QUICK_CLICK_MASTER,
      name: 'Hızlı Tıklama Ustası',
      description: 'Hızlı Tıklama oyununda 300+ puan aldın! Reflekslerin çok hızlı.',
      icon: '⚡',
      xpReward: 200,
    },
  })

  // Mağaza Rozetleri
  await prisma.badge.upsert({
    where: { type: BadgeType.SHOP_FIRST_PURCHASE },
    update: {},
    create: {
      id: 'badge-shop-first-purchase',
      type: BadgeType.SHOP_FIRST_PURCHASE,
      name: 'İlk Alışveriş',
      description: 'Mağazadan ilk ödülünü satın aldın! Alışverişe hoş geldin.',
      icon: '🛍️',
      xpReward: 100,
    },
  })

  await prisma.badge.upsert({
    where: { type: BadgeType.SHOP_ENTHUSIAST_10 },
    update: {},
    create: {
      id: 'badge-shop-enthusiast-10',
      type: BadgeType.SHOP_ENTHUSIAST_10,
      name: 'Alışveriş Tutkunu',
      description: 'Mağazadan 10 ödül satın aldın! Gerçek bir alışveriş tutkunusun.',
      icon: '🎁',
      xpReward: 500,
    },
  })

  console.log('Gamification badges seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding gamification badges:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
