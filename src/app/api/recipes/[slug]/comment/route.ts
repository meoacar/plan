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

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Yorum boş olamaz" },
        { status: 400 }
      );
    }

    const comment = await prisma.recipeComment.create({
      data: {
        recipeId: recipe.id,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Gamification: Yorum yapana ve tarif sahibine XP ver
    await addXP(session.user.id, XP_REWARDS.RECIPE_COMMENT_GIVEN, "Tarif yorumu yaptı");
    
    if (recipe.userId !== session.user.id) {
      await addXP(recipe.userId, XP_REWARDS.RECIPE_COMMENT_RECEIVED, "Tarif yorumu aldı");
      await checkRecipeBadges(recipe.userId);
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    return NextResponse.json(
      { error: "Yorum eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
