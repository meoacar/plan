import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateGroupForm from "@/components/groups/create-group-form";

export const metadata = {
  title: "Grup Oluştur - Zayıflama Planım",
  description: "Yeni bir grup oluşturun",
};

export default async function CreateGroupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grup Oluştur</h1>
        <p className="text-gray-600">
          Ortak hedefler için yeni bir grup oluşturun
        </p>
      </div>

      <CreateGroupForm />
    </div>
  );
}
