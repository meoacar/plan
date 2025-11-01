import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for update
const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['MEETUP', 'WEBINAR', 'WORKSHOP', 'CHALLENGE', 'OTHER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
});

// GET /api/groups/[groupId]/events/[eventId] - Get event detail
export async function GET(
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
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        participants: {
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
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            participants: true,
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

    // Add user participation status
    const userParticipation = event.participants.find(
      (p: any) => p.userId === session.user.id
    ) || null;

    return NextResponse.json({
      ...event,
      userParticipation,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[groupId]/events/[eventId] - Update event
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

    // Check if user is a member with appropriate role
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

    // Get event to check ownership
    const event = await prisma.groupEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Only creator, admin, or moderator can update
    const canUpdate =
      event.createdBy === session.user.id ||
      membership.role === 'ADMIN' ||
      membership.role === 'MODERATOR';

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'You do not have permission to update this event' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateEventSchema.parse(body);

    // Validate dates if provided
    if (validatedData.startDate) {
      const startDate = new Date(validatedData.startDate);
      if (startDate < new Date()) {
        return NextResponse.json(
          { error: 'Event start date cannot be in the past' },
          { status: 400 }
        );
      }
    }

    if (validatedData.endDate && validatedData.startDate) {
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'Event end date cannot be before start date' },
          { status: 400 }
        );
      }
    }

    // Update event
    const updatedEvent = await prisma.groupEvent.update({
      where: { id: eventId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.eventType && { eventType: validatedData.eventType }),
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate !== undefined && { 
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null 
        }),
        ...(validatedData.location !== undefined && { location: validatedData.location }),
        ...(validatedData.maxParticipants !== undefined && { maxParticipants: validatedData.maxParticipants }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/events/[eventId] - Delete event
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

    // Check if user is a member with appropriate role
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

    // Get event to check ownership
    const event = await prisma.groupEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Only creator or admin can delete
    const canDelete =
      event.createdBy === session.user.id ||
      membership.role === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this event' },
        { status: 403 }
      );
    }

    // Delete event (participants will be cascade deleted)
    await prisma.groupEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
