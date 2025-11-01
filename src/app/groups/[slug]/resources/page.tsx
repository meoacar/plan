import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ResourceLibrary from '@/components/groups/resources/resource-library';
import ResourceSearch from '@/components/groups/resources/resource-search';
import ResourceUploadForm from '@/components/groups/resources/resource-upload-form';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import ResourcesClient from './resources-client';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    category?: string;
    type?: string;
    sortBy?: string;
    search?: string;
  };
}

async function getGroup(slug: string, userId?: string) {
  const group = await prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      isPrivate: true,
    },
  });

  if (!group) {
    return null;
  }

  // Grup onaylı değilse ve kullanıcı admin değilse gösterme
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  if (group.status !== 'APPROVED' && user?.role !== 'ADMIN') {
    return null;
  }

  // Kullanıcının üyelik durumunu kontrol et
  let isMember = false;
  let memberRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null = null;
  if (userId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId,
        },
      },
    });
    isMember = !!membership;
    memberRole = membership?.role || null;
  }

  return {
    ...group,
    isMember,
    memberRole,
  };
}

async function getResourceCategories(groupId: string) {
  const resources = await prisma.groupResource.findMany({
    where: { groupId },
    select: { category: true },
    distinct: ['category'],
  });

  return resources.map((r: { category: string }) => r.category);
}

export async function generateMetadata({ params }: PageProps) {
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });

  if (!group) {
    return {
      title: 'Grup Bulunamadı',
    };
  }

  return {
    title: `${group.name} - Kaynaklar - Zayıflama Planım`,
    description: `${group.name} grubunun kaynak kütüphanesini görüntüleyin`,
  };
}

export default async function ResourcesPage({ params, searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/groups/${params.slug}/resources`);
  }

  const group = await getGroup(params.slug, session.user.id);

  if (!group) {
    notFound();
  }

  // Üye değilse erişim engelle
  if (!group.isMember) {
    redirect(`/groups/${params.slug}`);
  }

  const categories = await getResourceCategories(group.id);
  const canAddResource = group.memberRole === 'ADMIN' || group.memberRole === 'MODERATOR';

  const activeCategory = searchParams.category;
  const activeType = searchParams.type;
  const activeSortBy = searchParams.sortBy || 'recent';
  const isSearchMode = searchParams.search === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href={`/groups/${params.slug}`}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
              >
                ← {group.name}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Kaynak Kütüphanesi</h1>
              <p className="text-gray-600 mt-1">
                Grup kaynaklarını görüntüleyin ve paylaşın
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/groups/${params.slug}/resources?search=true`}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                  isSearchMode
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Search className="w-5 h-5" />
                Ara
              </Link>
              {canAddResource && (
                <ResourcesClient groupId={group.id} />
              )}
            </div>
          </div>

          {/* Filters */}
          {!isSearchMode && (
            <div className="space-y-4">
              {/* Category Filter */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategori</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/groups/${params.slug}/resources?sortBy=${activeSortBy}`}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        !activeCategory
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Tümü
                    </Link>
                    {categories.map((category: string) => (
                      <Link
                        key={category}
                        href={`/groups/${params.slug}/resources?category=${category}&sortBy=${activeSortBy}`}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          activeCategory === category
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tür</h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/groups/${params.slug}/resources?${activeCategory ? `category=${activeCategory}&` : ''}sortBy=${activeSortBy}`}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      !activeType
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tümü
                  </Link>
                  {['VIDEO', 'RECIPE', 'EXERCISE', 'PDF', 'ARTICLE', 'LINK'].map((type) => (
                    <Link
                      key={type}
                      href={`/groups/${params.slug}/resources?${activeCategory ? `category=${activeCategory}&` : ''}type=${type}&sortBy=${activeSortBy}`}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        activeType === type
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'VIDEO' && 'Video'}
                      {type === 'RECIPE' && 'Tarif'}
                      {type === 'EXERCISE' && 'Egzersiz'}
                      {type === 'PDF' && 'PDF'}
                      {type === 'ARTICLE' && 'Makale'}
                      {type === 'LINK' && 'Link'}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sıralama</h3>
                <div className="flex gap-2">
                  <Link
                    href={`/groups/${params.slug}/resources?${activeCategory ? `category=${activeCategory}&` : ''}${activeType ? `type=${activeType}&` : ''}sortBy=recent`}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeSortBy === 'recent'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    En Yeni
                  </Link>
                  <Link
                    href={`/groups/${params.slug}/resources?${activeCategory ? `category=${activeCategory}&` : ''}${activeType ? `type=${activeType}&` : ''}sortBy=popular`}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeSortBy === 'popular'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    En Popüler
                  </Link>
                  <Link
                    href={`/groups/${params.slug}/resources?${activeCategory ? `category=${activeCategory}&` : ''}${activeType ? `type=${activeType}&` : ''}sortBy=title`}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeSortBy === 'title'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Alfabetik
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isSearchMode ? (
          <ResourceSearch
            groupId={group.id}
            groupSlug={group.slug}
            currentUserId={session.user.id!}
            userRole={group.memberRole || undefined}
          />
        ) : (
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Kaynaklar yükleniyor...</p>
              </div>
            }
          >
            <ResourceLibrary
              groupId={group.id}
              groupSlug={group.slug}
              category={activeCategory}
              resourceType={activeType}
              sortBy={activeSortBy}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
