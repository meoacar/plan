import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { triggerPusherEvent } from '@/lib/pusher-server';
import { notifyGroupMembers, getGroupName, getUserName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

// Validation schema
const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  messageType: z.enum(['TEXT', 'EMOJI', 'GIF', 'SYSTEM']).default('TEXT'),
  metadata: z.any().optional(),
});

// POST /api/groups/[groupId]/messages - Send message
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id!,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createMessageSchema.parse(body);

    // Create message
    const message = await prisma.groupMessage.create({
      data: {
        groupId,
        userId: session.user.id!,
        content: validatedData.content,
        messageType: validatedData.messageType,
        metadata: validatedData.metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Broadcast message via Pusher
    await triggerPusherEvent(
      `presence-group-${groupId}`,
      'new-message',
      message
    );

    // Send notifications to group members (async, don't wait)
    const groupName = await getGroupName(groupId);
    const authorName = await getUserName(session.user.id!);
    const notification = groupNotificationTemplates.newMessage(groupName, authorName);
    
    notifyGroupMembers({
      groupId,
      type: 'GROUP_NEW_MESSAGE',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${groupId}/chat`,
      actorId: session.user.id!,
      relatedId: message.id,
      excludeUserId: session.user.id!, // Don't notify the sender
    }).catch(err => console.error('Failed to send message notifications:', err));

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/messages - Get recent messages
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id!,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Get last 50 messages
    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Return in chronological order
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
