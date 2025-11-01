import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyGroupMembers, getGroupName, groupNotificationTemplates } from '@/lib/group-notifications';
import { z } from 'zod';

// Validation schema
const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['MEETUP', 'WEBINAR', 'WORKSHOP', 'CHALLENGE', 'OTHER']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  maxParticipants: z.number().int().positive().optional(),
});

// POST /api/groups/[groupId]/events - Create event
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

    // Only ADMIN and MODERATOR can create events
    if (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Only admins and moderators can create events' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createEventSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Event start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (endDate && endDate < startDate) {
      return NextResponse.json(
        { error: 'Event end date cannot be before start date' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.groupEvent.create({
      data: {
        groupId,
        title: validatedData.title,
        description: validatedData.description,
        eventType: validatedData.eventType,
        startDate,
        endDate,
        location: validatedData.location,
        maxParticipants: validatedData.maxParticipants,
        createdBy: session.user.id!,
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

    // Notify all group members about new event
    const groupName = await getGroupName(groupId);
    const notification = groupNotificationTemplates.eventCreated(groupName, validatedData.title);
    
    notifyGroupMembers({
      groupId,
      type: 'GROUP_EVENT_CREATED',
      title: notification.title,
      message: notification.message,
      actionUrl: `/groups/${groupId}/events/${event.id}`,
      actorId: session.user.id!,
      relatedId: event.id,
      excludeUserId: session.user.id!,
    }).catch(err => console.error('Failed to send event notifications:', err));

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/events - Get events list
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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'upcoming'; // upcoming, past, all

    let dateFilter = {};
    const now = new Date();

    if (filter === 'upcoming') {
      dateFilter = { startDate: { gte: now } };
    } else if (filter === 'past') {
      dateFilter = { startDate: { lt: now } };
    }

    // Get events
    const events = await prisma.groupEvent.findMany({
      where: {
        groupId,
        ...dateFilter,
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
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { startDate: filter === 'past' ? 'desc' : 'asc' },
    });

    // Add user participation status
    const eventsWithStatus = events.map((event: any) => ({
      ...event,
      userParticipation: event.participants.find(
        (p: any) => p.userId === session.user.id
      ) || null,
    }));

    return NextResponse.json(eventsWithStatus);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
