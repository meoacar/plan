import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının özelleştirme bilgilerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kullanıcının özelleştirmelerini getir
    let customization = await prisma.profileCustomization.findUnique({
      where: { userId: session.user.id },
    });

    // Yoksa varsayılan oluştur
    if (!customization) {
      customization = await prisma.profileCustomization.create({
        data: {
          userId: session.user.id,
          unlockedFrames: ["default_frame"],
          unlockedBackgrounds: ["default_bg"],
          unlockedThemes: ["classic_theme"],
          unlockedBadges: [],
          activeBadges: [],
        },
      });
    }

    // Kullanıcının rozetlerini say
    const badgeCount = await prisma.userBadge.count({
      where: { userId: session.user.id },
    });

    // Kullanıcının kazandığı rozet tiplerini al
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    });

    const badgeTypes = userBadges.map((ub) => ub.badge.type);

    // Tüm özelleştirme öğelerini getir ve kilitleri kontrol et
    const allItems = await prisma.customizationItem.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });

    // Açılmış öğeleri takip et
    const newlyUnlockedFrames: string[] = [];
    const newlyUnlockedBackgrounds: string[] = [];
    const newlyUnlockedThemes: string[] = [];
    const newlyUnlockedBadges: string[] = [];

    const itemsWithLockStatus = allItems.map((item: any) => {
      let isUnlocked = item.isDefault;

      // Rozet sayısına göre kontrol
      if (!isUnlocked && item.badgeCount) {
        isUnlocked = badgeCount >= item.badgeCount;
      }

      // Belirli rozet tipine göre kontrol
      if (!isUnlocked && item.badgeType) {
        isUnlocked = badgeTypes.includes(item.badgeType);
      }

      // Açılmış ama listeye eklenmemiş öğeleri ekle
      if (isUnlocked) {
        if (item.type === "FRAME" && !customization!.unlockedFrames.includes(item.code)) {
          newlyUnlockedFrames.push(item.code);
        } else if (item.type === "BACKGROUND" && !customization!.unlockedBackgrounds.includes(item.code)) {
          newlyUnlockedBackgrounds.push(item.code);
        } else if (item.type === "THEME" && !customization!.unlockedThemes.includes(item.code)) {
          newlyUnlockedThemes.push(item.code);
        } else if (item.type === "BADGE" && !customization!.unlockedBadges.includes(item.code)) {
          newlyUnlockedBadges.push(item.code);
        }
      }

      return {
        ...item,
        isUnlocked,
        isActive:
          item.code === customization?.activeFrame ||
          item.code === customization?.activeBackground ||
          item.code === customization?.activeTheme ||
          customization?.activeBadges?.includes(item.code),
      };
    });

    // Yeni açılan öğeleri veritabanına ekle
    if (
      newlyUnlockedFrames.length > 0 ||
      newlyUnlockedBackgrounds.length > 0 ||
      newlyUnlockedThemes.length > 0 ||
      newlyUnlockedBadges.length > 0
    ) {
      customization = await prisma.profileCustomization.update({
        where: { userId: session.user.id },
        data: {
          unlockedFrames: {
            push: newlyUnlockedFrames,
          },
          unlockedBackgrounds: {
            push: newlyUnlockedBackgrounds,
          },
          unlockedThemes: {
            push: newlyUnlockedThemes,
          },
          unlockedBadges: {
            push: newlyUnlockedBadges,
          },
        },
      });
    }

    return NextResponse.json({
      customization,
      items: itemsWithLockStatus,
      badgeCount,
      userBadges: badgeTypes,
    });
  } catch (error) {
    console.error("Customization fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Özelleştirmeleri güncelle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { activeFrame, activeBackground, activeTheme, activeBadges } = body;

    // Kullanıcının özelleştirmelerini getir veya oluştur
    let customization = await prisma.profileCustomization.findUnique({
      where: { userId: session.user.id },
    });

    if (!customization) {
      customization = await prisma.profileCustomization.create({
        data: {
          userId: session.user.id,
          unlockedFrames: ["default_frame"],
          unlockedBackgrounds: ["default_bg"],
          unlockedThemes: ["classic_theme"],
          unlockedBadges: [],
          activeBadges: [],
        },
      });
    }

    // Kullanıcının rozet bilgilerini al
    const badgeCount = await prisma.userBadge.count({
      where: { userId: session.user.id },
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    });

    const badgeTypes = userBadges.map((ub) => ub.badge.type);

    // Seçilen öğelerin gerçekten açık olduğunu kontrol et
    const checkIfUnlocked = async (code: string, type: "FRAME" | "BACKGROUND" | "THEME" | "BADGE") => {
      const item = await prisma.customizationItem.findFirst({
        where: { code, type },
      });

      if (!item) return false;
      if (item.isDefault) return true;
      if (item.badgeCount && badgeCount >= item.badgeCount) return true;
      if (item.badgeType && badgeTypes.includes(item.badgeType)) return true;

      return false;
    };

    const updates: any = {};

    if (activeFrame !== undefined) {
      if (activeFrame === null) {
        updates.activeFrame = null;
      } else {
        const isUnlocked = await checkIfUnlocked(activeFrame, "FRAME");
        if (isUnlocked) {
          updates.activeFrame = activeFrame;
          // Eğer unlocked listesinde yoksa ekle
          if (!customization.unlockedFrames.includes(activeFrame)) {
            updates.unlockedFrames = [...customization.unlockedFrames, activeFrame];
          }
        }
      }
    }

    if (activeBackground !== undefined) {
      if (activeBackground === null) {
        updates.activeBackground = null;
      } else {
        const isUnlocked = await checkIfUnlocked(activeBackground, "BACKGROUND");
        if (isUnlocked) {
          updates.activeBackground = activeBackground;
          // Eğer unlocked listesinde yoksa ekle
          if (!customization.unlockedBackgrounds.includes(activeBackground)) {
            updates.unlockedBackgrounds = [...customization.unlockedBackgrounds, activeBackground];
          }
        }
      }
    }

    if (activeTheme !== undefined) {
      if (activeTheme === null) {
        updates.activeTheme = null;
      } else {
        const isUnlocked = await checkIfUnlocked(activeTheme, "THEME");
        if (isUnlocked) {
          updates.activeTheme = activeTheme;
          // Eğer unlocked listesinde yoksa ekle
          if (!customization.unlockedThemes.includes(activeTheme)) {
            updates.unlockedThemes = [...customization.unlockedThemes, activeTheme];
          }
        }
      }
    }

    if (activeBadges !== undefined) {
      // Her rozeti kontrol et
      const validBadges: string[] = [];
      for (const badge of activeBadges.slice(0, 3)) {
        const isUnlocked = await checkIfUnlocked(badge, "BADGE");
        if (isUnlocked) {
          validBadges.push(badge);
          // Eğer unlocked listesinde yoksa ekle
          if (!customization.unlockedBadges.includes(badge)) {
            if (!updates.unlockedBadges) {
              updates.unlockedBadges = [...customization.unlockedBadges];
            }
            updates.unlockedBadges.push(badge);
          }
        }
      }
      updates.activeBadges = validBadges;
    }

    // Güncelle
    const updated = await prisma.profileCustomization.update({
      where: { userId: session.user.id },
      data: updates,
    });

    return NextResponse.json({ success: true, customization: updated });
  } catch (error) {
    console.error("Customization update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
