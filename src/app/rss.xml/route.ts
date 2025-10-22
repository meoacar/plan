import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const plans = await prisma.plan.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zayıflama Planım - Gerçek Planlar</title>
    <link>${baseUrl}</link>
    <description>İnsanların gerçek zayıflama rutinlerini keşfet</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${plans
      .map(
        (plan) => `
    <item>
      <title>${escapeXml(plan.title)}</title>
      <link>${baseUrl}/plan/${plan.slug}</link>
      <description>${escapeXml(plan.motivation)}</description>
      <author>${escapeXml(plan.user.name || "Anonim")}</author>
      <pubDate>${new Date(plan.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/plan/${plan.slug}</guid>
    </item>`
      )
      .join("")}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  })
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
