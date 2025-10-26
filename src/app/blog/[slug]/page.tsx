import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BlogComments } from '@/components/blog/blog-comments';
import { BlogReactions } from '@/components/blog/blog-reactions';
import { BlogSocialShare } from '@/components/blog/blog-social-share';
import {
  generateBlogPostSchema,
  generateBreadcrumbSchema,
} from '@/lib/blog-structured-data';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return {
      title: 'Yazı Bulunamadı',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
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
  });

  if (!post || !post.isPublished) {
    return null;
  }

  // Görüntülenme sayısını artır
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return post;
}

async function getRelatedPosts(postId: string, categoryId: string | null) {
  if (!categoryId) return [];

  return await prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      categoryId,
      status: 'PUBLISHED',
      isPublished: true,
    },
    take: 3,
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      category: true,
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const [post, session] = await Promise.all([
    getPost(params.slug),
    auth(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zayiflamaplanim.com';
  
  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Blog', url: '/blog' },
  ];
  
  if (post.category) {
    breadcrumbItems.push({
      name: post.category.name,
      url: `/blog/kategori/${post.category.slug}`,
    });
  }
  
  breadcrumbItems.push({
    name: post.title,
    url: `/blog/${post.slug}`,
  });

  // Generate structured data
  const articleSchema = generateBlogPostSchema(post, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        <article className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Link href="/" className="hover:text-green-600 transition">Ana Sayfa</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/blog" className="hover:text-green-600 transition">Blog</Link>
            {post.category && (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href={`/blog/kategori/${post.category.slug}`} className="hover:text-green-600 transition">
                  {post.category.name}
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                title={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category Badge on Image */}
              {post.category && (
                <div className="absolute top-6 left-6">
                  <span
                    className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
                    style={{ backgroundColor: post.category.color + 'dd' }}
                  >
                    {post.category.name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <header className="px-6 md:px-12 pt-8 pb-6">
            {!post.featuredImage && post.category && (
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-4"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{post.authorName}</span>
              </div>
              {post.publishedAt && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={post.publishedAt.toISOString()}>
                    {format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: tr })}
                  </time>
                </div>
              )}
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.readTime} dakika okuma</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views} görüntülenme</span>
              </div>
              {post._count && post._count.comments > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post._count.comments} yorum</span>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="px-6 md:px-12 py-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Social Share */}
          <div className="px-6 md:px-12 py-6 border-t border-gray-200">
            <BlogSocialShare title={post.title} url={`/blog/${post.slug}`} />
          </div>

          {/* Reactions */}
          <div className="px-6 md:px-12 py-6 border-t border-gray-200">
            <BlogReactions postId={post.id} userId={session?.user?.id} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="px-6 md:px-12 py-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/blog/etiket/${tag.slug}`}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 mb-8">
          <BlogComments 
            postId={post.id} 
            userId={session?.user?.id}
            userName={session?.user?.name}
          />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              İlgili Yazılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group"
                >
                  {related.featuredImage && (
                    <div className="relative h-48 rounded-xl overflow-hidden mb-4 shadow-md">
                      <img
                        src={related.featuredImage}
                        alt={related.featuredImageAlt || related.title}
                        title={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {related.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
                      style={{ backgroundColor: related.category.color }}
                    >
                      {related.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition line-clamp-2 text-lg">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
