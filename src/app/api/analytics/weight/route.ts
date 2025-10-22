import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const weightLogSchema = z.object({
  weight: z.number().min(20).max(400),
  note: z.string().max(500).optional(),
});

// Kilo kayıtlarını getir
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

    const logs = await prisma.weightLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Weight logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight logs" },
      { status: 500 }
    );
  }
}

// Yeni kilo kaydı ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = weightLogSchema.parse(body);

    const log = await prisma.weightLog.create({
      data: {
        userId: session.user.id,
        weight: validated.weight,
        note: validated.note,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Weight log creation error:", error);
    return NextResponse.json(
      { error: "Failed to create weight log" },
      { status: 500 }
    );
  }
}
