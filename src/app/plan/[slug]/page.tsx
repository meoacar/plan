import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PlanDetail } from "@/components/plan-detail"
import { generatePlanStructuredData, generateBreadcrumbStructuredData, getStructuredDataScript } from "@/lib/structured-data"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPlan(slug: string, isAdmin: boolean = false, userId?: string) {
  const plan = await prisma.plan.findUnique({
    where: { 
      slug,
      // Admin ise tüm planları görebilir, değilse sadece APPROVED olanları
      ...(isAdmin ? {} : { status: "APPROVED" })
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      likes: userId ? {
        where: {
          userId: userId
        },
        select: {
          id: true
        }
      } : false,
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    }
  })

  if (!plan) return null

  // Add isLiked property
  const planWithLikeStatus = {
    ...plan,
    isLiked: userId && plan.likes ? (plan.likes as any[]).length > 0 : false
  }

  return planWithLikeStatus
}

async function getSimilarPlans(goalWeight: number, currentPlanId: string) {
  const plans = await prisma.plan.findMany({
    where: {
      status: "APPROVED",
      id: { not: currentPlanId },
      goalWeight: {
        gte: goalWeight - 10,
        lte: goalWeight + 10,
      },
    },
    take: 3,
    orderBy: {
      views: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  return plans
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const plan = await getPlan(slug, isAdmin)
  
  if (!plan) {
    return {
      title: "Plan Bulunamadı"
    }
  }

  const description = `${plan.startWeight}kg → ${plan.goalWeight}kg | ${plan.durationText} | ${plan.routine.substring(0, 120)}...`
  const url = `https://zayiflamaplanim.com/plan/${slug}`
  const weightLoss = plan.startWeight - plan.goalWeight

  return {
    title: `${plan.title} - Zayıflama Planım`,
    description,
    keywords: [
      'zayıflama',
      'diyet',
      'kilo verme',
      plan.durationText,
      `${weightLoss}kg`,
      'sağlıklı beslenme',
      'egzersiz programı',
      plan.category?.name || 'diyet planı'
    ],
    authors: [{ name: plan.user.name || 'Anonim' }],
    creator: plan.user.name || 'Anonim',
    publisher: 'Zayıflama Planım',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: plan.title,
      description,
      url,
      siteName: 'Zayıflama Planım',
      type: 'article',
      publishedTime: plan.createdAt.toISOString(),
      modifiedTime: plan.updatedAt.toISOString(),
      authors: [plan.user.name || 'Anonim'],
      locale: 'tr_TR',
      images: [
        {
          url: `/plan/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: plan.title,
          type: 'image/png',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: plan.title,
      description,
      images: [`/plan/${slug}/opengraph-image`],
      creator: '@zayiflamaplanim',
      site: '@zayiflamaplanim',
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function PlanPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const plan = await getPlan(slug, isAdmin, session?.user?.id)

  if (!plan) {
    notFound()
  }

  const similarPlans = await getSimilarPlans(plan.goalWeight, plan.id)

  // Generate structured data for SEO
  const { article, rating } = generatePlanStructuredData({
    name: plan.title,
    description: `${plan.startWeight}kg → ${plan.goalWeight}kg | ${plan.durationText}`,
    image: plan.imageUrl || undefined,
    author: {
      name: plan.user.name || "Anonim",
      url: `/profile/${plan.user.id}`
    },
    datePublished: plan.createdAt.toISOString(),
    dateModified: plan.updatedAt.toISOString(),
    startWeight: plan.startWeight,
    goalWeight: plan.goalWeight,
    duration: plan.durationText,
    category: plan.category?.name,
    keywords: ["zayıflama", "diyet", "kilo verme", plan.durationText],
    aggregateRating: plan._count.likes > 0 ? {
      ratingValue: 4.5,
      reviewCount: plan._count.likes
    } : undefined
  })

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: "Ana Sayfa", url: "/" },
    { name: "Planlar", url: "/plans" },
    { name: plan.title, url: `/plan/${slug}` }
  ])

  return (
    <>
      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getStructuredDataScript(article) }}
      />
      {/* Rating structured data (ayrı) */}
      {rating && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getStructuredDataScript(rating) }}
        />
      )}
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getStructuredDataScript(breadcrumbStructuredData) }}
      />
      <PlanDetail plan={plan} similarPlans={similarPlans} />
    </>
  )
}

// Generate static params for popular plans
export async function generateStaticParams() {
  const plans = await prisma.plan.findMany({
    where: { status: "APPROVED" },
    select: { slug: true },
    take: 50, // Pre-generate top 50 plans
    orderBy: { views: "desc" },
  })

  return plans.map((plan) => ({
    slug: plan.slug,
  }))
}
