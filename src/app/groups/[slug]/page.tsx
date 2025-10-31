import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GroupDetail from "@/components/groups/group-detail";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getGroup(slug: string, userId?: string) {
  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 50,
      },
      challenges: {
        where: { isActive: true },
        orderBy: { startDate: "desc" },
        take: 10,
      },
      _count: {
        select: {
          members: true,
          challenges: true,
        },
      },
    },
  });

  if (!group) {
    return null;
  }

  // Grup onaylı değilse ve kullanıcı admin değilse gösterme
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (group.status !== "APPROVED" && user?.role !== "ADMIN") {
    return null;
  }

  // Kullanıcının üyelik durumunu kontrol et
  let isMember = false;
  let memberRole = null;
  if (userId) {
    const membership = group.members.find((m) => m.userId === userId);
    isMember = !!membership;
    memberRole = membership?.role || null;
  }

  return {
    ...group,
    isMember,
    memberRole,
  };
}

export async function generateMetadata({ params }: PageProps) {
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });

  if (!group) {
    return {
      title: "Grup Bulunamadı",
    };
  }

  return {
    title: `${group.name} - Zayıflama Planım`,
    description: group.description,
  };
}

export default async function GroupPage({ params }: PageProps) {
  const session = await auth();
  const group = await getGroup(params.slug, session?.user?.id);

  if (!group) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center py-8">Yükleniyor...</div>}>
        <GroupDetail group={group} />
      </Suspense>
    </div>
  );
}
