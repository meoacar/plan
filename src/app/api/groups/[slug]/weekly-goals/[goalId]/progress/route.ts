import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const progressSchema = z.object({
  value: z.number().positive(),
});

// POST /api/groups/[groupId]/weekly-goals/[goalId]/progress - İlerleme kaydet
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string; goalId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, goalId } = params;

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

    // Hedefin varlığını kontrol et
    const goal = await prisma.groupWeeklyGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Hedef bulunamadı' },
        { status: 404 }
      );
    }

    // Hedefin aktif olup olmadığını kontrol et
    const now = new Date();
    if (now < goal.weekStart || now > goal.weekEnd) {
      return NextResponse.json(
        { error: 'Bu hedef artık aktif değil' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = progressSchema.parse(body);

    // Mevcut ilerlemeyi kontrol et
    const existingProgress = await prisma.groupGoalProgress.findFirst({
      where: {
        goalId,
        userId: session.user.id,
      },
    });

    let progress;
    if (existingProgress) {
      // Mevcut ilerlemeyi güncelle
      progress = await prisma.groupGoalProgress.update({
        where: { id: existingProgress.id },
        data: {
          value: validatedData.value,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Yeni ilerleme kaydı oluştur
      progress = await prisma.groupGoalProgress.create({
        data: {
          goalId,
          userId: session.user.id,
          value: validatedData.value,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    // Toplam ilerlemeyi hesapla ve güncelle
    const allProgress = await prisma.groupGoalProgress.findMany({
      where: { goalId },
    });

    const totalValue = allProgress.reduce((sum: number, p: any) => sum + p.value, 0);
    const completed = totalValue >= goal.targetValue;

    await prisma.groupWeeklyGoal.update({
      where: { id: goalId },
      data: {
        currentValue: totalValue,
        completed,
      },
    });

    // Hedef tamamlandıysa bildirim gönder (opsiyonel)
    if (completed && !goal.completed) {
      const members = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });

      if (members.length > 0) {
        try {
          await prisma.notification.createMany({
            data: members.map((m) => ({
              userId: m.userId,
              type: 'FOLLOW_REQUEST' as any, // Geçici tip
              title: 'Hedef Tamamlandı! 🎉',
              message: `${goal.title} - Haftalık hedef başarıyla tamamlandı!`,
              actionUrl: `/groups/${groupId}`,
              relatedId: goalId,
            })),
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error recording progress:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'İlerleme kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/weekly-goals/[goalId]/progress - İlerleme listesini getir
export async function GET(
  _request: NextRequest,
  { params }: { params: { groupId: string; goalId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, goalId } = params;

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

    const progress = await prisma.groupGoalProgress.findMany({
      where: { goalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        value: 'desc',
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'İlerleme getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
