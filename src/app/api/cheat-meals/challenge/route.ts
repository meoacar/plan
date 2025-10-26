import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limit, penalty } = await req.json();

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const challenge = await prisma.cheatChallenge.upsert({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart,
        },
      },
      update: {
        limit,
        penalty,
      },
      create: {
        userId: session.user.id,
        weekStart,
        weekEnd,
        limit,
        penalty,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
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

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    const challenge = await prisma.cheatChallenge.findUnique({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart,
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ challenge: null });
    }

    const cheatCount = await prisma.cheatMeal.count({
      where: {
        userId: session.user.id,
        date: {
          gte: challenge.weekStart,
          lte: challenge.weekEnd,
        },
      },
    });

    return NextResponse.json({
      challenge,
      cheatCount,
      exceeded: cheatCount > challenge.limit,
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
