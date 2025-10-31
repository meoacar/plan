import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    if (group.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Grup henüz onaylanmamış' }, { status: 403 });
    }

    // Maksimum üye kontrolü
    if (group.maxMembers && group._count.members >= group.maxMembers) {
      return NextResponse.json({ error: 'Grup dolu' }, { status: 400 });
    }

    // Zaten üye mi kontrol et
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Zaten üyesiniz' }, { status: 400 });
    }

    // Özel grup ise katılma isteği oluştur
    if (group.isPrivate) {
      const joinRequest = await prisma.groupJoinRequest.create({
        data: {
          groupId: group.id,
          userId: session.user.id,
          message,
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        requiresApproval: true,
        joinRequest,
      });
    }

    // Açık grup ise direkt üye yap
    const member = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({
      success: true,
      requiresApproval: false,
      member,
    });
  } catch (error) {
    console.error('Gruba katılma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { slug: params.slug },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Üyelik kontrolü
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Üye değilsiniz' }, { status: 400 });
    }

    // Admin ise ve tek admin ise ayrılamaz
    if (member.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: group.id,
          role: 'ADMIN',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Tek admin olduğunuz için gruptan ayrılamazsınız. Önce başka bir üyeyi admin yapın.' },
          { status: 400 }
        );
      }
    }

    // Üyeliği sil
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gruptan ayrılma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
