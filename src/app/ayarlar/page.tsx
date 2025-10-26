import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Bell, Palette, User, Shield } from "lucide-react";

export const metadata = {
  title: "Ayarlar - Zayıflama Planım",
  description: "Hesap ayarlarını yönet",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const settingsMenu = [
    {
      title: "Profil Düzenle",
      description: "Profil bilgilerini ve fotoğrafını güncelle",
      icon: User,
      href: "/profile/edit",
      color: "bg-blue-500",
    },
    {
      title: "Profil Özelleştirme",
      description: "Çerçeveler, temalar ve arka planlar",
      icon: Palette,
      href: "/profile/customization",
      color: "bg-purple-500",
    },
    {
      title: "Bildirim Ayarları",
      description: "Bildirim tercihlerini yönet",
      icon: Bell,
      href: "/ayarlar/bildirimler",
      color: "bg-green-500",
    },
    {
      title: "Gizlilik ve Güvenlik",
      description: "Şifre değiştir ve gizlilik ayarları",
      icon: Shield,
      href: "/ayarlar/gizlilik",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
        <p className="text-gray-600">
          Hesap ayarlarını ve tercihlerini yönet
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-emerald-500"
            >
              <div className="flex items-start space-x-4">
                <div className={`${item.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 mb-1">
              💡 İpucu: Profil Özelleştirme
            </h3>
            <p className="text-sm text-emerald-800">
              Rozetler kazanarak özel çerçeveler, arka planlar ve temalar
              açabilirsin! Her rozet yeni bir özelleştirme seçeneği getirir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
