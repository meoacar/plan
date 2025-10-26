import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { generateCollectionPageSchema } from '@/lib/blog-structured-data';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zayiflamaplanim.com';

export const metadata: Metadata = {
  title: 'Blog - Sağlıklı Yaşam ve Zayıflama İpuçları | Zayıflama Planım',
  description: 'Beslenme, egzersiz, motivasyon ve sağlıklı yaşam hakkında uzman tavsiyeleri ve ipuçları. Bilimsel araştırmalara dayalı, uygulanabilir içerikler.',
  keywords: 'sağlıklı yaşam, zayıflama, diyet, beslenme, egzersiz, motivasyon, kilo verme, sağlıklı beslenme',
  openGraph: {
    title: 'Blog - Sağlıklı Yaşam ve Zayıflama İpuçları',
    description: 'Beslenme, egzersiz, motivasyon ve sağlıklı yaşam hakkında uzman tavsiyeleri ve ipuçları.',
    url: `${baseUrl}/blog`,
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};

export const revalidate = 300; // 5 dakika cache

async function getBlogPosts() {
  return await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      isPublished: true,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: {
            where: {
              isApproved: true,
            },
          },
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  });
}

async function getCategories() {
  return await prisma.blogCategory.findMany({
    orderBy: {
      order: 'asc',
    },
  });
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories(),
  ]);

  // Generate structured data
  const collectionSchema = generateCollectionPageSchema(
    'Sağlıklı Yaşam Blogu',
    'Beslenme, egzersiz, motivasyon ve sağlıklı yaşam hakkında uzman tavsiyeleri',
    '/blog',
    baseUrl,
    posts.length
  );

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sağlıklı Yaşam Blogu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Beslenme, egzersiz, motivasyon ve sağlıklı yaşam hakkında uzman tavsiyeleri
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Tümü
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/kategori/${cat.slug}`}
                className="px-4 py-2 rounded-full bg-white text-gray-700 text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
                style={{ borderColor: cat.color }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Henüz blog yazısı yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.featuredImageAlt || post.title}
                        title={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-6">
                  {post.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  )}
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-green-600 transition line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      {post.readTime && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {post.readTime} dk
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </span>
                    </div>
                    {post.publishedAt && (
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
