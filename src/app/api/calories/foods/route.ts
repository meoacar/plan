import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calories/foods
 * Yiyecek listesini getirir
 * 
 * Query params:
 * - limit: Kaç yiyecek getirileceği (varsayılan: 100)
 * - random: Rastgele sıralama (true/false)
 * - category: Kategori filtresi
 * - search: Arama terimi
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const random = searchParams.get('random') === 'true';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Filtre oluştur
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Yiyecekleri getir
    let foods;

    if (random) {
      // Rastgele sıralama için önce tüm ID'leri al
      const allFoods = await prisma.food.findMany({
        where,
        select: {
          id: true,
          name: true,
          calories: true,
          category: true,
          servingSize: true,
          protein: true,
          carbs: true,
          fat: true,
        },
      });

      // Rastgele karıştır ve limit uygula
      const shuffled = allFoods.sort(() => 0.5 - Math.random());
      foods = shuffled.slice(0, Math.min(limit, shuffled.length));
    } else {
      // Normal sıralama
      foods = await prisma.food.findMany({
        where,
        select: {
          id: true,
          name: true,
          calories: true,
          category: true,
          servingSize: true,
          protein: true,
          carbs: true,
          fat: true,
        },
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json({
      success: true,
      foods,
      count: foods.length,
    });
  } catch (error) {
    console.error('Yiyecek listesi getirme hatası:', error);
    
    return NextResponse.json(
      { 
        error: 'Yiyecekler getirilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
