import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🍰 Seeding cheat meal badges...");

  const badges = [
    {
      type: "CHEAT_FREE_7_DAYS",
      name: "Glukozsuz Kahraman",
      description: "7 gün boyunca hiç kaçamak yapmadın!",
      icon: "🥇",
      xpReward: 50,
    },
    {
      type: "CHEAT_FREE_30_DAYS",
      name: "Süper Disiplinli",
      description: "30 gün boyunca hiç kaçamak yapmadın! İnanılmaz!",
      icon: "💎",
      xpReward: 200,
    },
    {
      type: "FAST_FOOD_FREE_30_DAYS",
      name: "Yağsavar",
      description: "30 gün boyunca fast food yemedin!",
      icon: "🥈",
      xpReward: 100,
    },
    {
      type: "BALANCED_RECOVERY",
      name: "Dengeli Dahi",
      description: "Kaçamak yaptın ama 3 gün üst üste telafi ettin!",
      icon: "🥉",
      xpReward: 30,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type as any },
      update: badge,
      create: badge,
    });
    console.log(`✅ Created/Updated badge: ${badge.name}`);
  }

  console.log("✨ Cheat meal badges seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
