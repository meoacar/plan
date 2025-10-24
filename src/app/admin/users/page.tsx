import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminUserList } from "@/components/admin-user-list"

// Disable caching for admin pages
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      goalWeight: true,
      startWeight: true,
      city: true,
      image: true,
      username: true,
      _count: {
        select: {
          plans: true,
          comments: true,
          likes: true,
        },
      },
    },
  })

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">👥 Kullanıcı Yönetimi</h1>
        <p className="text-lg text-white/90">
          Toplam {users.length} kullanıcı • Gelişmiş yönetim paneli
        </p>
      </div>

      <AdminUserList users={users} />
    </div>
  )
}
