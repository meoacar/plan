import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MyRecipesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            Onay Bekliyor
          </span>
        );
      case "APPROVED":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Yayında
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tariflerim</h1>
          <p className="mt-2 text-gray-600">
            Paylaştığınız tarifleri buradan yönetebilirsiniz
          </p>
        </div>
        <Link
          href="/recipes/submit"
          className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          + Yeni Tarif
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="mb-4 text-lg text-gray-600">
            Henüz tarif paylaşmadınız
          </p>
          <Link
            href="/recipes/submit"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            İlk Tarifini Paylaş
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm"
            >
              {recipe.images[0] && (
                <img
                  src={recipe.images[0].url}
                  alt={recipe.title}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recipe.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {recipe.description}
                    </p>
                  </div>
                  {getStatusBadge(recipe.status)}
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="rounded bg-gray-100 px-2 py-1">
                    {recipe.category}
                  </span>
                  {recipe.difficulty && <span>{recipe.difficulty}</span>}
                  {recipe.prepTime && (
                    <span>
                      ⏱️ {recipe.prepTime + (recipe.cookTime || 0)} dk
                    </span>
                  )}
                  {recipe.servings && <span>👥 {recipe.servings} kişilik</span>}
                  <span>❤️ {recipe._count.likes}</span>
                  <span>💬 {recipe._count.comments}</span>
                  <span>👁️ {recipe.views}</span>
                </div>

                {recipe.status === "REJECTED" && recipe.rejectionReason && (
                  <div className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">
                    <strong>Red Nedeni:</strong> {recipe.rejectionReason}
                  </div>
                )}

                <div className="flex gap-2">
                  {recipe.status === "APPROVED" && (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Görüntüle
                    </Link>
                  )}
                  {recipe.status === "REJECTED" && (
                    <Link
                      href={`/recipes/edit/${recipe.slug}`}
                      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Düzenle
                    </Link>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
