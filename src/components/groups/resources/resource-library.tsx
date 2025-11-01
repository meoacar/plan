import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import ResourceCard from './resource-card';
import { redirect } from 'next/navigation';

interface ResourceLibraryProps {
  groupId: string;
  groupSlug: string;
  category?: string;
  resourceType?: string;
  sortBy?: string;
}

export default async function ResourceLibrary({
  groupId,
  groupSlug,
  category,
  resourceType,
  sortBy = 'recent',
}: ResourceLibraryProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Check membership
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: session.user.id!,
      },
    },
  });

  if (!membership) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Bu grubun üyesi değilsiniz.</p>
      </div>
    );
  }

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

  // Fetch resources
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

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Henüz kaynak eklenmemiş.</p>
        {(membership.role === 'ADMIN' || membership.role === 'MODERATOR') && (
          <p className="text-sm text-gray-500">
            İlk kaynağı eklemek için yukarıdaki butonu kullanın.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          groupId={groupId}
          groupSlug={groupSlug}
          currentUserId={session.user.id!}
          userRole={membership.role}
        />
      ))}
    </div>
  );
}
