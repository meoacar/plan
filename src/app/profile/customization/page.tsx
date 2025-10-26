import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileCustomization from "@/components/profile/ProfileCustomization";

export const metadata = {
  title: "Profil Özelleştirme - Zayıflama Planım",
  description: "Rozetler kazanarak profilini özelleştir",
};

export default async function CustomizationPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileCustomization />
    </div>
  );
}
