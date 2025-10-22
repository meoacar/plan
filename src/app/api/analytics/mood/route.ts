import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moodLogSchema = z.object({
  mood: z.number().min(1).max(5),
  stress: z.number().min(1).max(5).optional(),
  note: z.string().max(500).optional(),
});

// Ruh hali kayıtlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.moodLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Mood logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood logs" },
      { status: 500 }
    );
  }
}

// Yeni ruh hali kaydı ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = moodLogSchema.parse(body);

    const log = await prisma.moodLog.create({
      data: {
        userId: session.user.id,
        ...validated,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Mood log creation error:", error);
    return NextResponse.json(
      { error: "Failed to create mood log" },
      { status: 500 }
    );
  }
}
