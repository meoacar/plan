import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const updateStatusSchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'NOT_GOING']),
});

// PATCH /api/groups/[groupId]/events/[eventId]/status - Update participation status
export async function PATCH(
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

    const body = await req.json();
    const validatedData = updateStatusSchema.parse(body);

    // Check if user is participating
    const participation = await prisma.groupEventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id!,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'You are not participating in this event' },
        { status: 404 }
      );
    }

    // Check if max participants reached when changing to GOING
    if (
      validatedData.status === 'GOING' &&
      participation.status !== 'GOING' &&
      event.maxParticipants &&
      event._count.participants >= event.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'Event has reached maximum participants' },
        { status: 400 }
      );
    }

    // Update participation status
    const updatedParticipation = await prisma.groupEventParticipant.update({
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

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating participation status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
