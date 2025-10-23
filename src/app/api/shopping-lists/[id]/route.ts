import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Alışveriş listesini sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const list = await prisma.shoppingList.findUnique({
      where: { id: params.id }
    })

    if (!list) {
      return NextResponse.json({ error: "Liste bulunamadı" }, { status: 404 })
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.shoppingList.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Shopping list delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
