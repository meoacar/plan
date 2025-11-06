import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpForNextLevel } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        xp: true,
        level: true,
        streak: true,
        _count: {
          select: {
            UserBadge: true,
            Plan: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const nextLevelXP = xpForNextLevel(user.level);
    const currentLevelXP = user.level > 1 ? xpForNextLevel(user.level - 1) : 0;
    const progressXP = user.xp - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const progress = (progressXP / requiredXP) * 100;

    return NextResponse.json({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badgeCount: user._count.UserBadge,
      planCount: user._count.Plan,
      nextLevelXP,
      progress: Math.min(100, Math.max(0, progress)),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "İstatistikler yüklenemedi" },
      { status: 500 }
    );
  }
}
