import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PollCard from "@/components/PollCard";
import Link from "next/link";

export const metadata = {
  title: "Anketler - Zayıflama Planım",
  description: "Topluluk anketlerine katılın ve görüşlerinizi paylaşın",
};

export default async function PollsPage() {
  const session = await auth();

  const polls = await prisma.poll.findMany({
    where: {
      isActive: true,
      OR: [
        { endsAt: null },
        { endsAt: { gt: new Date() } }
      ],
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
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

  // Kullanıcının oylarını getir
  const pollsWithVotes = session?.user
    ? await Promise.all(
      polls.map(async (poll: typeof polls[0]) => {
        const userVotes = await prisma.pollVote.findMany({
          where: {
            pollId: poll.id,
            userId: session.user.id,
          },
          select: { optionId: true },
        });
        return {
          ...poll,
          userVotes: userVotes.map((v: { optionId: string }) => v.optionId),
        };
      })
    )
    : polls.map((poll: typeof polls[0]) => ({ ...poll, userVotes: [] }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Decorative background elements */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-green-100 opacity-20 blur-3xl"></div>
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-blue-100 opacity-20 blur-3xl"></div>
      
      <div className="relative mx-auto max-w-5xl px-4 py-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-green-400 opacity-20 blur-xl"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-2xl shadow-green-500/40">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-5xl font-black text-transparent">
                    Anketler
                  </h1>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
                    <div className="h-1 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
                    <div className="h-1 w-4 rounded-full bg-gradient-to-r from-green-300 to-green-400"></div>
                  </div>
                </div>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600">
                Topluluk anketlerine katılın, görüşlerinizi paylaşın ve diğer kullanıcıların düşüncelerini keşfedin
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  <span className="font-semibold text-gray-700">{pollsWithVotes.length} Aktif Anket</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {session?.user && (
                <Link
                  href="/polls/create"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-600/40"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Anket Oluştur
                </Link>
              )}
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin/polls"
                  className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Yönetim
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Polls List */}
        {pollsWithVotes.length === 0 ? (
          <div className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-white/80 p-20 text-center shadow-xl backdrop-blur-sm transition-all hover:border-green-300 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">Henüz aktif anket bulunmuyor</p>
              <p className="mt-3 text-base text-gray-500">İlk anketi siz oluşturun ve topluluğun fikrini öğrenin!</p>
              {session?.user && (
                <Link
                  href="/polls/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-600/40"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  İlk Anketi Oluştur
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {pollsWithVotes.map((poll: typeof pollsWithVotes[0], index: number) => (
              <div
                key={poll.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <PollCard
                  poll={poll}
                  isAuthenticated={!!session?.user}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
