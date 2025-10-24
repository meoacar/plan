import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import FriendSuggestions from "@/components/friend-suggestions/friend-suggestions";

export const metadata = {
  title: "Arkadaş Önerileri - Zayıflama Planım",
  description: "Benzer hedeflere sahip kullanıcıları keşfedin",
};

export default async function FriendSuggestionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🦋 Arkadaş Önerileri</h1>
        <p className="text-gray-600">
          Benzer hedeflere sahip kullanıcıları keşfedin ve takip edin
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-8">Yükleniyor...</div>}>
        <FriendSuggestions />
      </Suspense>
    </div>
  );
}
