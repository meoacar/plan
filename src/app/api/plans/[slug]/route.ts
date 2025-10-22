import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { planSchema } from "@/lib/validations"
import { generateSlug } from "@/lib/slugify"
import { checkContent } from "@/lib/moderation"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { slug } = await params
    // Planı kontrol et
    const existingPlan = await prisma.plan.findUnique({
      where: { slug },
      select: { userId: true, slug: true, id: true }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plan bulunamadı" },
        { status: 404 }
      )
    }

    // Sadece plan sahibi düzenleyebilir
    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu planı düzenleme yetkiniz yok" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { categoryId, tagIds, ...planData } = body
    const validatedData = planSchema.parse(planData)

    // İçerik moderasyonu kontrolü
    const contentToCheck = `${validatedData.title} ${validatedData.routine} ${validatedData.diet} ${validatedData.exercise} ${validatedData.motivation}`
    await checkContent(contentToCheck)

    // Slug güncelleme (başlık değiştiyse)
    const newSlug = generateSlug(validatedData.title)

    // Planı güncelle ve tekrar PENDING yap
    const plan = await prisma.plan.update({
      where: { id: existingPlan.id },
      data: {
        ...validatedData,
        slug: newSlug,
        imageUrl: validatedData.imageUrl || null,
        status: "PENDING", // Tekrar onaya gönder
        rejectionReason: null, // Ret sebebini temizle
        categoryId: categoryId || null,
      }
    })

    // Etiketleri güncelle
    // Önce mevcut etiketleri sil
    await prisma.planTag.deleteMany({
      where: { planId: plan.id }
    })

    // Yeni etiketleri ekle
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.planTag.createMany({
        data: tagIds.map((tagId: string) => ({
          planId: plan.id,
          tagId,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ 
      plan,
      message: "Planınız güncellendi ve tekrar onaya gönderildi"
    })
  } catch (error) {
    console.error("Plan update error:", error)
    return NextResponse.json(
      { error: "Plan güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
