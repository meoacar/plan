type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  publishedAt: Date | null;
  updatedAt: Date;
  readTime: number | null;
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
  _count?: {
    comments: number;
  };
};

export function generateBlogPostSchema(post: BlogPost, baseUrl: string) {
  const url = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.featuredImage || `${baseUrl}/opengraph-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
      caption: post.featuredImageAlt || post.title,
    },
    author: {
      '@type': 'Person',
      name: post.authorName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zayıflama Planım',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/opengraph-image`,
        width: 600,
        height: 60,
      },
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    articleSection: post.category?.name,
    keywords: post.tags.map((t) => t.tag.name).join(', '),
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    timeRequired: post.readTime ? `PT${post.readTime}M` : undefined,
    commentCount: post._count?.comments || 0,
    inLanguage: 'tr-TR',
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateWebPageSchema(
  title: string,
  description: string,
  url: string,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${baseUrl}${url}`,
    inLanguage: 'tr-TR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Zayıflama Planım',
      url: baseUrl,
    },
  };
}

export function generateCollectionPageSchema(
  title: string,
  description: string,
  url: string,
  baseUrl: string,
  numberOfItems: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${baseUrl}${url}`,
    inLanguage: 'tr-TR',
    numberOfItems,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Zayıflama Planım',
      url: baseUrl,
    },
  };
}
