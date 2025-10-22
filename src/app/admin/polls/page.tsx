import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PollManagement from "@/components/admin/PollManagement";

export const metadata = {
  title: "Anket Yönetimi - Admin",
};

export default async function AdminPollsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const polls = await prisma.poll.findMany({
    include: {
      creator: {
        select: { id: true, name: true },
      },
      options: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
      _count: {
        select: { votes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anket Yönetimi</h1>
          <p className="mt-2 text-gray-600">Anketleri oluşturun ve yönetin</p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Admin Paneli
        </Link>
      </div>

      <PollManagement initialPolls={polls} />
    </div>
  );
}
