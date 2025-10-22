import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Favoriden çıkar
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Favorinin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const favorite = await prisma.favorite.findUnique({
      where: { id },
    })

    if (!favorite) {
      return NextResponse.json(
        { error: "Favori bulunamadı" },
        { status: 404 }
      )
    }

    if (favorite.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu favoriyi silme yetkiniz yok" },
        { status: 403 }
      )
    }

    // Favoriden çıkar
    await prisma.favorite.delete({
      where: { id },
    })

    return NextResponse.json({ 
      message: "Plan favorilerden çıkarıldı" 
    })
  } catch (error) {
    console.error("Favorite delete error:", error)
    return NextResponse.json(
      { error: "Favorilerden çıkarılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Favori notunu güncelle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { note } = await req.json()

    // Favorinin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const favorite = await prisma.favorite.findUnique({
      where: { id },
    })

    if (!favorite) {
      return NextResponse.json(
        { error: "Favori bulunamadı" },
        { status: 404 }
      )
    }

    if (favorite.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu favoriyi güncelleme yetkiniz yok" },
        { status: 403 }
      )
    }

    // Notu güncelle
    const updatedFavorite = await prisma.favorite.update({
      where: { id },
      data: { note: note || null },
    })

    return NextResponse.json({ 
      favorite: updatedFavorite,
      message: "Favori notu güncellendi" 
    })
  } catch (error) {
    console.error("Favorite update error:", error)
    return NextResponse.json(
      { error: "Favori güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
