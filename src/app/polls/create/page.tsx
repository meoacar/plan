import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreatePollForm from "@/components/CreatePollForm";

export const metadata = {
  title: "Anket Oluştur - Zayıflama Planım",
};

export default async function CreatePollPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Anket Oluştur</h1>
        <p className="mt-2 text-gray-600">
          Toplulukla paylaşmak istediğiniz bir anket oluşturun
        </p>
      </div>

      <CreatePollForm />
    </div>
  );
}
