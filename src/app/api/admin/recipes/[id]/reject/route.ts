import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";

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

    const { reason } = await req.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Red nedeni belirtmelisiniz" },
        { status: 400 }
      );
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });

    // Aktivite logu
    await logActivity({
      userId: session.user.id,
      type: "RECIPE_REJECTED",
      targetId: recipe.id,
      targetType: "Recipe",
      description: `"${recipe.title}" tarifi reddedildi: ${reason}`,
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Tarif reddetme hatası:", error);
    return NextResponse.json(
      { error: "Tarif reddedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
