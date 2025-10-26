import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Gizlilik ve Güvenlik - Zayıflama Planım",
  description: "Gizlilik ve güvenlik ayarları",
};

export default async function PrivacyPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/ayarlar"
        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ayarlara Dön
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Gizlilik ve Güvenlik
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Şifre Değiştir
            </h2>
            <p className="text-gray-600 mb-4">
              Hesap güvenliğin için düzenli olarak şifreni değiştirmelisin.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Şifre Değiştir
            </Link>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Hesap Gizliliği
            </h2>
            <p className="text-gray-600 mb-4">
              Profil gizliliği ve takip ayarlarını yönet.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Bu özellik yakında eklenecek. Şu an için profil düzenleme
                sayfasından bio ve sosyal medya bilgilerini güncelleyebilirsin.
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Veri ve Gizlilik
            </h2>
            <div className="space-y-2">
              <Link
                href="/pages/gizlilik-politikasi"
                className="block text-emerald-600 hover:text-emerald-700"
              >
                → Gizlilik Politikası
              </Link>
              <Link
                href="/pages/kullanim-sartlari"
                className="block text-emerald-600 hover:text-emerald-700"
              >
                → Kullanım Şartları
              </Link>
              <Link
                href="/pages/cerez-politikasi"
                className="block text-emerald-600 hover:text-emerald-700"
              >
                → Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
