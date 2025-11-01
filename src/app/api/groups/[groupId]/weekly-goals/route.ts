import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMembers, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  targetType: z.enum(['weight_loss', 'activity', 'posts', 'exercise', 'water']),
  targetValue: z.number().positive(),
  weekStart: z.string(),
  weekEnd: z.string(),
});

// POST /api/groups/[groupId]/weekly-goals - Haftalık hedef oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

    // Grup üyeliğini ve rolünü kontrol et
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member || (member.role !== 'ADMIN' && member.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createGoalSchema.parse(body);

    // Aynı hafta için hedef var mı kontrol et
    const existingGoal = await prisma.groupWeeklyGoal.findFirst({
      where: {
        groupId,
        weekStart: new Date(validatedData.weekStart),
      },
    });

    if (existingGoal) {
      return NextResponse.json(
        { error: 'Bu hafta için zaten bir hedef mevcut' },
        { status: 400 }
      );
    }

    // Haftalık hedef oluştur
    const goal = await prisma.groupWeeklyGoal.create({
      data: {
        groupId,
        title: validatedData.title,
        description: validatedData.description,
        targetType: validatedData.targetType,
        targetValue: validatedData.targetValue,
        weekStart: new Date(validatedData.weekStart),
        weekEnd: new Date(validatedData.weekEnd),
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
    });

    // Grup üyelerine bildirim gönder
    const groupName = await getGroupName(groupId);
    const notification = groupNotificationTemplates.weeklyGoal(groupName, validatedData.title);
    
    notifyGroupMembers({
      groupId,
      type: 'GROUP_WEEKLY_GOAL',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${groupId}`,
      actorId: session.user.id,
      relatedId: goal.id,
      excludeUserId: session.user.id,
    }).catch(err => console.error('Failed to send weekly goal notifications:', err));

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly goal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Hedef oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/weekly-goals - Haftalık hedefleri listele
export async function GET(
  _request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

    // Grup üyeliğini kontrol et
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Bu grubun üyesi değilsiniz' },
        { status: 403 }
      );
    }

    const goals = await prisma.groupWeeklyGoal.findMany({
      where: { groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: { weekStart: 'desc' },
      take: 20,
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching weekly goals:', error);
    return NextResponse.json(
      { error: 'Hedefler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
