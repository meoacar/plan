import { prisma } from "@/lib/prisma"
import { NavbarClient } from "./navbar-client"

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })
    return settings
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return null
  }
}

async function getNavbarPages() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isPublished: true,
        OR: [
          { showInNavbar: true },
          { showInTopNavbar: true },
        ],
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        showInNavbar: true,
        showInTopNavbar: true,
      },
    })
    return pages
  } catch (error) {
    console.error("Error fetching navbar pages:", error)
    return []
  }
}

// Cache'i devre dışı bırak
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function Navbar() {
  const settings = await getSiteSettings()
  const pages = await getNavbarPages()
  
  return (
    <NavbarClient 
      siteTitle={settings?.siteTitle || "Zayıflama Planım"}
      logoUrl={settings?.logoUrl}
      navbarPages={pages}
    />
  )
}
