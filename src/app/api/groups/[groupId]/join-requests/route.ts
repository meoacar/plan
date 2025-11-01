import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Grubu kontrol et
    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Yetki kontrolü - sadece admin ve moderatör görebilir
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member || member.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Bekleyen katılma isteklerini getir
    const joinRequests = await prisma.groupJoinRequest.findMany({
      where: {
        groupId: params.groupId,
        status: 'PENDING',
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Her istek için kullanıcı bilgilerini al
    const requestsWithUsers = await Promise.all(
      joinRequests.map(async (request) => {
        const user = await prisma.user.findUnique({
          where: { id: request.userId },
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            startWeight: true,
            goalWeight: true,
          },
        });

        return {
          ...request,
          user,
        };
      })
    );

    return NextResponse.json({
      success: true,
      joinRequests: requestsWithUsers,
    });
  } catch (error) {
    console.error('Katılma istekleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
