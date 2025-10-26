import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.blogComment.update({
      where: { id: params.commentId },
      data: { isApproved: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    return NextResponse.json(
      { error: 'Failed to reject comment' },
      { status: 500 }
    );
  }
}
