import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import FriendSuggestions from "@/components/friend-suggestions/friend-suggestions";

export const metadata = {
  title: "Arkadaş Önerileri - Zayıflama Planım",
  description: "Benzer hedeflere sahip kullanıcıları keşfedin ve birlikte başarıya ulaşın",
};

export default async function FriendSuggestionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        }>
          <FriendSuggestions />
        </Suspense>
      </div>
    </div>
  );
}
