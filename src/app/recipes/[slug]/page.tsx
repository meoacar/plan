import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import RecipeDetail from "@/components/recipe-detail";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const recipe = await prisma.recipe.findUnique({
    where: { slug: params.slug },
  });

  if (!recipe) {
    return {
      title: "Tarif Bulunamadı",
    };
  }

  return {
    title: `${recipe.title} - Sağlıklı Tarif`,
    description: recipe.description,
  };
}

export default async function RecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();

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
    notFound();
  }

  // Tarif sahibi bilgilerini al
  const recipeOwner = await prisma.user.findUnique({
    where: { id: recipe.userId },
    select: {
      id: true,
      name: true,
      image: true,
      username: true,
      level: true,
      xp: true,
      _count: {
        select: {
          plans: { where: { status: "APPROVED" } },
        },
      },
    },
  });

  // Kullanıcının toplam onaylı tarif sayısı
  const ownerRecipeCount = await prisma.recipe.count({
    where: {
      userId: recipe.userId,
      status: "APPROVED",
    },
  });

  if (!recipe) {
    notFound();
  }

  // Admin değilse sadece onaylı tarifleri göster
  if (recipe.status !== "APPROVED") {
    // Admin kontrolü
    if (!session?.user || session.user.role !== "ADMIN") {
      // Kendi tarifi mi kontrol et
      if (!session?.user?.id || recipe.userId !== session.user.id) {
        notFound();
      }
    }
  }

  const isLiked = session?.user?.id
    ? recipe.likes.some((like: { userId: string }) => like.userId === session.user.id)
    : false;

  return (
    <RecipeDetail
      recipe={recipe}
      isLiked={isLiked}
      currentUserId={session?.user?.id}
      recipeOwner={recipeOwner}
      ownerRecipeCount={ownerRecipeCount}
    />
  );
}
