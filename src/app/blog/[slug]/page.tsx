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
import { BlogAuthorBox } from '@/components/blog/blog-author-box';
import {
  generateBlogPostSchema,
  generateBreadcrumbSchema,
  generateAuthorSchema,
} from '@/lib/blog-structured-data';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    return {
      title: 'Yazı Bulunamadı',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zayiflamaplanim.com';
  const url = `${baseUrl}/blog/${params.slug}`;

  return {
    title: post.metaTitle || `${post.title} | Zayıflama Planım`,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords || post.tags.map((t) => t.tag.name).join(', '),
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt || post.title }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      section: post.category?.name,
      tags: post.tags.map((t) => t.tag.name),
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: url,
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
  const authorSchema = generateAuthorSchema(post.authorName, baseUrl);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section with Featured Image */}
        {post.featuredImage && (
          <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              title={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-gray-50" />
            
            {/* Hero Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
                <div className="max-w-4xl mx-auto">
                  {/* Breadcrumb */}
                  <nav className="mb-6 text-sm">
                    <div className="flex items-center gap-2 text-white/90">
                      <Link href="/" className="hover:text-white transition">Ana Sayfa</Link>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <Link href="/blog" className="hover:text-white transition">Blog</Link>
                      {post.category && (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <Link href={`/blog/kategori/${post.category.slug}`} className="hover:text-white transition">
                            {post.category.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>

                  {/* Category Badge */}
                  {post.category && (
                    <div className="mb-4">
                      <span
                        className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md shadow-lg"
                        style={{ backgroundColor: post.category.color + 'dd' }}
                      >
                        {post.category.name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    {post.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">{post.authorName}</span>
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <time dateTime={post.publishedAt.toISOString()}>
                          {format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: tr })}
                        </time>
                      </div>
                    )}
                    {post.readTime && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{post.readTime} dakika okuma</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.views} görüntülenme</span>
                    </div>
                    {post._count && post._count.comments > 0 && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post._count.comments} yorum</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${post.featuredImage ? '-mt-20 relative z-10' : 'py-8'}`}>
          <article className="max-w-4xl mx-auto">
            {/* No Featured Image - Show Breadcrumb and Title */}
            {!post.featuredImage && (
              <div className="mb-8">
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

                {post.category && (
                  <div className="mb-4">
                    <span
                      className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  </div>
                )}

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>

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
              </div>
            )}

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
              {/* Author Box */}
              <div className="px-8 md:px-12 lg:px-16 pt-8">
                <BlogAuthorBox 
                  authorName={post.authorName}
                  publishedAt={post.publishedAt}
                  readTime={post.readTime}
                />
              </div>

              {/* Content */}
              <div className="px-8 md:px-12 lg:px-16 py-8">
                <div
                  className="prose prose-lg md:prose-xl max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:text-gray-700 prose-ul:my-6 prose-li:my-2
                  prose-ol:text-gray-700 prose-ol:my-6
                  prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:w-full
                  prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="px-8 md:px-12 lg:px-16 py-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/blog/etiket/${tag.slug}`}
                        className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-sm font-medium hover:from-green-100 hover:to-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share */}
              <div className="px-8 md:px-12 lg:px-16 py-6 border-t border-gray-100 bg-gray-50">
                <BlogSocialShare title={post.title} url={`/blog/${post.slug}`} />
              </div>

              {/* Reactions */}
              <div className="px-8 md:px-12 lg:px-16 py-6 border-t border-gray-100">
                <BlogReactions postId={post.id} userId={session?.user?.id} />
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 mb-8">
              <BlogComments 
                postId={post.id} 
                userId={session?.user?.id}
                userName={session?.user?.name}
              />
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  İlgili Yazılar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {related.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={related.featuredImage}
                            alt={related.featuredImageAlt || related.title}
                            title={related.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {related.category && (
                            <span
                              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                              style={{ backgroundColor: related.category.color + 'dd' }}
                            >
                              {related.category.name}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition line-clamp-2 text-lg mb-2">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
