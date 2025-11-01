import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModernGroupHeader } from "@/components/groups/modern-group-header";
import GroupFeed from "@/components/groups/group-feed";

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    tab?: string;
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

export default async function GroupPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const group = await getGroup(params.slug, session?.user?.id);

  if (!group) {
    notFound();
  }

  // Varsayılan tab: akış
  const activeTab = searchParams.tab || 'feed';
  const isAdmin = group.memberRole === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <ModernGroupHeader group={group} />

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Yükleniyor...</p>
              </div>
            }>
              <GroupFeed
                groupSlug={params.slug}
                groupId={group.id}
                isMember={group.isMember}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Grup İstatistikleri</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Üye</span>
                    <span className="font-semibold text-gray-900">{group._count.members}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aktif Challenge</span>
                    <span className="font-semibold text-gray-900">{group._count.challenges}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gizlilik</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {group.isPrivate ? 'Özel' : 'Herkese Açık'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Members */}
              {group.members.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Son Katılanlar</h3>
                  <div className="space-y-3">
                    {group.members.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                          {member.user.image ? (
                            <img 
                              src={member.user.image} 
                              alt={member.user.name || 'Üye'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{member.user.name?.[0] || '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.role === 'ADMIN' ? 'Yönetici' : 'Üye'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
