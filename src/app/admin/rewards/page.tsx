import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminRewardList from "@/components/admin/admin-reward-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ödül Yönetimi - Admin Panel",
  description: "Mağaza ödüllerini yönetin ve yeni ödüller oluşturun",
};

export default async function AdminRewardsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">🎁 Ödül Yönetimi</h1>
        <p className="text-lg text-white/90">
          Mağaza ödüllerini yönetin, stok takibi yapın ve satış istatistiklerini görüntüleyin
        </p>
      </div>

      <AdminRewardList />
    </div>
  );
}
