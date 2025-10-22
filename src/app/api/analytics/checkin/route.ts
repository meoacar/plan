import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkInSchema = z.object({
  weight: z.number().min(20).max(400).optional(),
  energy: z.number().min(1).max(5).optional(),
  motivation: z.number().min(1).max(5).optional(),
  sleep: z.number().min(0).max(24).optional(),
  water: z.number().min(0).max(30).optional(),
  exercise: z.boolean().optional(),
  dietPlan: z.boolean().optional(),
  note: z.string().max(1000).optional(),
});

// Check-in kayıtlarını getir
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

    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error("Check-ins fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

// Yeni check-in ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = checkInSchema.parse(body);

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.user.id,
        ...validated,
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Check-in creation error:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
