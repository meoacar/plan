import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkProfileCompletion } from "@/lib/gamification"

// GET - Kullanıcı profilini getir
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        city: true,
        startWeight: true,
        goalWeight: true,
        instagram: true,
        twitter: true,
        youtube: true,
        tiktok: true,
        website: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      city: user.city,
      startWeight: user.startWeight,
      goalWeight: user.goalWeight,
      instagram: user.instagram,
      twitter: user.twitter,
      youtube: user.youtube,
      tiktok: user.tiktok,
      website: user.website,
      hasPassword: !!user.passwordHash,
    })
  } catch (error) {
    console.error("Profil getirme hatası:", error)
    return NextResponse.json({ error: "Profil getirilemedi" }, { status: 500 })
  }
}

// PUT - Kullanıcı profilini güncelle
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, image, city, startWeight, goalWeight, instagram, twitter, youtube, tiktok, website } = body

    // Validasyon
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "İsim boş olamaz" }, { status: 400 })
    }

    if (startWeight && (startWeight < 30 || startWeight > 300)) {
      return NextResponse.json({ error: "Başlangıç kilosu 30-300 kg arasında olmalıdır" }, { status: 400 })
    }

    if (goalWeight && (goalWeight < 30 || goalWeight > 300)) {
      return NextResponse.json({ error: "Hedef kilo 30-300 kg arasında olmalıdır" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        image: image || null,
        bio: bio?.trim() || null,
        city: city?.trim() || null,
        startWeight: startWeight || null,
        goalWeight: goalWeight || null,
        instagram: instagram?.trim() || null,
        twitter: twitter?.trim() || null,
        youtube: youtube?.trim() || null,
        tiktok: tiktok?.trim() || null,
        website: website?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        city: true,
        startWeight: true,
        goalWeight: true,
        instagram: true,
        twitter: true,
        youtube: true,
        tiktok: true,
        website: true,
      },
    })

    // Profil tamamlama kontrolü yap
    const profileCheck = await checkProfileCompletion(user.id)
    
    return NextResponse.json({
      ...user,
      profileCompletion: profileCheck,
    })
  } catch (error) {
    console.error("Profil güncelleme hatası:", error)
    return NextResponse.json({ error: "Profil güncellenemedi" }, { status: 500 })
  }
}

// DELETE - Kullanıcı hesabını sil
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // Kullanıcıyı ve ilişkili tüm verileri sil (Cascade ile otomatik silinecek)
    await prisma.user.delete({
      where: { email: session.user.email },
    })

    return NextResponse.json({ message: "Hesap başarıyla silindi" })
  } catch (error) {
    console.error("Hesap silme hatası:", error)
    return NextResponse.json({ error: "Hesap silinemedi" }, { status: 500 })
  }
}
