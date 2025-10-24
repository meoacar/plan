import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      include: {
        members: {
          take: 50,
          orderBy: { joinedAt: 'desc' },
        },
        challenges: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
        posts: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            members: true,
            challenges: true,
            posts: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Grup onaylı değilse ve kullanıcı admin değilse gösterme
    if (group.status !== 'APPROVED' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Kullanıcının üyelik durumunu kontrol et
    let isMember = false;
    let memberRole = null;
    if (session?.user) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: session.user.id,
          },
        },
      });
      isMember = !!membership;
      memberRole = membership?.role;
    }

    return NextResponse.json({
      ...group,
      isMember,
      memberRole,
    });
  } catch (error) {
    console.error('Grup detay hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
