import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/calories/foods - Yemek listesi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const commonOnly = searchParams.get('commonOnly') === 'true';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (commonOnly) {
      where.isCommon = true;
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: [
        { isCommon: 'desc' },
        { name: 'asc' },
      ],
      take: 50,
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Foods fetch error:', error);
    return NextResponse.json(
      { error: 'Yemekler yüklenemedi' },
      { status: 500 }
    );
  }
}
