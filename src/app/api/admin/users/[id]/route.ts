import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-logger"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { role, name, email, goalWeight, startWeight, city } = body

    // Validate role if provided
    if (role && !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      )
    }

    // Prevent admin from demoting themselves
    if (id === session.user.id && role === "USER") {
      return NextResponse.json(
        { error: "Kendi rolünüzü değiştiremezsiniz" },
        { status: 400 }
      )
    }

    // Build update data object
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (goalWeight !== undefined) updateData.goalWeight = goalWeight
    if (startWeight !== undefined) updateData.startWeight = startWeight
    if (city !== undefined) updateData.city = city

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Activity log
    const changedFields = Object.keys(updateData).join(", ")
    await logActivity({
      userId: session.user.id,
      type: role ? "USER_ROLE_CHANGED" : "USER_UPDATED",
      description: `${user.name || user.email} kullanıcısı güncellendi (${changedFields})`,
      targetId: user.id,
      targetType: "User",
      metadata: {
        userName: user.name,
        userEmail: user.email,
        changedFields: updateData,
      },
      request: req,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json(
      { error: "Kullanıcı güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      )
    }

    // Kullanıcı bilgilerini al (silmeden önce)
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id },
    })

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "USER_DELETED",
      description: `${user.name || user.email} kullanıcısı silindi`,
      targetId: user.id,
      targetType: "User",
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
      },
      request: req,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User delete error:", error)
    return NextResponse.json(
      { error: "Kullanıcı silinemedi" },
      { status: 500 }
    )
  }
}
