import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      isPrivate,
      showEmail,
      showWeight,
      allowMessages,
      requireFollowApproval,
    } = body

    // Gizlilik ayarlarını güncelle
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPrivate: isPrivate ?? false,
        showEmail: showEmail ?? false,
        showWeight: showWeight ?? true,
        allowMessages: allowMessages ?? true,
        requireFollowApproval: requireFollowApproval ?? false,
      },
      select: {
        id: true,
        isPrivate: true,
        showEmail: true,
        showWeight: true,
        allowMessages: true,
        requireFollowApproval: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Gizlilik ayarları güncellenirken hata:", error)
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isPrivate: true,
        showEmail: true,
        showWeight: true,
        allowMessages: true,
        requireFollowApproval: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Gizlilik ayarları alınırken hata:", error)
    return NextResponse.json(
      { error: "Ayarlar alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
