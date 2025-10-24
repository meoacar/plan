import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminGroupList from "@/components/admin/admin-group-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Grup Yönetimi - Admin Panel",
  description: "Grupları yönetin, onaylayın veya reddedin",
};

export default async function AdminGroupsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grup Yönetimi</h1>
        <p className="text-gray-600">
          Kullanıcılar tarafından oluşturulan grupları onaylayın veya reddedin
        </p>
      </div>

      <AdminGroupList />
    </div>
  );
}
