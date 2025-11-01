import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Tüm kategorileri ve her kategorideki grup sayısını getir
    const [
      levelCounts,
      genderCounts,
      ageGroupCounts,
      totalGroups
    ] = await Promise.all([
      // Seviye kategorileri
      prisma.group.groupBy({
        by: ['level'],
        where: {
          status: 'APPROVED',
          level: { not: null }
        },
        _count: true,
      }),
      // Cinsiyet kategorileri
      prisma.group.groupBy({
        by: ['gender'],
        where: {
          status: 'APPROVED',
          gender: { not: null }
        },
        _count: true,
      }),
      // Yaş grubu kategorileri
      prisma.group.groupBy({
        by: ['ageGroup'],
        where: {
          status: 'APPROVED',
          ageGroup: { not: null }
        },
        _count: true,
      }),
      // Toplam grup sayısı
      prisma.group.count({
        where: { status: 'APPROVED' }
      })
    ]);

    // Kategori etiketlerini Türkçe'ye çevir
    const levelLabels: Record<string, string> = {
      BEGINNER: 'Başlangıç',
      INTERMEDIATE: 'Orta',
      ADVANCED: 'İleri'
    };

    const genderLabels: Record<string, string> = {
      MALE: 'Erkek',
      FEMALE: 'Kadın',
      MIXED: 'Karma'
    };

    const ageGroupLabels: Record<string, string> = {
      AGE_18_25: '18-25 Yaş',
      AGE_26_35: '26-35 Yaş',
      AGE_36_45: '36-45 Yaş',
      AGE_46_PLUS: '46+ Yaş'
    };

    const categories = {
      level: levelCounts.map(item => ({
        value: item.level,
        label: levelLabels[item.level as string] || item.level,
        count: item._count
      })),
      gender: genderCounts.map(item => ({
        value: item.gender,
        label: genderLabels[item.gender as string] || item.gender,
        count: item._count
      })),
      ageGroup: ageGroupCounts.map(item => ({
        value: item.ageGroup,
        label: ageGroupLabels[item.ageGroup as string] || item.ageGroup,
        count: item._count
      })),
      total: totalGroups
    };

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Kategori listesi hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
