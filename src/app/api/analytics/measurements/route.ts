import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const measurementSchema = z.object({
  chest: z.number().min(30).max(200).optional(),
  waist: z.number().min(30).max(200).optional(),
  hips: z.number().min(30).max(200).optional(),
  thigh: z.number().min(20).max(150).optional(),
  arm: z.number().min(15).max(100).optional(),
  neck: z.number().min(20).max(80).optional(),
  note: z.string().max(500).optional(),
});

// Ölçüm kayıtlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "90");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const measurements = await prisma.measurement.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(measurements);
  } catch (error) {
    console.error("Measurements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch measurements" },
      { status: 500 }
    );
  }
}

// Yeni ölçüm ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = measurementSchema.parse(body);

    const measurement = await prisma.measurement.create({
      data: {
        userId: session.user.id,
        ...validated,
      },
    });

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Measurement creation error:", error);
    return NextResponse.json(
      { error: "Failed to create measurement" },
      { status: 500 }
    );
  }
}
