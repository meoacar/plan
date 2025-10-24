import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/admin/settings-form"
import { FooterLinkManager } from "@/components/admin/footer-link-manager"

/**
 * Admin Site Ayarları Sayfası
 * Requirements: 3.1, 3.7, 3.10
 */
export default async function AdminSettingsPage() {
  const session = await auth()

  // Auth kontrolü
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Mevcut ayarları getir
  let settings = await prisma.siteSettings.findFirst({
    orderBy: { updatedAt: "desc" },
    include: {
      footerLinks: {
        orderBy: { order: "asc" },
      },
    },
  })

  // Eğer ayar yoksa, varsayılan ayarları oluştur
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteTitle: "Zayıflama Planım",
        siteDescription: "Başarılı zayıflama hikayelerini keşfedin ve kendi planınızı paylaşın",
        maintenanceMode: false,
        updatedBy: session.user.id,
      },
      include: {
        footerLinks: true,
      },
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Ayarları</h1>
        <p className="mt-2 text-gray-600">
          Site genelindeki ayarları buradan yönetebilirsiniz
        </p>
      </div>

      <SettingsForm initialSettings={settings} />

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <FooterLinkManager links={settings.footerLinks} settingsId={settings.id} />
      </div>
    </div>
  )
}
