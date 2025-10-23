import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const goalSchema = z.object({
  dailyCalories: z.number().int().min(800).max(5000),
  dailyProtein: z.number().int().min(0).optional(),
  dailyCarbs: z.number().int().min(0).optional(),
  dailyFat: z.number().int().min(0).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

// GET /api/calories/goal - Kullanıcının kalori hedefini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await prisma.calorieGoal.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Goal fetch error:', error);
    return NextResponse.json(
      { error: 'Hedef yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST /api/calories/goal - Kalori hedefi oluştur/güncelle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = goalSchema.parse(body);

    const goal = await prisma.calorieGoal.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Goal update error:', error);
    return NextResponse.json(
      { error: 'Hedef güncellenemedi' },
      { status: 500 }
    );
  }
}
