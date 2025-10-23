import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH - Alışveriş listesi öğesini güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { isChecked } = body

    const item = await prisma.shoppingListItem.findUnique({
      where: { id: params.id },
      include: { shoppingList: true }
    })

    if (!item) {
      return NextResponse.json({ error: "Öğe bulunamadı" }, { status: 404 })
    }

    if (item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: params.id },
      data: { isChecked }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error("Shopping list item update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
