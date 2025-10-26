import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, differenceInDays } from "date-fns";

export async function checkAndAwardCheatBadges(userId: string) {
  const badges = [];

  // Önce kullanıcının hiç günah yemeği ekleyip eklemediğini kontrol et
  const totalCheats = await prisma.cheatMeal.count({
    where: { userId },
  });

  // Hiç günah yemeği yoksa rozet verme
  if (totalCheats === 0) {
    return badges;
  }

  // İlk günah yemeği tarihini bul (kullanıcı ne zamandan beri kullanıyor?)
  const firstCheat = await prisma.cheatMeal.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
  });

  if (!firstCheat) {
    return badges;
  }

  const daysSinceFirstCheat = differenceInDays(new Date(), new Date(firstCheat.date));
  const hasBeenUsing7Days = daysSinceFirstCheat >= 7;
  const hasBeenUsing30Days = daysSinceFirstCheat >= 30;

  // 7 gün kaçamak yok - Glukozsuz Kahraman
  // Sadece en az 7 gündür kullanan kullanıcılara ver
  const sevenDaysAgo = subDays(startOfDay(new Date()), 7);
  const recentCheats = await prisma.cheatMeal.count({
    where: {
      userId,
      date: {
        gte: sevenDaysAgo,
      },
    },
  });

  if (recentCheats === 0 && hasBeenUsing7Days) {
    const hasCheatFree7 = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: {
          type: "CHEAT_FREE_7_DAYS",
        },
      },
    });

    if (!hasCheatFree7) {
      const badge = await prisma.badge.findUnique({
        where: { type: "CHEAT_FREE_7_DAYS" },
      });

      if (badge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        // XP ekle
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: badge.xpReward,
            },
          },
        });

        badges.push({
          type: "CHEAT_FREE_7_DAYS",
          name: "Glukozsuz Kahraman",
          xp: badge.xpReward,
        });
      }
    }
  }

  // 30 gün kaçamak yok
  // Sadece en az 30 gündür kullanan kullanıcılara ver
  const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
  const monthCheats = await prisma.cheatMeal.count({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgo,
      },
    },
  });

  if (monthCheats === 0 && hasBeenUsing30Days) {
    const hasCheatFree30 = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: {
          type: "CHEAT_FREE_30_DAYS",
        },
      },
    });

    if (!hasCheatFree30) {
      const badge = await prisma.badge.findUnique({
        where: { type: "CHEAT_FREE_30_DAYS" },
      });

      if (badge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: badge.xpReward,
            },
          },
        });

        badges.push({
          type: "CHEAT_FREE_30_DAYS",
          name: "Süper Disiplinli",
          xp: badge.xpReward,
        });
      }
    }
  }

  // 30 gün fast food yok - Yağsavar
  // Sadece en az 30 gündür kullanan kullanıcılara ver
  const fastFoodCheats = await prisma.cheatMeal.count({
    where: {
      userId,
      type: "FAST_FOOD",
      date: {
        gte: thirtyDaysAgo,
      },
    },
  });

  if (fastFoodCheats === 0 && hasBeenUsing30Days) {
    const hasFastFoodFree = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: {
          type: "FAST_FOOD_FREE_30_DAYS",
        },
      },
    });

    if (!hasFastFoodFree) {
      const badge = await prisma.badge.findUnique({
        where: { type: "FAST_FOOD_FREE_30_DAYS" },
      });

      if (badge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: badge.xpReward,
            },
          },
        });

        badges.push({
          type: "FAST_FOOD_FREE_30_DAYS",
          name: "Yağsavar",
          xp: badge.xpReward,
        });
      }
    }
  }

  // Dengeli Dahi - 3 gün üst üste telafi (kaçamak sonrası 3 gün temiz)
  const allCheats = await prisma.cheatMeal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 100,
  });

  if (allCheats.length > 0) {
    const lastCheatDate = new Date(allCheats[0].date);
    const daysSinceLastCheat = differenceInDays(new Date(), lastCheatDate);

    if (daysSinceLastCheat >= 3) {
      const hasBalanced = await prisma.userBadge.findFirst({
        where: {
          userId,
          badge: {
            type: "BALANCED_RECOVERY",
          },
        },
      });

      if (!hasBalanced) {
        const badge = await prisma.badge.findUnique({
          where: { type: "BALANCED_RECOVERY" },
        });

        if (badge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              xp: {
                increment: badge.xpReward,
              },
            },
          });

          badges.push({
            type: "BALANCED_RECOVERY",
            name: "Dengeli Dahi",
            xp: badge.xpReward,
          });
        }
      }
    }
  }

  return badges;
}

export async function getUserCheatBadges(userId: string) {
  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId,
      badge: {
        type: {
          in: [
            "CHEAT_FREE_7_DAYS",
            "CHEAT_FREE_30_DAYS",
            "FAST_FOOD_FREE_30_DAYS",
            "BALANCED_RECOVERY",
          ],
        },
      },
    },
    include: {
      badge: true,
    },
    orderBy: {
      earnedAt: "desc",
    },
  });

  return userBadges;
}
