import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PlanDetail } from "@/components/plan-detail"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPlan(slug: string, isAdmin: boolean = false) {
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
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    }
  })

  return plan
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

  return {
    title: `${plan.title} - Zayıflama Planım`,
    description,
    openGraph: {
      title: plan.title,
      description,
      url,
      siteName: 'Zayıflama Planım',
      type: 'article',
      images: [
        {
          url: `/plan/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: plan.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: plan.title,
      description,
      images: [`/plan/${slug}/opengraph-image`],
    },
  }
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function PlanPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const plan = await getPlan(slug, isAdmin)

  if (!plan) {
    notFound()
  }

  const similarPlans = await getSimilarPlans(plan.goalWeight, plan.id)

  return <PlanDetail plan={plan} similarPlans={similarPlans} />
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
