import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

/**
 * Bakım modu kontrolü yapan HOC
 * Sayfa component'lerini wrap eder
 */
export async function withMaintenanceCheck<P extends object>(
  Component: React.ComponentType<P>
) {
  return async function MaintenanceWrapper(props: P) {
    const session = await auth()

    try {
      const settings = await prisma.siteSettings.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { maintenanceMode: true },
      })

      // Bakım modu aktifse ve kullanıcı admin değilse yönlendir
      if (settings?.maintenanceMode === true && session?.user?.role !== "ADMIN") {
        redirect("/maintenance")
      }
    } catch (error) {
      console.error("Maintenance check error:", error)
    }

    return <Component {...props} />
  }
}
