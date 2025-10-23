import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminRecipeList from "@/components/admin/admin-recipe-list";

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tarif Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Kullanıcılar tarafından paylaşılan tarifleri onaylayın veya reddedin
        </p>
      </div>

      <AdminRecipeList
        status={searchParams.status}
        page={parseInt(searchParams.page || "1")}
      />
    </div>
  );
}
