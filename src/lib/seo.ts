import { Metadata } from "next"

interface SeoConfig {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

export function generateMetadata(config: SeoConfig): Metadata {
  const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
  const siteName = "Zayıflama Planım"
  
  const title = config.title 
    ? `${config.title} | ${siteName}` 
    : siteName
  
  const description = config.description || 
    "Gerçek kullanıcıların başarılı zayıflama hikayeleri ve diyetleri. Sağlıklı kilo verme planları, motivasyon ve destek."
  
  const image = config.image || `${baseUrl}/og-image.jpg`
  const url = config.url || baseUrl

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: "tr_TR",
      type: config.type || "website",
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
      ...(config.author && { authors: [config.author] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      site: "@zayiflamaplanim",
      creator: config.author ? `@${config.author}` : "@zayiflamaplanim"
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": `${baseUrl}/rss.xml`
      }
    },
    ...(config.tags && { keywords: config.tags })
  }
}

export function generatePlanMetadata(plan: {
  title: string
  description?: string
  slug: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  author?: { name?: string | null }
  category?: { name: string }
  tags?: Array<{ tag: { name: string } }>
}): Metadata {
  const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
  
  return generateMetadata({
    title: plan.title,
    description: plan.description || `${plan.title} - Başarılı zayıflama hikayesi ve diyeti`,
    image: plan.imageUrl || `${baseUrl}/og-image.jpg`,
    url: `${baseUrl}/plan/${plan.slug}`,
    type: "article",
    publishedTime: plan.createdAt.toISOString(),
    modifiedTime: plan.updatedAt.toISOString(),
    author: plan.author?.name || undefined,
    tags: [
      ...(plan.category ? [plan.category.name] : []),
      ...(plan.tags?.map(t => t.tag.name) || []),
      "zayıflama",
      "diyet",
      "kilo verme"
    ]
  })
}

export function generateJsonLd(data: {
  type: "WebSite" | "Article" | "Person" | "Organization"
  name?: string
  title?: string
  description?: string
  url?: string
  image?: string
  author?: string
  datePublished?: string
  dateModified?: string
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
  
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": data.type
  }

  if (data.type === "WebSite") {
    return {
      ...baseSchema,
      name: data.name || "Zayıflama Planım",
      url: data.url || baseUrl,
      description: data.description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/plans?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  }

  if (data.type === "Article") {
    return {
      ...baseSchema,
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.datePublished,
      dateModified: data.dateModified,
      author: {
        "@type": "Person",
        name: data.author
      },
      publisher: {
        "@type": "Organization",
        name: "Zayıflama Planım",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`
        }
      }
    }
  }

  return baseSchema
}
