import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const CATEGORIES = [
  "Ana Yemek",
  "Çorba",
  "Salata",
  "Tatlı",
  "Atıştırmalık",
  "İçecek",
];

async function RecipeList({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = {
    status: "APPROVED",
  };

  if (searchParams.category) {
    where.category = searchParams.category;
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: {
        RecipeImage: {
          orderBy: { order: "asc" },
          take: 1,
        },
        _count: {
          select: {
            RecipeLike: true,
            RecipeComment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.recipe.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            {recipe.RecipeImage[0] && (
              <div className="aspect-video overflow-hidden bg-gray-100">
                <img
                  src={recipe.RecipeImage[0].url}
                  alt={recipe.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  {recipe.category}
                </span>
                {recipe.difficulty && (
                  <span className="text-xs">{recipe.difficulty}</span>
                )}
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-green-600">
                {recipe.title}
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {recipe.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {recipe.prepTime && (
                  <span>⏱️ {recipe.prepTime + (recipe.cookTime || 0)} dk</span>
                )}
                {recipe.servings && <span>👥 {recipe.servings} kişilik</span>}
                {recipe.calories && (
                  <span>🔥 {Math.round(recipe.calories)} kcal</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3 border-t pt-3 text-sm text-gray-500">
                <span>❤️ {recipe._count.RecipeLike}</span>
                <span>💬 {recipe._count.RecipeComment}</span>
                <span>👁️ {recipe.views}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg">Henüz tarif bulunmuyor</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/recipes?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
              className={`rounded px-4 py-2 ${
                p === page
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sağlıklı Yemek Tarifleri
          </h1>
          <p className="mt-2 text-gray-600">
            Topluluk tarafından paylaşılan lezzetli ve sağlıklı tarifler
          </p>
        </div>
        {session && (
          <Link
            href="/recipes/submit"
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            + Tarif Paylaş
          </Link>
        )}
      </div>

      {/* Kategori Filtreleri */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/recipes"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !searchParams.category
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tümü
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/recipes?category=${cat}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              searchParams.category === cat
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        }
      >
        <RecipeList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
