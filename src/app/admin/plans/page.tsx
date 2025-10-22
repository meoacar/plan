import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminPlanList } from "@/components/admin-plan-list"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

// Disable caching for admin pages
export const dynamic = "force-dynamic"

export default async function AdminPlansPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const status = params.status || "PENDING"

  const plans = await prisma.plan.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">📋 Plan Yönetimi</h1>
        <p className="text-lg text-white/90">Planları onaylayın, reddedin veya düzenleyin</p>
      </div>

      <AdminPlanList plans={plans} currentStatus={status} />
    </div>
  )
}
