import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    });

    const allBadges = await prisma.badge.findMany({
      orderBy: {
        xpReward: "asc",
      },
    });

    return NextResponse.json({
      earned: userBadges,
      all: allBadges,
    });
  } catch (error) {
    console.error("Badges error:", error);
    return NextResponse.json(
      { error: "Rozetler yüklenemedi" },
      { status: 500 }
    );
  }
}
