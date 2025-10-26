import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    // SEO ayarlarını veritabanından al veya varsayılan değerleri döndür
    const settings = await prisma.seoSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({
        sitemap: {
          enabled: true,
          frequency: "daily",
          priority: 0.8
        },
        robots: {
          enabled: true,
          allowAll: true,
          customRules: ""
        },
        rss: {
          enabled: true,
          title: "Zayıflama Planım - RSS Feed",
          description: "En yeni zayıflama planları ve sağlıklı yaşam içerikleri",
          itemCount: 20
        },
        openGraph: {
          enabled: true,
          siteName: "Zayıflama Planım",
          defaultImage: "/og-image.jpg",
          twitterCard: "summary_large_image",
          twitterSite: "@zayiflamaplanim"
        },
        google: {
          searchConsoleCode: "",
          analyticsId: ""
        }
      })
    }

    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error("SEO ayarları yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Ayarlar yüklenemedi" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const settings = await request.json()

    // SEO ayarlarını kaydet
    await prisma.seoSettings.upsert({
      where: { id: 1 },
      update: { settings },
      create: { id: 1, settings }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SEO ayarları kaydedilirken hata:", error)
    return NextResponse.json(
      { error: "Ayarlar kaydedilemedi" },
      { status: 500 }
    )
  }
}
