import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ModerationPanel } from "@/components/admin/moderation-panel"

export const metadata = {
  title: "İçerik Moderasyonu - Admin Panel",
  description: "Yasaklı kelimeler ve engellenen içerik yönetimi",
}

export default async function ModerationPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Yasaklı kelimeleri getir
  const bannedWords = await prisma.bannedWord.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Bekleyen planları getir
  const blockedPlans = await prisma.plan.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // İstatistikler
  const totalBannedWords = bannedWords.length
  const totalBlockedPlans = blockedPlans.length
  const totalBlockedComments = 0 // Şimdilik 0, ileride Comment modeline status eklendiğinde güncellenecek

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">İçerik Moderasyonu</h1>
        <p className="mt-2 text-gray-600">
          Yasaklı kelimeleri yönetin ve engellenen içeriği inceleyin
        </p>
      </div>

      <ModerationPanel
        initialBannedWords={bannedWords.map(bw => ({
          ...bw,
          createdAt: bw.createdAt.toISOString(),
        }))}
        initialBlockedContent={{
          blockedPlans: blockedPlans.map(plan => ({
            ...plan,
            createdAt: plan.createdAt.toISOString(),
            updatedAt: plan.updatedAt.toISOString(),
          })),
          totalPlans: totalBlockedPlans,
        }}
        stats={{
          totalBannedWords,
          blockedPlans: totalBlockedPlans,
          blockedComments: totalBlockedComments,
        }}
      />
    </div>
  )
}
