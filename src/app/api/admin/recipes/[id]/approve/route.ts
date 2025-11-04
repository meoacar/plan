import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { addXP, checkRecipeBadges, XP_REWARDS } from "@/lib/gamification";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: params.id },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Tarif bulunamadı" }, { status: 404 });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    // Gamification: Tarif onaylanma XP'si ve rozet kontrolü
    await addXP(recipe.userId, XP_REWARDS.RECIPE_APPROVED, "Tarif onaylandı");
    await checkRecipeBadges(recipe.userId);

    // Quest Integration: Tarif onaylama görevi güncelle
    try {
      const { onRecipeApproved } = await import('@/lib/quest-integration');
      await onRecipeApproved(recipe.userId);
    } catch (questError) {
      console.error('Quest integration error:', questError);
      // Quest hatası tarif onaylamayı etkilemez
    }

    // Aktivite logu
    await logActivity({
      userId: session.user.id,
      type: "RECIPE_APPROVED",
      targetId: recipe.id,
      targetType: "Recipe",
      description: `"${recipe.title}" tarifi onaylandı`,
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Tarif onaylama hatası:", error);
    return NextResponse.json(
      { error: "Tarif onaylanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
