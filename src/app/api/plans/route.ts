import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { planSchema } from "@/lib/validations"
import { generateSlug } from "@/lib/slugify"
import { checkRateLimit, getIdentifier, RATE_LIMITS } from "@/lib/rate-limit"
import { checkContent } from "@/lib/moderation"
import { addXP, checkBadges, XP_REWARDS } from "@/lib/gamification"

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 plans per hour
    const session = await auth()
    const identifier = getIdentifier(req, session?.user?.id)
    const rateCheck = checkRateLimit(`plan-create:${identifier}`, RATE_LIMITS.PLAN)
    
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      )
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { categoryId, tagIds, ...planData } = body
    const validatedData = planSchema.parse(planData)

    // İçerik moderasyonu kontrolü
    const contentToCheck = `${validatedData.title} ${validatedData.routine} ${validatedData.diet} ${validatedData.exercise} ${validatedData.motivation}`
    const moderationResult = await checkContent(contentToCheck)

    const slug = generateSlug(validatedData.title)

    // Tüm planlar önce PENDING durumunda oluşturulur ve admin onayı bekler
    const plan = await prisma.plan.create({
      data: {
        ...validatedData,
        slug,
        userId: session.user.id,
        imageUrl: validatedData.imageUrl || null,
        status: "PENDING",
        categoryId: categoryId || null,
      }
    })

    // Etiketleri ekle
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.planTag.createMany({
        data: tagIds.map((tagId: string) => ({
          planId: plan.id,
          tagId,
        })),
        skipDuplicates: true,
      })
    }

    // Gamification: Plan oluşturma XP'si
    await addXP(session.user.id, XP_REWARDS.PLAN_CREATED, "Plan oluşturuldu");
    
    // Rozetleri kontrol et
    const newBadges = await checkBadges(session.user.id);

    // Quest Integration: Plan oluşturma görevi güncelle
    try {
      const { onPlanCreated } = await import('@/lib/quest-integration');
      await onPlanCreated(session.user.id);
    } catch (questError) {
      console.error('Quest integration error:', questError);
      // Quest hatası plan oluşturmayı etkilemez
    }

    // Kullanıcıya bilgi ver
    return NextResponse.json({ 
      plan,
      message: "Planınız başarıyla oluşturuldu. Admin onayından sonra yayınlanacaktır.",
      requiresApproval: true,
      moderationWarning: !moderationResult.isClean ? (moderationResult.isSpam ? "spam" : "banned-words") : null,
      xpEarned: XP_REWARDS.PLAN_CREATED,
      newBadges: newBadges.map(b => b.badge.name),
    })
  } catch (error) {
    console.error("Plan creation error:", error)
    return NextResponse.json(
      { error: "Plan oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "APPROVED"
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "recent"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const minWeight = searchParams.get("minWeight")
    const maxWeight = searchParams.get("maxWeight")
    const duration = searchParams.get("duration")
    const categoryId = searchParams.get("categoryId")

    const where: any = {
      status,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { User: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    if (minWeight || maxWeight) {
      where.goalWeight = {}
      if (minWeight) where.goalWeight.gte = parseInt(minWeight)
      if (maxWeight) where.goalWeight.lte = parseInt(maxWeight)
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const orderBy: any = sort === "popular" 
      ? [{ views: "desc" }, { likes: { _count: "desc" } }]
      : { createdAt: "desc" }

    // Süre filtresi varsa, daha fazla plan çek ve sonra filtrele
    const fetchLimit = duration ? limit * 3 : limit
    const fetchSkip = duration ? 0 : (page - 1) * limit

    let [allPlans, totalBeforeFilter] = await Promise.all([
      prisma.plan.findMany({
        where,
        orderBy,
        skip: fetchSkip,
        take: fetchLimit,
        select: {
          id: true,
          title: true,
          slug: true,
          startWeight: true,
          goalWeight: true,
          durationText: true,
          imageUrl: true,
          views: true,
          createdAt: true,
          User: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        }
      }),
      prisma.plan.count({ where })
    ])

    // Süre filtreleme fonksiyonu
    const parseDurationToDays = (durationText: string): number => {
      const text = durationText.toLowerCase()
      const numberMatch = text.match(/(\d+)/)
      if (!numberMatch) return 0
      
      const num = parseInt(numberMatch[1])
      
      if (text.includes('yıl') || text.includes('year')) {
        return num * 365
      } else if (text.includes('ay') || text.includes('month')) {
        return num * 30
      } else if (text.includes('hafta') || text.includes('week')) {
        return num * 7
      } else if (text.includes('gün') || text.includes('day')) {
        return num
      }
      
      return num // Varsayılan olarak gün kabul et
    }

    // Süre filtreleme uygula
    let plans = allPlans
    let total = totalBeforeFilter

    if (duration) {
      const targetDays = parseInt(duration)
      
      // Süre aralıklarını belirle
      let minDays = 0
      let maxDays = Infinity
      
      if (targetDays === 30) {
        minDays = 1
        maxDays = 60 // 1-2 ay arası
      } else if (targetDays === 90) {
        minDays = 61
        maxDays = 150 // 2-5 ay arası
      } else if (targetDays === 180) {
        minDays = 151
        maxDays = 270 // 5-9 ay arası
      } else if (targetDays === 365) {
        minDays = 271 // 9 ay ve üzeri
        maxDays = Infinity
      }
      
      plans = allPlans.filter(plan => {
        const planDays = parseDurationToDays(plan.durationText)
        return planDays >= minDays && planDays <= maxDays
      })
      
      total = plans.length
      
      // Sayfalama uygula
      const startIndex = (page - 1) * limit
      plans = plans.slice(startIndex, startIndex + limit)
    }

    return NextResponse.json(
      {
        plans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("Plans GET error:", error);
    // Hata durumunda boş liste dön, UI'ı bozma
    return NextResponse.json(
      {
        plans: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      }
    )
  }
}
