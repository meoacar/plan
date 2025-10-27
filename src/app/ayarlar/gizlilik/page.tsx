import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrivacySettingsForm } from "@/components/privacy-settings-form";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Gizlilik ve Güvenlik - Zayıflama Planım",
  description: "Gizlilik ve güvenlik ayarları",
};

export default async function PrivacyPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isPrivate: true,
      showEmail: true,
      showWeight: true,
      allowMessages: true,
      requireFollowApproval: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/ayarlar"
        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ayarlara Dön
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gizlilik ve Güvenlik
        </h1>
        <p className="text-gray-600 mb-8">
          Hesap gizliliğini ve güvenlik ayarlarını yönet
        </p>

        <div className="space-y-8">
          {/* Hesap Gizliliği */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              Hesap Gizliliği
            </h2>
            <PrivacySettingsForm initialSettings={user || {
              isPrivate: false,
              showEmail: false,
              showWeight: true,
              allowMessages: true,
              requireFollowApproval: false,
            }} />
          </div>

          <hr className="border-gray-200" />

          {/* Şifre Değiştir */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              Şifre Değiştir
            </h2>
            <p className="text-gray-600 mb-4">
              Hesap güvenliğin için düzenli olarak şifreni değiştirmelisin.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Şifre Değiştir
            </Link>
          </div>

          <hr className="border-gray-200" />

          {/* Veri ve Gizlilik */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Veri ve Gizlilik
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/pages/gizlilik-politikasi"
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="text-3xl mb-2">🛡️</div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                  Gizlilik Politikası
                </div>
              </Link>
              <Link
                href="/pages/kullanim-sartlari"
                className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="text-3xl mb-2">📋</div>
                <div className="font-semibold text-gray-900 group-hover:text-purple-700">
                  Kullanım Şartları
                </div>
              </Link>
              <Link
                href="/pages/cerez-politikasi"
                className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="text-3xl mb-2">🍪</div>
                <div className="font-semibold text-gray-900 group-hover:text-orange-700">
                  Çerez Politikası
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
