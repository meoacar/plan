import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, isAfter } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    // Cron job güvenliği
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let completedCount = 0;

    // Biten challenge'ları bul
    const challenges = await prisma.cheatChallenge.findMany({
      where: {
        completed: false,
        weekEnd: {
          lt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const challenge of challenges) {
      // Haftalık kaçamak sayısını hesapla
      const cheatCount = await prisma.cheatMeal.count({
        where: {
          userId: challenge.userId,
          date: {
            gte: challenge.weekStart,
            lte: challenge.weekEnd,
          },
        },
      });

      const exceeded = cheatCount > challenge.limit;

      // Challenge'ı tamamla
      await prisma.cheatChallenge.update({
        where: { id: challenge.id },
        data: { completed: true },
      });

      // Bildirim gönder
      let message = "";
      let title = "";

      if (exceeded) {
        title = "❌ Challenge Başarısız";
        message = `Bu hafta ${cheatCount} kaçamak yaptın (limit: ${challenge.limit}).\n`;
        if (challenge.penalty) {
          message += `Ceza zamanı: ${challenge.penalty} 😅`;
        }
      } else {
        title = "✅ Challenge Başarılı!";
        message = `Tebrikler! Bu hafta sadece ${cheatCount} kaçamak yaptın (limit: ${challenge.limit}).\nHarikasın! 🎉`;
      }

      await prisma.notification.create({
        data: {
          userId: challenge.userId,
          type: exceeded ? "LEVEL_UP" : "BADGE_EARNED",
          title,
          message,
          actionUrl: "/gunah-sayaci",
        },
      });

      completedCount++;
    }

    return NextResponse.json({
      success: true,
      completedCount,
      message: `${completedCount} challenge tamamlandı`,
    });
  } catch (error) {
    console.error("Error checking challenges:", error);
    return NextResponse.json(
      { error: "Failed to check challenges" },
      { status: 500 }
    );
  }
}
