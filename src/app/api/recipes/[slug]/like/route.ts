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
      select: { id: true, userId: true, title: true, slug: true },
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

        // Bildirim gönder
        try {
          const { createNotification } = await import('@/lib/notifications');
          await createNotification({
            userId: recipe.userId,
            type: 'RECIPE_LIKE',
            title: 'Tarifiniz Beğenildi',
            message: `${session.user.name} "${recipe.title}" tarifinizi beğendi`,
            actionUrl: `/tarifler/${recipe.slug}`,
            actorId: session.user.id,
            relatedId: recipe.id,
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
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
