import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecipeEditForm from "@/components/recipe-edit-form";

export default async function EditRecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const recipe = await prisma.recipe.findUnique({
    where: { slug: params.slug },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

  // Sadece kendi tarifini düzenleyebilir
  if (recipe.userId !== session.user.id) {
    redirect("/recipes");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tarifi Düzenle</h1>
        <p className="mt-2 text-gray-600">
          Tarifini düzenle ve tekrar onaya gönder
        </p>
      </div>

      {recipe.status === "REJECTED" && recipe.rejectionReason && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          <strong>Red Nedeni:</strong> {recipe.rejectionReason}
        </div>
      )}

      <RecipeEditForm recipe={recipe} />
    </div>
  );
}
