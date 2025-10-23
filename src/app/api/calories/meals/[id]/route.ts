import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/calories/meals/[id] - Öğün sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Öğünün kullanıcıya ait olduğunu kontrol et
    const meal = await prisma.meal.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!meal) {
      return NextResponse.json({ error: 'Öğün bulunamadı' }, { status: 404 });
    }

    if (meal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.meal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Meal delete error:', error);
    return NextResponse.json(
      { error: 'Öğün silinemedi' },
      { status: 500 }
    );
  }
}
