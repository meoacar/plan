/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { prisma } from "@/lib/prisma";

// XP hesaplama
export const XP_REWARDS = {
  PLAN_CREATED: 50,
  PLAN_APPROVED: 100,
  LIKE_RECEIVED: 5,
  COMMENT_RECEIVED: 10,
  COMMENT_GIVEN: 5,
  LIKE_GIVEN: 2,
  DAILY_LOGIN: 10,
  PROFILE_COMPLETE: 25,
  PROFILE_COMPLETE_100: 100, // %100 tamamlama bonusu
  VIEW_MILESTONE: 20,
  RECIPE_CREATED: 30,
  RECIPE_APPROVED: 75,
  RECIPE_LIKE_RECEIVED: 3,
  RECIPE_COMMENT_RECEIVED: 8,
  RECIPE_COMMENT_GIVEN: 3,
};

// Seviye hesaplama (her seviye için gereken XP)
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

// Kullanıcıya XP ekle
export async function addXP(userId: string, amount: number, reason: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  const newXP = (user.xp || 0) + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > (user.level || 1);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  // Aktivite logu
  await prisma.activityLog.create({
    data: {
      userId,
      type: "SETTINGS_UPDATED",
      description: `${amount} XP kazandı: ${reason}`,
      metadata: { xp: amount, reason, leveledUp },
    },
  });

  // Quest Integration: Seviye atlandıysa coin bonusu ver
  if (leveledUp) {
    try {
      const { onLevelUp } = await import('@/lib/quest-integration');
      await onLevelUp(userId, newLevel, user.level || 1);
    } catch (questError) {
      console.error('Level up quest integration error:', questError);
      // Quest hatası XP kazanımını etkilemez
    }
  }

  return { user: updatedUser, leveledUp, newLevel };
}

// Rozet kontrolü ve verme
export async function checkAndAwardBadge(userId: string, badgeType: string) {
  const badge = await prisma.badge.findUnique({
    where: { type: badgeType as any },
  });

  if (!badge) return null;

  // Zaten var mı kontrol et
  const existing = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId: badge.id,
    },
  });

  if (existing) return null;

  // Rozeti ver
  const userBadge = await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
    include: {
      badge: true,
    },
  });

  // XP ödülü ver
  if (badge.xpReward > 0) {
    await addXP(userId, badge.xpReward, `${badge.name} rozeti kazanıldı`);
  }

  return userBadge;
}

