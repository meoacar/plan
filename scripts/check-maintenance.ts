import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkMaintenance() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    console.log("=== Bakım Modu Durumu ===")
    console.log("Maintenance Mode:", settings?.maintenanceMode)
    console.log("Site Title:", settings?.siteTitle)
    console.log("Updated At:", settings?.updatedAt)
    console.log("Updated By:", settings?.updatedBy)
    console.log("\nTüm ayarlar:")
    console.log(JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error("Hata:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMaintenance()
