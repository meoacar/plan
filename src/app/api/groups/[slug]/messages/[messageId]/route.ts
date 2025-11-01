import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { triggerPusherEvent } from '@/lib/pusher-server';

// DELETE /api/groups/[slug]/messages/[messageId] - Delete message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; messageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, messageId } = await params;

    // Get group by slug
    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get message
    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        userId: true,
        groupId: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.groupId !== group.id) {
      return NextResponse.json(
        { error: 'Message does not belong to this group' },
        { status: 400 }
      );
    }

    // Check permissions
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id!,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Check if user can delete this message
    const canDelete =
      message.userId === session.user.id || // Own message
      membership.role === 'LEADER' || // Group leader
      membership.role === 'MODERATOR'; // Moderator

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Delete message
    await prisma.groupMessage.delete({
      where: { id: messageId },
    });

    // Broadcast deletion via Pusher
    await triggerPusherEvent(
      `presence-group-${group.id}`,
      'message-deleted',
      { messageId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
