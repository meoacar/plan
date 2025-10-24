import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const body = await request.json()
    const { settingsId, title, url, openInNewTab, order } = body

    const link = await prisma.footerLink.create({
      data: {
        settingsId,
        title,
        url,
        openInNewTab: openInNewTab || false,
        order: order || 0,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error("Error creating footer link:", error)
    return NextResponse.json(
      { error: "Link oluşturulamadı" },
      { status: 500 }
    )
  }
}
