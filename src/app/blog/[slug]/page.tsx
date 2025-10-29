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
    take: 4,
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      category: true,
    },
  });
}

async function getRecentPosts(postId: string) {
  return await prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      status: 'PUBLISHED',
      isPublished: true,
    },
    take: 5,
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

  const [relatedPosts, recentPosts] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId),
    getRecentPosts(post.id),
  ]);

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

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="text-sm">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Article - 8 columns */}
            <article className="lg:col-span-8">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-2xl">
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    title={post.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  {post.category && (
                    <div className="absolute top-6 left-6">
                      <span
                        className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-md shadow-lg"
                        style={{ backgroundColor: post.category.color }}
                      >
                        {post.category.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Article Header */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                {!post.featuredImage && post.category && (
                  <span
                    className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4"
                    style={{ backgroundColor: post.category.color }}
                  >
                    {post.category.name}
                  </span>
                )}
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{post.authorName}</div>
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()} className="text-xs text-gray-500">
                          {format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: tr })}
                        </time>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto">
                    {post.readTime && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{post.readTime} dk</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">{post.views}</span>
                    </div>
                    {post._count && post._count.comments > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm">{post._count.comments}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Share */}
                <div className="pt-6">
                  <BlogSocialShare title={post.title} url={`/blog/${post.slug}`} />
                </div>
              </div>

              {/* Article Content */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div
                  className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                  prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-ul:my-6 prose-li:my-2 prose-li:text-gray-700
                  prose-ol:my-6
                  prose-img:rounded-xl prose-img:shadow-xl prose-img:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Etiketler</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/blog/etiket/${tag.slug}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-green-100 hover:text-green-700 transition-all"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Box */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <BlogAuthorBox 
                  authorName={post.authorName}
                  publishedAt={post.publishedAt}
                  readTime={post.readTime}
                />
              </div>

              {/* Reactions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <BlogReactions postId={post.id} userId={session?.user?.id} />
              </div>

              {/* Comments */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <BlogComments 
                  postId={post.id} 
                  userId={session?.user?.id}
                  userName={session?.user?.name}
                />
              </div>
            </article>

            {/* Sidebar - 4 columns */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Recent Posts */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Son Yazılar
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((recent) => (
                    <Link
                      key={recent.id}
                      href={`/blog/${recent.slug}`}
                      className="group block"
                    >
                      <div className="flex gap-4">
                        {recent.featuredImage && (
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <img
                              src={recent.featuredImage}
                              alt={recent.featuredImageAlt || recent.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition line-clamp-2 text-sm mb-1">
                            {recent.title}
                          </h4>
                          {recent.publishedAt && (
                            <time className="text-xs text-gray-500">
                              {format(new Date(recent.publishedAt), 'd MMM yyyy', { locale: tr })}
                            </time>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    İlgili Yazılar
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        href={`/blog/${related.slug}`}
                        className="group block"
                      >
                        {related.featuredImage && (
                          <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                            <img
                              src={related.featuredImage}
                              alt={related.featuredImageAlt || related.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                            {related.category && (
                              <span
                                className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
                                style={{ backgroundColor: related.category.color }}
                              >
                                {related.category.name}
                              </span>
                            )}
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition line-clamp-2 mb-2">
                          {related.title}
                        </h4>
                        {related.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
