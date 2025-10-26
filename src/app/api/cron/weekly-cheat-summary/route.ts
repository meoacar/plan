import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { tr } from "date-fns/locale";

const CHEAT_NAMES: Record<string, string> = {
  SWEET: "tatlı",
  FAST_FOOD: "fast food",
  SODA: "gazlı içecek",
  ALCOHOL: "alkol",
  OTHER: "diğer",
};

export async function GET(req: NextRequest) {
  try {
    // Cron job güvenliği için authorization header kontrolü
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    // Tüm kullanıcıları al
    const users = await prisma.user.findMany({
      where: {
        notificationPreference: {
          emailNewFollower: true, // Email bildirimleri açık olanlar
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    let notificationsSent = 0;

    for (const user of users) {
      // Haftalık kaçamakları al
      const cheatMeals = await prisma.cheatMeal.findMany({
        where: {
          userId: user.id,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      // İstatistikleri hesapla
      const stats = cheatMeals.reduce((acc, meal) => {
        acc[meal.type] = (acc[meal.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalCheats = cheatMeals.length;
      const uniqueDays = new Set(
        cheatMeals.map((m) => format(new Date(m.date), "yyyy-MM-dd"))
      ).size;
      const healthyDays = 7 - uniqueDays;
      const angelPoints = healthyDays * 2;

      // Özet mesajı oluştur
      let summary = `Bu hafta `;
      const statParts = Object.entries(stats).map(
        ([type, count]) => `${count} ${CHEAT_NAMES[type]}`
      );
      summary += statParts.join(", ");
      summary += ` yaptın.\n`;
      summary += `Ama ${healthyDays} gün sağlıklı beslendin 💪\n`;
      summary += `Melek puanın: +${angelPoints}!`;

      // Motivasyon mesajı
      let motivation = "";
      if (totalCheats === 0) {
        motivation = "Mükemmel bir hafta! Hiç kaçamak yapmadın! 🌟";
      } else if (totalCheats <= 2) {
        motivation = "Harika gidiyorsun! Dengeli bir hafta geçirdin! 👍";
      } else if (totalCheats <= 4) {
        motivation = "Fena değil! Gelecek hafta daha iyisini yapabilirsin! 💪";
      } else {
        motivation =
          "Bu hafta biraz fazla kaçamak oldu. Gelecek hafta daha dikkatli olalım! 😊";
      }

      // Bildirim oluştur
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "LEVEL_UP", // Genel bildirim tipi kullanıyoruz
          title: "📊 Haftalık Günah Özeti",
          message: `${summary}\n\n${motivation}`,
          actionUrl: "/gunah-sayaci",
        },
      });

      notificationsSent++;
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      message: `${notificationsSent} kullanıcıya haftalık özet gönderildi`,
    });
  } catch (error) {
    console.error("Error sending weekly summaries:", error);
    return NextResponse.json(
      { error: "Failed to send weekly summaries" },
      { status: 500 }
    );
  }
}
