import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  params: {
    slug: string
  }
}

async function getPage(slug: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
  })

  if (!page || !page.isPublished) {
    return null
  }

  // Görüntülenme sayısını artır
  await prisma.page.update({
    where: { id: page.id },
    data: { views: { increment: 1 } },
  })

  return page
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  })

  if (!page || !page.isPublished) {
    return {
      title: "Sayfa Bulunamadı",
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const pageUrl = `${baseUrl}/pages/${page.slug}`

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt || undefined,
    keywords: page.metaKeywords || undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.excerpt || undefined,
      type: "article",
      url: pageUrl,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
      publishedTime: page.publishedAt?.toISOString(),
      modifiedTime: page.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.excerpt || undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })

  return pages.map((page) => ({
    slug: page.slug,
  }))
}

// Revalidate every hour
export const revalidate = 3600

export default async function PageDetail({ params }: PageProps) {
  const page = await getPage(params.slug)

  if (!page) {
    notFound()
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.excerpt || page.metaDescription,
    "url": `${process.env.NEXTAUTH_URL}/pages/${page.slug}`,
    "datePublished": page.publishedAt?.toISOString(),
    "dateModified": page.updatedAt.toISOString(),
    "inLanguage": "tr-TR",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link href="/" className="hover:text-[#4caf50] transition-colors">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-900 font-medium">{page.title}</li>
              </ol>
            </nav>

            {/* Page Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {page.title}
              </h1>
              
              {page.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {page.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
                {page.publishedAt && (
                  <time dateTime={page.publishedAt.toISOString()}>
                    {new Date(page.publishedAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
                <span>•</span>
                <span>{page.views} görüntülenme</span>
              </div>
            </header>

            {/* Page Content */}
            <article className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-h1:text-3xl prose-h1:mb-6
                  prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                  prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-[#4caf50] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                  prose-li:text-gray-700 prose-li:mb-2
                  prose-blockquote:border-l-4 prose-blockquote:border-[#4caf50] 
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                  prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-code:text-sm prose-code:text-gray-800
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </article>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#4caf50] hover:text-[#45a049] font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
