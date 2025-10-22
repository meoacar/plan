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

// Cache'i devre dışı bırak
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function Navbar() {
  const settings = await getSiteSettings()
  
  return (
    <NavbarClient 
      siteTitle={settings?.siteTitle || "Zayıflama Planım"}
      logoUrl={settings?.logoUrl}
    />
  )
}
