import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const goalType = searchParams.get('goalType');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
    };

    if (goalType) {
      where.goalType = goalType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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
    console.error('Grup listesi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, goalType, targetWeight, isPrivate, maxMembers, imageUrl } = body;

    // Slug oluştur
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Slug benzersizliğini kontrol et
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.group.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const group = await prisma.group.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        goalType,
        targetWeight,
        isPrivate: isPrivate || false,
        maxMembers,
        imageUrl,
        createdBy: session.user.id,
        status: 'PENDING',
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
        _count: {
          select: {
            members: true,
            challenges: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Grup oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
