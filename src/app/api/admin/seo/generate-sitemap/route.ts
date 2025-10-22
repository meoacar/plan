import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    // Tüm planları al
    const plans = await prisma.plan.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        slug: true,
        updatedAt: true
      }
    })

    // Sitemap XML oluştur
    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
    const currentDate = new Date().toISOString()

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/plans</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`

    // Her plan için URL ekle
    plans.forEach(plan => {
      sitemap += `  <url>
    <loc>${baseUrl}/plan/${plan.slug}</loc>
    <lastmod>${plan.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    })

    sitemap += `</urlset>`

    // Sitemap dosyasını public klasörüne kaydet
    const publicPath = join(process.cwd(), "public", "sitemap.xml")
    await writeFile(publicPath, sitemap, "utf-8")

    return NextResponse.json({ 
      success: true, 
      message: "Sitemap başarıyla oluşturuldu",
      planCount: plans.length 
    })
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Sitemap oluşturulamadı" },
      { status: 500 }
    )
  }
}