// Rozet kontrollerini yap
export async function checkBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      plans: {
        where: { status: "APPROVED" },
        include: {
          likes: true,
        },
      },
      comments: true,
      badges: true,
    },
  });

  if (!user) return [];

  const newBadges = [];

  // İlk plan
  if (user.plans.length >= 1) {
    const badge = await checkAndAwardBadge(userId, "FIRST_PLAN");
    if (badge) newBadges.push(badge);
  }

  // 5, 10, 25 plan
  if (user.plans.length >= 5) {
    const badge = await checkAndAwardBadge(userId, "PLANS_5");
    if (badge) newBadges.push(badge);
  }
  if (user.plans.length >= 10) {
    const badge = await checkAndAwardBadge(userId, "PLANS_10");
    if (badge) newBadges.push(badge);
  }
  if (user.plans.length >= 25) {
    const badge = await checkAndAwardBadge(userId, "PLANS_25");
    if (badge) newBadges.push(badge);
  }

  // Toplam beğeni sayısı
  const totalLikes = user.plans.reduce((sum, plan) => sum + plan.likes.length, 0);
  if (totalLikes >= 10) {
    const badge = await checkAndAwardBadge(userId, "LIKES_10");
    if (badge) newBadges.push(badge);
  }
  if (totalLikes >= 50) {
    const badge = await checkAndAwardBadge(userId, "LIKES_50");
    if (badge) newBadges.push(badge);
  }
  if (totalLikes >= 100) {
    const badge = await checkAndAwardBadge(userId, "LIKES_100");
    if (badge) newBadges.push(badge);
  }

  // Toplam görüntülenme
  const totalViews = user.plans.reduce((sum, plan) => sum + plan.views, 0);
  if (totalViews >= 100) {
    const badge = await checkAndAwardBadge(userId, "VIEWS_100");
    if (badge) newBadges.push(badge);
  }
  if (totalViews >= 500) {
    const badge = await checkAndAwardBadge(userId, "VIEWS_500");
    if (badge) newBadges.push(badge);
  }
  if (totalViews >= 1000) {
    const badge = await checkAndAwardBadge(userId, "VIEWS_1000");
    if (badge) newBadges.push(badge);
  }

  // Yorum sayısı
  if (user.comments.length >= 10) {
    const badge = await checkAndAwardBadge(userId, "COMMENTS_10");
    if (badge) newBadges.push(badge);
  }
  if (user.comments.length >= 50) {
    const badge = await checkAndAwardBadge(userId, "COMMENTS_50");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

// Tarif rozetlerini kontrol et
export async function checkRecipeBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: true,
    },
  });

  if (!user) return [];

  const newBadges = [];

  // Onaylı tarifleri al
  const recipes = await prisma.recipe.findMany({
    where: { 
      userId,
      status: "APPROVED" 
    },
    include: {
      likes: true,
      comments: true,
    },
  });

  // İlk tarif
  if (recipes.length >= 1) {
    const badge = await checkAndAwardBadge(userId, "FIRST_RECIPE");
    if (badge) newBadges.push(badge);
  }

  // 5, 10, 25 tarif
  if (recipes.length >= 5) {
    const badge = await checkAndAwardBadge(userId, "RECIPES_5");
    if (badge) newBadges.push(badge);
  }
  if (recipes.length >= 10) {
    const badge = await checkAndAwardBadge(userId, "RECIPES_10");
    if (badge) newBadges.push(badge);
  }
  if (recipes.length >= 25) {
    const badge = await checkAndAwardBadge(userId, "RECIPES_25");
    if (badge) newBadges.push(badge);
  }

  // Toplam tarif beğeni sayısı
  const totalRecipeLikes = recipes.reduce((sum, recipe) => sum + recipe.likes.length, 0);
  if (totalRecipeLikes >= 10) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_LIKES_10");
    if (badge) newBadges.push(badge);
  }
  if (totalRecipeLikes >= 50) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_LIKES_50");
    if (badge) newBadges.push(badge);
  }
  if (totalRecipeLikes >= 100) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_LIKES_100");
    if (badge) newBadges.push(badge);
  }

  // Toplam tarif görüntülenme
  const totalRecipeViews = recipes.reduce((sum, recipe) => sum + recipe.views, 0);
  if (totalRecipeViews >= 100) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_VIEWS_100");
    if (badge) newBadges.push(badge);
  }
  if (totalRecipeViews >= 500) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_VIEWS_500");
    if (badge) newBadges.push(badge);
  }

  // Toplam tarif yorum sayısı
  const totalRecipeComments = recipes.reduce((sum, recipe) => sum + recipe.comments.length, 0);
  if (totalRecipeComments >= 10) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_COMMENTS_10");
    if (badge) newBadges.push(badge);
  }
  if (totalRecipeComments >= 25) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_COMMENTS_25");
    if (badge) newBadges.push(badge);
  }

  // Tarif Ustası (10+ tarif + 50+ beğeni)
  if (recipes.length >= 10 && totalRecipeLikes >= 50) {
    const badge = await checkAndAwardBadge(userId, "RECIPE_MASTER");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

// Profil tamamlama kontrolü
export async function checkProfileCompletion(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      city: true,
      startWeight: true,
      goalWeight: true,
      instagram: true,
      twitter: true,
      youtube: true,
      tiktok: true,
      website: true,
    },
  });

  if (!user) return { completed: false, percentage: 0 };

  const fields = [
    { name: 'name', value: user.name },
    { name: 'username', value: user.username },
    { name: 'bio', value: user.bio },
    { name: 'image', value: user.image },
    { name: 'city', value: user.city },
    { name: 'startWeight', value: user.startWeight },
    { name: 'goalWeight', value: user.goalWeight },
    { 
      name: 'social', 
      value: user.instagram || user.twitter || user.youtube || user.tiktok || user.website 
    },
  ];

  const completedFields = fields.filter(f => f.value).length;
  const totalFields = fields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  const isComplete = percentage === 100;

  // %100 tamamlandıysa rozet ve XP ver
  if (isComplete) {
    const badge = await checkAndAwardBadge(userId, "PROFILE_COMPLETE");
    if (badge) {
      return { 
        completed: true, 
        percentage, 
        newBadge: badge,
        completedFields,
        totalFields 
      };
    }
  }

  return { 
    completed: isComplete, 
    percentage,
    completedFields,
    totalFields 
  };
}

