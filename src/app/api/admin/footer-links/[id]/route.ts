import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const body = await request.json()
    const { title, url, openInNewTab, order } = body

    const link = await prisma.footerLink.update({
      where: { id: params.id },
      data: {
        title,
        url,
        openInNewTab,
        order,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error("Error updating footer link:", error)
    return NextResponse.json(
      { error: "Link güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    await prisma.footerLink.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting footer link:", error)
    return NextResponse.json({ error: "Link silinemedi" }, { status: 500 })
  }
}
