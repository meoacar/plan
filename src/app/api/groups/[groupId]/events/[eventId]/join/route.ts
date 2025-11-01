import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const joinEventSchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'NOT_GOING']).default('GOING'),
});

// POST /api/groups/[groupId]/events/[eventId]/join - Join event
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string; eventId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId, eventId } = params;

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

    // Get event
    const event = await prisma.groupEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            participants: {
              where: { status: 'GOING' },
            },
          },
        },
      },
    });

    if (!event || event.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is in the past
    if (event.startDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot join a past event' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = joinEventSchema.parse(body);

    // Check if max participants reached (only for GOING status)
    if (
      validatedData.status === 'GOING' &&
      event.maxParticipants &&
      event._count.participants >= event.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'Event has reached maximum participants' },
        { status: 400 }
      );
    }

    // Check if already participating
    const existingParticipation = await prisma.groupEventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id!,
        },
      },
    });

    let participation;

    if (existingParticipation) {
      // Update existing participation
      participation = await prisma.groupEventParticipant.update({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id!,
          },
        },
        data: {
          status: validatedData.status,
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
    } else {
      // Create new participation
      participation = await prisma.groupEventParticipant.create({
        data: {
          eventId,
          userId: session.user.id!,
          status: validatedData.status,
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

      // Notify event creator if user is joining
      if (validatedData.status === 'GOING' && event.createdBy !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: event.createdBy,
            type: 'GROUP_EVENT_JOIN',
            title: 'Etkinliğe Katılım',
            message: `${session.user.name} "${event.title}" etkinliğine katılacak`,
            actionUrl: `/groups/${groupId}/events/${eventId}`,
            actorId: session.user.id!,
            relatedId: eventId,
          },
        });
      }
    }

    return NextResponse.json(participation, { status: existingParticipation ? 200 : 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/events/[eventId]/join - Leave event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string; eventId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId, eventId } = params;

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

    // Get event
    const event = await prisma.groupEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete participation
    await prisma.groupEventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id!,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
