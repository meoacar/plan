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
    const { links } = body

    // Update all links in a transaction
    await prisma.$transaction(
      links.map((link: { id: string; order: number }) =>
        prisma.footerLink.update({
          where: { id: link.id },
          data: { order: link.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering footer links:", error)
    return NextResponse.json(
      { error: "Sıralama güncellenemedi" },
      { status: 500 }
    )
  }
}
