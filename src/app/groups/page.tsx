import { Suspense } from "react";
import Link from "next/link";
import GroupList from "@/components/groups/group-list";
import { Users, Plus, TrendingUp, Award, Heart } from "lucide-react";

export const metadata = {
  title: "Gruplar - Zayıflama Planım",
  description: "Ortak hedefler için gruplara katılın",
};

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Topluluk Gücü</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Hedeflerine Birlikte Ulaş
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Benzer hedeflere sahip insanlarla tanış, motivasyonunu yüksek tut ve başarı hikayeni paylaş 🚀
            </p>
            
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl"
            >
              <Plus className="w-5 h-5" />
              Yeni Grup Oluştur
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            {[
              { icon: Users, label: "Aktif Grup", value: "50+" },
              { icon: TrendingUp, label: "Toplam Üye", value: "2,500+" },
              { icon: Award, label: "Challenge", value: "100+" },
              { icon: Heart, label: "Destek Mesajı", value: "10K+" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Gruplar yükleniyor...</p>
          </div>
        }>
          <GroupList />
        </Suspense>
      </div>
    </div>
  );
}
