import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CategoryType = 'level' | 'gender' | 'ageGroup';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryValue = searchParams.get('value');
    const skip = (page - 1) * limit;

    // Kategori tipini belirle
    const categoryType = params.category as CategoryType;
    
    if (!['level', 'gender', 'ageGroup'].includes(categoryType)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori tipi' },
        { status: 400 }
      );
    }

    if (!categoryValue) {
      return NextResponse.json(
        { error: 'Kategori değeri gerekli' },
        { status: 400 }
      );
    }

    // Where koşulunu oluştur
    const where: any = {
      status: 'APPROVED',
      [categoryType]: categoryValue
    };

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              challenges: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.group.count({ where }),
    ]);

    return NextResponse.json({
      groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Kategoriye göre grup listesi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
