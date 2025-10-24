import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminChallengeList from "@/components/admin/admin-challenge-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Challenge Yönetimi - Admin Panel",
  description: "Challenge'ları yönetin ve yeni challenge oluşturun",
};

export default async function AdminChallengesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Challenge Yönetimi</h1>
        <p className="text-gray-600">
          Haftalık ve aylık challenge'ları yönetin
        </p>
      </div>

      <AdminChallengeList />
    </div>
  );
}
