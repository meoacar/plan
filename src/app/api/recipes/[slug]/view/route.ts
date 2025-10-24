import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    });

    if (!recipe || recipe.status !== "APPROVED") {
      return NextResponse.json({ error: "Tarif bulunamadı" }, { status: 404 });
    }

    // Cookie kontrolü - bu tarifi daha önce görüntüledi mi?
    const cookieStore = await cookies();
    const viewedRecipes = cookieStore.get(`viewed_recipe_${recipe.id}`);

    if (!viewedRecipes) {
      // İlk kez görüntülüyor, sayıyı artır
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { views: { increment: 1 } },
      });

      // Cookie set et (30 gün)
      const response = NextResponse.json({ success: true, counted: true });
      response.cookies.set(`viewed_recipe_${recipe.id}`, "1", {
        maxAge: 60 * 60 * 24 * 30, // 30 gün
        httpOnly: true,
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json({ success: true, counted: false });
  } catch (error) {
    console.error("Görüntülenme sayma hatası:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
