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

    // Seçilen öğelerin açık olduğunu kontrol et
    const updates: any = {};

    if (activeFrame !== undefined) {
      if (
        customization.unlockedFrames.includes(activeFrame) ||
        activeFrame === null
      ) {
        updates.activeFrame = activeFrame;
      }
    }

    if (activeBackground !== undefined) {
      if (
        customization.unlockedBackgrounds.includes(activeBackground) ||
        activeBackground === null
      ) {
        updates.activeBackground = activeBackground;
      }
    }

    if (activeTheme !== undefined) {
      if (
        customization.unlockedThemes.includes(activeTheme) ||
        activeTheme === null
      ) {
        updates.activeTheme = activeTheme;
      }
    }

    if (activeBadges !== undefined) {
      // Max 3 rozet
      const validBadges = activeBadges
        .filter((badge: string) => customization!.unlockedBadges.includes(badge))
        .slice(0, 3);
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
