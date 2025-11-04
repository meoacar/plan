import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminQuestList from "@/components/admin/admin-quest-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Görev Yönetimi - Admin Panel",
  description: "Görevleri yönetin ve yeni görevler oluşturun",
};

export default async function AdminQuestsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">🎯 Görev Yönetimi</h1>
        <p className="text-lg text-white/90">
          Günlük, haftalık ve özel görevleri yönetin
        </p>
      </div>

      <AdminQuestList />
    </div>
  );
}
