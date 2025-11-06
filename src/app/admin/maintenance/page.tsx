import { requireAdmin } from "@/lib/admin-auth"
import { MaintenancePanel } from "@/components/admin/maintenance-panel"
import {
  getDatabaseSize,
  getTotalRecords,
  getLastBackupDate,
} from "@/lib/backup"
import { prisma } from "@/lib/prisma"
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"

/**
 * Admin bakım sayfası
 * Requirements: 11.1, 11.5
 */
export default async function MaintenancePage() {
  await requireAdmin()

  // Sistem bilgilerini al
  const [dbSize, totalRecords, lastBackup, backups] = await Promise.all([
    getDatabaseSize(),
    getTotalRecords(),
    getLastBackupDate(),
    prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  const systemInfo = {
    dbSize,
    totalRecords,
    lastBackup,
  }

  return (
    <div>
      <AdminBreadcrumb />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Yedekleme ve Bakım
        </h1>
        <p className="mt-2 text-gray-600">
          Sistem yedekleme, cache yönetimi ve sağlık kontrolü
        </p>
      </div>

      <MaintenancePanel systemInfo={systemInfo} backups={backups} />
    </div>
  )
}
