import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Kullanıcının bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        goalWeight: true,
        startWeight: true,
        city: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    console.log('Current user:', { id: session.user.id, image: user.image });

    // Zaten takip ettiği kullanıcıları al
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    console.log('Following IDs:', followingIds);

    // Benzer hedeflere sahip kullanıcıları bul
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...followingIds, session.user.id],
        },
        AND: [
          {
            OR: [
              // Benzer hedef kilo
              user.goalWeight
                ? {
                    goalWeight: {
                      gte: user.goalWeight - 10,
                      lte: user.goalWeight + 10,
                    },
                  }
                : {},
              // Aynı şehir
              user.city ? { city: user.city } : {},
              // Aktif kullanıcılar (en az 1 plan var)
              {
                plans: {
                  some: {},
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        goalWeight: true,
        startWeight: true,
        city: true,
        _count: {
          select: {
            followers: true,
            plans: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found suggestions:', suggestions.length);
    console.log('Sample suggestion:', suggestions[0]);

    // Önerileri skorla
    const scoredSuggestions = suggestions.map((suggestion) => {
      let score = 0;
      let reasons: string[] = [];

      // Benzer hedef kilo
      if (
        user.goalWeight &&
        suggestion.goalWeight &&
        Math.abs(user.goalWeight - suggestion.goalWeight) <= 10
      ) {
        score += 3;
        reasons.push('Benzer hedef kilo');
      }

      // Aynı şehir
      if (user.city && suggestion.city === user.city) {
        score += 2;
        reasons.push('Aynı şehir');
      }

      // Popülerlik
      if (suggestion._count.followers > 10) {
        score += 1;
        reasons.push('Popüler kullanıcı');
      }

      // Aktif kullanıcı
      if (suggestion._count.plans > 0) {
        score += 1;
        reasons.push('Aktif kullanıcı');
      }

      return {
        ...suggestion,
        score,
        reason: reasons.join(', ') || 'Yeni kullanıcı',
      };
    });

    // Skora göre sırala
    scoredSuggestions.sort((a, b) => b.score - a.score);

    console.log('Returning suggestions with images:', scoredSuggestions.map(s => ({ name: s.name, image: s.image })));

    return NextResponse.json(scoredSuggestions);
  } catch (error) {
    console.error('Arkadaş önerileri hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
