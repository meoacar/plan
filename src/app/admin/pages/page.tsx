import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageManager } from "@/components/admin/page-manager"

export const metadata = {
  title: "Sayfa Yönetimi - Admin Panel",
  description: "Dinamik sayfaları yönetin",
}

export default async function PagesAdminPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const pages = await prisma.page.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sayfa Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Dinamik sayfalar oluşturun ve yönetin
          </p>
        </div>
      </div>

      <PageManager pages={pages} userId={session.user.id} />
    </div>
  )
}
