import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  resourceType: z.enum(['VIDEO', 'RECIPE', 'EXERCISE', 'PDF', 'ARTICLE', 'LINK']),
  url: z.string().url().max(1000).optional(),
  fileUrl: z.string().url().max(1000).optional(),
  content: z.string().max(50000).optional(),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// POST /api/groups/[groupId]/resources - Create resource
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

    // Only ADMIN and MODERATOR can add resources
    if (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Only admins and moderators can add resources' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createResourceSchema.parse(body);

    // Validate that at least one content field is provided
    if (!validatedData.url && !validatedData.fileUrl && !validatedData.content) {
      return NextResponse.json(
        { error: 'At least one of url, fileUrl, or content must be provided' },
        { status: 400 }
      );
    }

    // Create resource
    const resource = await prisma.groupResource.create({
      data: {
        groupId,
        title: validatedData.title,
        description: validatedData.description,
        resourceType: validatedData.resourceType,
        url: validatedData.url,
        fileUrl: validatedData.fileUrl,
        content: validatedData.content,
        category: validatedData.category,
        tags: validatedData.tags || [],
        uploadedBy: session.user.id!,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Notify all group members about new resource
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { not: session.user.id! },
      },
      select: { userId: true },
    });

    // Notification will be added when GROUP_RESOURCE_ADDED type is added to enum
    // if (members.length > 0) {
    //   await prisma.notification.createMany({
    //     data: members.map((member) => ({
    //       userId: member.userId,
    //       type: 'GROUP_RESOURCE_ADDED',
    //       title: 'Yeni Kaynak Eklendi',
    //       message: `${session.user.name} "${validatedData.title}" kaynağını ekledi`,
    //       actionUrl: `/groups/${groupId}/resources`,
    //       actorId: session.user.id!,
    //       relatedId: resource.id,
    //     })),
    //   });
    // }

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[groupId]/resources - Get resources list
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
    const category = searchParams.get('category');
    const resourceType = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, title

    // Build where clause
    const where: any = { groupId };
    if (category) {
      where.category = category;
    }
    if (resourceType) {
      where.resourceType = resourceType;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'title') {
      orderBy = { title: 'asc' };
    }

    // Get resources
    const resources = await prisma.groupResource.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
