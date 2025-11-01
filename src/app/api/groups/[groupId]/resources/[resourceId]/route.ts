import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[groupId]/resources/[resourceId] - Get resource detail
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string; resourceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId, resourceId } = params;

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

    // Get resource
    const resource = await prisma.groupResource.findUnique({
      where: { id: resourceId },
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

    if (!resource || resource.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.groupResource.update({
      where: { id: resourceId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      ...resource,
      views: resource.views + 1,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId]/resources/[resourceId] - Delete resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string; resourceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId, resourceId } = params;

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

    // Get resource to check ownership
    const resource = await prisma.groupResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Only ADMIN, MODERATOR, or the uploader can delete
    const canDelete =
      membership.role === 'ADMIN' ||
      membership.role === 'MODERATOR' ||
      resource.uploadedBy === session.user.id!;

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this resource' },
        { status: 403 }
      );
    }

    // Delete resource
    await prisma.groupResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
