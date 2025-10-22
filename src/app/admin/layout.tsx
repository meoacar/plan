import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"
import { SkipToContent } from "@/components/ui/skip-to-content"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <>
      <SkipToContent />
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main id="main-content" className="flex-1 overflow-x-hidden w-full lg:w-auto">
          <div className="container mx-auto px-4 lg:px-6 py-6 pt-20 lg:pt-6 max-w-7xl">
            <AdminBreadcrumb />
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
