import { Suspense } from "react";
import Link from "next/link";
import GroupList from "@/components/groups/group-list";

export const metadata = {
  title: "Gruplar - Zayıflama Planım",
  description: "Ortak hedefler için gruplara katılın",
};

export default function GroupsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gruplar</h1>
          <p className="text-gray-600">
            Ortak hedefler için gruplara katılın ve birlikte başarıya ulaşın
          </p>
        </div>
        <Link
          href="/groups/create"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Grup Oluştur
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Yükleniyor...</div>}>
        <GroupList />
      </Suspense>
    </div>
  );
}
