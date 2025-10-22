import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        title: true,
        slug: true,
        motivation: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    const baseUrl = process.env.NEXTAUTH_URL || "https://zayiflamaplanim.com"
    const currentDate = new Date().toUTCString()

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zayıflama Planım - RSS Feed</title>
    <link>${baseUrl}</link>
    <description>En yeni zayıflama planları ve sağlıklı yaşam içerikleri</description>
    <language>tr</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
`

    plans.forEach(plan => {
      const description = plan.motivation || ""
      const cleanDescription = description.replace(/<[^>]*>/g, "").substring(0, 200)
      
      rss += `    <item>
      <title>${escapeXml(plan.title)}</title>
      <link>${baseUrl}/plan/${plan.slug}</link>
      <description>${escapeXml(cleanDescription)}</description>
      <author>${escapeXml(plan.user?.name || "Zayıflama Planım")}</author>
      <pubDate>${new Date(plan.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/plan/${plan.slug}</guid>
    </item>
`
    })

    rss += `  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    })
  } catch (error) {
    console.error("RSS feed oluşturulurken hata:", error)
    return new NextResponse("RSS feed oluşturulamadı", { status: 500 })
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
