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

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Hero Section with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2d7a4a] via-[#4caf50] to-[#66bb6a] py-20 md:py-32">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-8" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-white/80">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2 text-white/60">/</span>
                  </li>
                  <li className="text-white font-medium">{page.title}</li>
                </ol>
              </nav>

              {/* Page Header */}
              <header className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                  {page.title}
                </h1>

                {page.excerpt && (
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8 drop-shadow">
                    {page.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-center gap-6 text-sm text-white/80">
                  {page.publishedAt && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time dateTime={page.publishedAt.toISOString()}>
                        {new Date(page.publishedAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  )}
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{page.views} görüntülenme</span>
                  </div>
                </div>
              </header>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-16 md:h-24 fill-current text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
          <div className="max-w-5xl mx-auto">
            {/* Page Content Card */}
            <article className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Decorative Top Border */}
              <div className="h-2 bg-gradient-to-r from-[#2d7a4a] via-[#4caf50] to-[#66bb6a]"></div>

              <div className="p-8 md:p-16">
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-[#4caf50]/20
                    prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-[#2d7a4a]
                    prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-[#4caf50]
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                    prose-a:text-[#4caf50] prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                    prose-strong:text-gray-900 prose-strong:font-bold prose-strong:bg-[#4caf50]/5 prose-strong:px-1 prose-strong:rounded
                    prose-em:text-gray-600 prose-em:italic
                    prose-ul:list-none prose-ul:pl-0 prose-ul:mb-6
                    prose-ol:list-none prose-ol:pl-0 prose-ol:mb-6 prose-ol:counter-reset-item
                    prose-li:text-gray-700 prose-li:mb-3 prose-li:pl-8 prose-li:relative
                    prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-1
                    prose-li:before:w-6 prose-li:before:h-6 prose-li:before:rounded-full
                    prose-li:before:bg-gradient-to-br prose-li:before:from-[#4caf50] prose-li:before:to-[#2d7a4a]
                    prose-li:before:flex prose-li:before:items-center prose-li:before:justify-center
                    prose-li:before:text-white prose-li:before:text-xs prose-li:before:font-bold
                    prose-li:before:content-['✓'] prose-li:before:shadow-md
                    prose-blockquote:border-l-4 prose-blockquote:border-[#4caf50] 
                    prose-blockquote:bg-gradient-to-r prose-blockquote:from-[#4caf50]/5 prose-blockquote:to-transparent
                    prose-blockquote:pl-6 prose-blockquote:pr-6 prose-blockquote:py-4 prose-blockquote:italic 
                    prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg prose-blockquote:my-8
                    prose-code:bg-gradient-to-r prose-code:from-gray-100 prose-code:to-gray-50 
                    prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm 
                    prose-code:text-[#2d7a4a] prose-code:font-mono prose-code:border prose-code:border-gray-200
                    prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 
                    prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:shadow-xl
                    prose-pre:border prose-pre:border-gray-700
                    prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border-4 prose-img:border-white
                    prose-img:my-8 prose-img:w-full prose-img:object-cover
                    prose-hr:border-gray-200 prose-hr:my-12
                    prose-table:border-collapse prose-table:w-full prose-table:my-8
                    prose-th:bg-gradient-to-r prose-th:from-[#2d7a4a] prose-th:to-[#4caf50] 
                    prose-th:text-white prose-th:font-bold prose-th:p-4 prose-th:text-left
                    prose-td:border prose-td:border-gray-200 prose-td:p-4
                    prose-tr:even:bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>

              {/* Decorative Bottom Section */}
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 px-8 md:px-16 py-12 border-t border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4caf50] to-[#2d7a4a] flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Sağlıklı yaşam için</p>
                      <p className="text-lg font-bold text-gray-900">Zayıflama Planım</p>
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4caf50] to-[#2d7a4a] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </div>
            </article>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Güvenilir İçerik</h3>
                <p className="text-gray-600 text-sm">Uzman ekibimiz tarafından hazırlanan kaliteli içerikler</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Topluluk Desteği</h3>
                <p className="text-gray-600 text-sm">Binlerce kullanıcının deneyimlerinden faydalanın</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4caf50] to-[#2d7a4a] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hızlı Sonuçlar</h3>
                <p className="text-gray-600 text-sm">Etkili planlarla hedeflerinize ulaşın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
