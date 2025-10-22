import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        slug: true,
        updatedAt: true
      }
    })

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

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    })
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error)
    return new NextResponse("Sitemap oluşturulamadı", { status: 500 })
  }
}
