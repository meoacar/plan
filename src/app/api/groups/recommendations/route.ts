import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecommendedGroups, getRecommendationReason } from '@/lib/group-recommendations';

// Cache için basit in-memory store (production'da Redis kullanılmalı)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 gün (milisaniye)

/**
 * GET /api/groups/recommendations
 * Kullanıcı için önerilen grupları getir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Cache kontrolü
    const cacheKey = `recommendations:${userId}:${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        groups: cached.data,
        cached: true,
      });
    }

    // Önerilen grupları hesapla
    const recommendedGroups = await getRecommendedGroups(userId, limit);

    // Her grup için öneri nedenini ekle
    const groupsWithReasons = recommendedGroups.map((group) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      imageUrl: group.imageUrl,
      isPrivate: group.isPrivate,
      memberCount: group._count.members,
      matchScore: group.matchScore,
      reason: getRecommendationReason(group.matchScore),
    }));

    // Cache'e kaydet
    cache.set(cacheKey, {
      data: groupsWithReasons,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      groups: groupsWithReasons,
      cached: false,
    });
  } catch (error) {
    console.error('Grup önerileri hatası:', error);
    return NextResponse.json(
      { error: 'Grup önerileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
