import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addXP, checkRecipeBadges, XP_REWARDS } from "@/lib/gamification";

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

      // Gamification: Tarif sahibine XP ver
      if (recipe.userId !== session.user.id) {
        await addXP(recipe.userId, XP_REWARDS.RECIPE_LIKE_RECEIVED, "Tarif beğenisi aldı");
        await checkRecipeBadges(recipe.userId);
      }

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
