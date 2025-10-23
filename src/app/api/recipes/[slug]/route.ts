import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tek tarif detayı
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Tarif bulunamadı" }, { status: 404 });
    }

    // Görüntülenme sayısını artır
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Tarif detay hatası:", error);
    return NextResponse.json(
      { error: "Tarif yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Tarif güncelle (sadece kendi tarifini)
export async function PATCH(
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

    if (recipe.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu tarifi düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      calories,
      protein,
      carbs,
      fat,
      images,
    } = body;

    // Reddedilmiş tarif düzenlendiyse tekrar onaya gönder
    const updateData: any = {
      title,
      description,
      ingredients: JSON.stringify(ingredients),
      instructions,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      servings: servings ? parseInt(servings) : null,
      difficulty,
      category,
      calories: calories ? parseFloat(calories) : null,
      protein: protein ? parseFloat(protein) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fat: fat ? parseFloat(fat) : null,
    };

    if (recipe.status === "REJECTED") {
      updateData.status = "PENDING";
      updateData.rejectionReason = null;
    }

    // Resimleri güncelle
    if (images && images.length > 0) {
      await prisma.recipeImage.deleteMany({
        where: { recipeId: recipe.id },
      });

      updateData.images = {
        create: images.map((url: string, index: number) => ({
          url,
          order: index,
        })),
      };
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: updateData,
      include: {
        images: true,
      },
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Tarif güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Tarif güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Tarif sil (sadece kendi tarifini)
export async function DELETE(
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

    if (recipe.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu tarifi silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.recipe.delete({
      where: { id: recipe.id },
    });

    return NextResponse.json({ message: "Tarif silindi" });
  } catch (error) {
    console.error("Tarif silme hatası:", error);
    return NextResponse.json(
      { error: "Tarif silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
