import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Tarif bulunamadı" }, { status: 404 });
    }

    // Beğeni var mı kontrol et
    const existingLike = await prisma.recipeLike.findUnique({
      where: {
        recipeId_userId: {
          recipeId: recipe.id,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Beğeniyi kaldır
      await prisma.recipeLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Beğeni ekle
      await prisma.recipeLike.create({
        data: {
          recipeId: recipe.id,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Beğeni hatası:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
