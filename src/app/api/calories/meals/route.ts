import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const mealSchema = z.object({
  date: z.string(),
  mealType: z.enum(['Kahvaltı', 'Öğle', 'Akşam', 'Atıştırmalık']),
  note: z.string().optional(),
  entries: z.array(z.object({
    foodId: z.string().optional(),
    foodName: z.string(),
    amount: z.number().positive(),
    calories: z.number(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  })),
});

// GET /api/calories/meals - Kullanıcının öğünlerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId: session.user.id };

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: targetDate,
        lt: nextDay,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Meals fetch error:', error);
    return NextResponse.json(
      { error: 'Öğünler yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST /api/calories/meals - Yeni öğün ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = mealSchema.parse(body);

    // Toplam değerleri hesapla
    const totalCalories = data.entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = data.entries.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCarbs = data.entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
    const totalFat = data.entries.reduce((sum, e) => sum + (e.fat || 0), 0);

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        date: new Date(data.date),
        mealType: data.mealType,
        note: data.note,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        entries: {
          create: data.entries.map(entry => ({
            foodId: entry.foodId,
            foodName: entry.foodName,
            amount: entry.amount,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fat: entry.fat,
          })),
        },
      },
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Meal create error:', error);
    return NextResponse.json(
      { error: 'Öğün eklenemedi' },
      { status: 500 }
    );
  }
}