// Günlük giriş streak kontrolü
export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!user.lastActiveDate) {
    // İlk giriş
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveDate: now,
        streak: 1,
      },
    });
    await addXP(userId, XP_REWARDS.DAILY_LOGIN, "Günlük giriş");
    
    // Quest Integration: Günlük giriş görevi güncelle
    try {
      const { onDailyLogin } = await import('@/lib/quest-integration');
      await onDailyLogin(userId);
    } catch (questError) {
      console.error('Daily login quest integration error:', questError);
    }
    
    return { streak: 1, isNew: true };
  }

  const lastActive = new Date(user.lastActiveDate);
  const lastActiveDay = new Date(
    lastActive.getFullYear(),
    lastActive.getMonth(),
    lastActive.getDate()
  );

  const daysDiff = Math.floor(
    (today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Bugün zaten giriş yapmış
    return { streak: user.streak || 0, isNew: false };
  } else if (daysDiff === 1) {
    // Ardışık gün
    const newStreak = (user.streak || 0) + 1;
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveDate: now,
        streak: newStreak,
      },
    });
    await addXP(userId, XP_REWARDS.DAILY_LOGIN, "Günlük giriş");

    // Quest Integration: Günlük giriş görevi güncelle
    try {
      const { onDailyLogin } = await import('@/lib/quest-integration');
      await onDailyLogin(userId);
    } catch (questError) {
      console.error('Daily login quest integration error:', questError);
    }

    // Streak rozetleri
    if (newStreak >= 7) {
      await checkAndAwardBadge(userId, "ACTIVE_7_DAYS");
    }
    if (newStreak >= 30) {
      await checkAndAwardBadge(userId, "ACTIVE_30_DAYS");
    }
    if (newStreak >= 100) {
      await checkAndAwardBadge(userId, "ACTIVE_100_DAYS");
    }

    // Quest Integration: Streak milestone kontrolü
    if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
      try {
        const { onStreakMilestone } = await import('@/lib/quest-integration');
        await onStreakMilestone(userId, newStreak);
      } catch (questError) {
        console.error('Streak milestone quest integration error:', questError);
      }
    }

    return { streak: newStreak, isNew: true };
  } else {
    // Streak kırıldı
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveDate: now,
        streak: 1,
      },
    });
    await addXP(userId, XP_REWARDS.DAILY_LOGIN, "Günlük giriş");
    
    // Quest Integration: Günlük giriş görevi güncelle
    try {
      const { onDailyLogin } = await import('@/lib/quest-integration');
      await onDailyLogin(userId);
    } catch (questError) {
      console.error('Daily login quest integration error:', questError);
    }
    
    return { streak: 1, isNew: true, broken: true };
  }
}

// Liderlik tablosu
export async function getLeaderboard(type: "xp" | "likes" | "views", limit = 10) {
  if (type === "xp") {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        _count: {
          select: {
            plans: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
      orderBy: {
        xp: "desc",
      },
      take: limit,
    });
  }

  if (type === "likes") {
    const users = await prisma.user.findMany({
      where: {
        plans: {
          some: {
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        plans: {
          where: { status: "APPROVED" },
          select: {
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
    });

    return users
      .map((user) => ({
        ...user,
        totalLikes: user.plans.reduce((sum, plan) => sum + plan._count.likes, 0),
      }))
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, limit);
  }

  if (type === "views") {
    const users = await prisma.user.findMany({
      where: {
        plans: {
          some: {
            status: "APPROVED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        plans: {
          where: { status: "APPROVED" },
          select: {
            views: true,
          },
        },
      },
    });

    return users
      .map((user) => ({
        ...user,
        totalViews: user.plans.reduce((sum, plan) => sum + plan.views, 0),
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, limit);
  }

  return [];
}

// İtiraf rozetlerini kontrol et
export async function checkConfessionBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: true,
    },
  });

  if (!user) return [];

  const newBadges = [];

  // İtirafları al
  const confessions = await prisma.confession.findMany({
    where: { userId },
    include: {
      likes: true,
      comments: true,
      reactions: true,
    },
  });

  // İlk itiraf (GROUP_CREATOR)
  if (confessions.length >= 1) {
    const badge = await checkAndAwardBadge(userId, "GROUP_CREATOR");
    if (badge) newBadges.push(badge);
  }

  // 10 itiraf (GROUP_ADMIN)
  if (confessions.length >= 10) {
    const badge = await checkAndAwardBadge(userId, "GROUP_ADMIN");
    if (badge) newBadges.push(badge);
  }

  // Toplam itiraf beğeni sayısı (CHALLENGE_WINNER)
  const totalConfessionLikes = confessions.reduce((sum, confession) => sum + confession.likes.length, 0);
  if (totalConfessionLikes >= 50) {
    const badge = await checkAndAwardBadge(userId, "CHALLENGE_WINNER");
    if (badge) newBadges.push(badge);
  }

  // Toplam itiraf yorum sayısı (CHALLENGE_PARTICIPANT)
  const totalConfessionComments = await prisma.confessionComment.count({
    where: { userId },
  });
  if (totalConfessionComments >= 50) {
    const badge = await checkAndAwardBadge(userId, "CHALLENGE_PARTICIPANT");
    if (badge) newBadges.push(badge);
  }

  // Toplam reaksiyon sayısı (SOCIAL_BUTTERFLY)
  const totalReactions = await prisma.confessionReaction.count({
    where: { userId },
  });
  if (totalReactions >= 100) {
    const badge = await checkAndAwardBadge(userId, "SOCIAL_BUTTERFLY");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}
