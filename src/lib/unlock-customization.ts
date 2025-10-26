import { prisma } from "@/lib/prisma";
import { BadgeType } from "@prisma/client";

/**
 * Rozet kazanıldığında ilgili özelleştirme öğelerini aç
 */
export async function unlockCustomizationItems(
  userId: string,
  badgeType: BadgeType
) {
  try {
    // Kullanıcının özelleştirme kaydını getir veya oluştur
    let customization = await prisma.profileCustomization.findUnique({
      where: { userId },
    });

    if (!customization) {
      customization = await prisma.profileCustomization.create({
        data: {
          userId,
          unlockedFrames: ["default_frame"],
          unlockedBackgrounds: ["default_bg"],
          unlockedThemes: ["classic_theme"],
          unlockedBadges: [],
          activeBadges: [],
        },
      });
    }

    // Bu rozet ile açılan öğeleri bul
    const itemsToUnlock = await prisma.customizationItem.findMany({
      where: { badgeType },
    });

    if (itemsToUnlock.length === 0) {
      return { unlockedItems: [] };
    }

    // Öğeleri kategorilere ayır
    const frames = itemsToUnlock
      .filter((item: any) => item.type === "FRAME")
      .map((item: any) => item.code);
    const backgrounds = itemsToUnlock
      .filter((item: any) => item.type === "BACKGROUND")
      .map((item: any) => item.code);
    const themes = itemsToUnlock
      .filter((item: any) => item.type === "THEME")
      .map((item: any) => item.code);
    const badges = itemsToUnlock
      .filter((item: any) => item.type === "BADGE")
      .map((item: any) => item.code);

    // Yeni açılan öğeleri ekle (duplicate kontrolü ile)
    const updates: any = {};

    if (frames.length > 0) {
      const newFrames = frames.filter(
        (f: string) => !customization!.unlockedFrames.includes(f)
      );
      if (newFrames.length > 0) {
        updates.unlockedFrames = [
          ...customization!.unlockedFrames,
          ...newFrames,
        ];
      }
    }

    if (backgrounds.length > 0) {
      const newBackgrounds = backgrounds.filter(
        (b: string) => !customization!.unlockedBackgrounds.includes(b)
      );
      if (newBackgrounds.length > 0) {
        updates.unlockedBackgrounds = [
          ...customization!.unlockedBackgrounds,
          ...newBackgrounds,
        ];
      }
    }

    if (themes.length > 0) {
      const newThemes = themes.filter(
        (t: string) => !customization!.unlockedThemes.includes(t)
      );
      if (newThemes.length > 0) {
        updates.unlockedThemes = [
          ...customization!.unlockedThemes,
          ...newThemes,
        ];
      }
    }

    if (badges.length > 0) {
      const newBadges = badges.filter(
        (b: string) => !customization!.unlockedBadges.includes(b)
      );
      if (newBadges.length > 0) {
        updates.unlockedBadges = [
          ...customization!.unlockedBadges,
          ...newBadges,
        ];
      }
    }

    // Güncelleme varsa kaydet
    if (Object.keys(updates).length > 0) {
      await prisma.profileCustomization.update({
        where: { userId },
        data: updates,
      });
    }

    return {
      unlockedItems: itemsToUnlock.map((item: any) => ({
        type: item.type,
        code: item.code,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
      })),
    };
  } catch (error) {
    console.error("Error unlocking customization items:", error);
    return { unlockedItems: [] };
  }
}

/**
 * Rozet sayısına göre öğeleri aç
 */
export async function checkBadgeCountUnlocks(userId: string) {
  try {
    const badgeCount = await prisma.userBadge.count({
      where: { userId },
    });

    // Rozet sayısına göre açılacak öğeleri bul
    const itemsToUnlock = await prisma.customizationItem.findMany({
      where: {
        badgeCount: {
          lte: badgeCount,
        },
        badgeType: null, // Sadece rozet sayısına bağlı olanlar
      },
    });

    if (itemsToUnlock.length === 0) {
      return { unlockedItems: [] };
    }

    let customization = await prisma.profileCustomization.findUnique({
      where: { userId },
    });

    if (!customization) {
      customization = await prisma.profileCustomization.create({
        data: {
          userId,
          unlockedFrames: ["default_frame"],
          unlockedBackgrounds: ["default_bg"],
          unlockedThemes: ["classic_theme"],
          unlockedBadges: [],
          activeBadges: [],
        },
      });
    }

    const updates: any = {};
    const newlyUnlocked: any[] = [];

    for (const item of itemsToUnlock) {
      let alreadyUnlocked = false;

      switch (item.type) {
        case "FRAME":
          alreadyUnlocked = customization.unlockedFrames.includes(item.code);
          if (!alreadyUnlocked) {
            updates.unlockedFrames = [
              ...(updates.unlockedFrames || customization.unlockedFrames),
              item.code,
            ];
            newlyUnlocked.push(item);
          }
          break;
        case "BACKGROUND":
          alreadyUnlocked = customization.unlockedBackgrounds.includes(
            item.code
          );
          if (!alreadyUnlocked) {
            updates.unlockedBackgrounds = [
              ...(updates.unlockedBackgrounds ||
                customization.unlockedBackgrounds),
              item.code,
            ];
            newlyUnlocked.push(item);
          }
          break;
        case "THEME":
          alreadyUnlocked = customization.unlockedThemes.includes(item.code);
          if (!alreadyUnlocked) {
            updates.unlockedThemes = [
              ...(updates.unlockedThemes || customization.unlockedThemes),
              item.code,
            ];
            newlyUnlocked.push(item);
          }
          break;
        case "BADGE":
          alreadyUnlocked = customization.unlockedBadges.includes(item.code);
          if (!alreadyUnlocked) {
            updates.unlockedBadges = [
              ...(updates.unlockedBadges || customization.unlockedBadges),
              item.code,
            ];
            newlyUnlocked.push(item);
          }
          break;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.profileCustomization.update({
        where: { userId },
        data: updates,
      });
    }

    return {
      unlockedItems: newlyUnlocked.map((item: any) => ({
        type: item.type,
        code: item.code,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
      })),
    };
  } catch (error) {
    console.error("Error checking badge count unlocks:", error);
    return { unlockedItems: [] };
  }
}

/**
 * Kullanıcının profil özelleştirmelerini getir
 */
export async function getUserCustomization(userId: string) {
  try {
    const customization = await prisma.profileCustomization.findUnique({
      where: { userId },
    });

    if (!customization) {
      return {
        activeFrame: null,
        activeBackground: null,
        activeTheme: null,
        activeBadges: [],
      };
    }

    // Aktif öğelerin detaylarını getir
    const activeItems = await prisma.customizationItem.findMany({
      where: {
        code: {
          in: [
            customization.activeFrame,
            customization.activeBackground,
            customization.activeTheme,
            ...customization.activeBadges,
          ].filter(Boolean) as string[],
        },
      },
    });

    return {
      activeFrame: activeItems.find(
        (item: any) => item.code === customization.activeFrame
      ),
      activeBackground: activeItems.find(
        (item: any) => item.code === customization.activeBackground
      ),
      activeTheme: activeItems.find(
        (item: any) => item.code === customization.activeTheme
      ),
      activeBadges: activeItems.filter((item: any) =>
        customization.activeBadges.includes(item.code)
      ),
    };
  } catch (error) {
    console.error("Error getting user customization:", error);
    return {
      activeFrame: null,
      activeBackground: null,
      activeTheme: null,
      activeBadges: [],
    };
  }
}
