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

export async function PATCH(
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
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Check if user is admin
    const member = group.members[0];
    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, goalType, isPrivate, maxMembers, imageUrl } = body;

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: group.id },
      data: {
        name,
        description,
        goalType,
        isPrivate,
        maxMembers: maxMembers || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Grup güncelleme hatası:', error);
    return NextResponse.json({ error: 'Grup güncellenemedi' }, { status: 500 });
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
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Check if user is admin
    const member = group.members[0];
    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Delete group (cascade will delete members, posts, challenges)
    await prisma.group.delete({
      where: { id: group.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Grup silme hatası:', error);
    return NextResponse.json({ error: 'Grup silinemedi' }, { status: 500 });
  }
}
