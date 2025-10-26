import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { checkAndAwardCheatBadges } from "@/lib/cheat-meal-badges";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, note } = await req.json();

    const cheatMeal = await prisma.cheatMeal.create({
      data: {
        userId: session.user.id,
        type,
        note,
      },
    });

    // Badge kontrolü yap (async olarak arka planda)
    checkAndAwardCheatBadges(session.user.id).catch(console.error);

    return NextResponse.json(cheatMeal);
  } catch (error) {
    console.error("Error creating cheat meal:", error);
    return NextResponse.json(
      { error: "Failed to create cheat meal" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    let startDate: Date;
    let endDate: Date;

    if (period === "week") {
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
    } else {
      startDate = new Date(new Date().setDate(1));
      endDate = new Date();
    }

    const cheatMeals = await prisma.cheatMeal.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const stats = await prisma.cheatMeal.groupBy({
      by: ["type"],
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    return NextResponse.json({ cheatMeals, stats });
  } catch (error) {
    console.error("Error fetching cheat meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch cheat meals" },
      { status: 500 }
    );
  }
}
