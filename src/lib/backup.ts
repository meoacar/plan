import { prisma } from "./prisma"
import { exec } from "child_process"
import { promisify } from "util"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

/**
 * Veritabanı yedeği oluşturur
 * Requirements: 11.3
 */
export async function createBackup(userId?: string): Promise<{
  filename: string
  size: number
  path: string
}> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `backup-${timestamp}.json`
    const backupDir = path.join(process.cwd(), "backups")
    const filePath = path.join(backupDir, filename)

    // Backups klasörünü oluştur
    try {
      await mkdir(backupDir, { recursive: true })
    } catch (error) {
      // Klasör zaten varsa hata verme
    }

    // Tüm verileri export et
    const data = await exportDatabase()

    // JSON olarak kaydet
    const jsonData = JSON.stringify(data, null, 2)
    await writeFile(filePath, jsonData, "utf-8")

    const size = Buffer.byteLength(jsonData, "utf-8")

    // Backup kaydını veritabanına ekle
    await prisma.backup.create({
      data: {
        filename,
        size,
        type: userId ? "manual" : "auto",
        createdBy: userId,
      },
    })

    return {
      filename,
      size,
      path: filePath,
    }
  } catch (error) {
    console.error("Backup oluşturma hatası:", error)
    throw new Error("Yedek oluşturulamadı")
  }
}

/**
 * Veritabanındaki tüm verileri export eder
 */
async function exportDatabase() {
  const [
    users,
    plans,
    comments,
    likes,
    categories,
    tags,
    planTags,
    bannedWords,
    activityLogs,
    emailCampaigns,
    siteSettings,
    backups,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        startWeight: true,
        goalWeight: true,
        instagram: true,
        twitter: true,
        youtube: true,
        tiktok: true,
        website: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.plan.findMany(),
    prisma.comment.findMany(),
    prisma.like.findMany(),
    prisma.category.findMany(),
    prisma.tag.findMany(),
    prisma.planTag.findMany(),
    prisma.bannedWord.findMany(),
    prisma.activityLog.findMany({
      take: 1000, // Son 1000 log
      orderBy: { createdAt: "desc" },
    }),
    prisma.emailCampaign.findMany({
      take: 100, // Son 100 kampanya
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSettings.findMany(),
    prisma.backup.findMany({
      take: 50, // Son 50 backup kaydı
      orderBy: { createdAt: "desc" },
    }),
  ])

  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    data: {
      users,
      plans,
      comments,
      likes,
      categories,
      tags,
      planTags,
      bannedWords,
      activityLogs,
      emailCampaigns,
      siteSettings,
      backups,
    },
  }
}

/**
 * Veritabanı boyutunu hesaplar (PostgreSQL için)
 */
export async function getDatabaseSize(): Promise<number> {
  try {
    // PostgreSQL için veritabanı boyutunu al
    const result = await prisma.$queryRaw<Array<{ size: bigint }>>`
      SELECT pg_database_size(current_database()) as size
    `

    if (result && result[0]) {
      return Number(result[0].size)
    }

    return 0
  } catch (error) {
    console.error("Veritabanı boyutu hesaplama hatası:", error)
    return 0
  }
}

/**
 * Toplam kayıt sayısını hesaplar
 */
export async function getTotalRecords(): Promise<{
  users: number
  plans: number
  comments: number
  likes: number
  categories: number
  tags: number
  total: number
}> {
  try {
    const [users, plans, comments, likes, categories, tags] = await Promise.all(
      [
        prisma.user.count(),
        prisma.plan.count(),
        prisma.comment.count(),
        prisma.like.count(),
        prisma.category.count(),
        prisma.tag.count(),
      ]
    )

    return {
      users,
      plans,
      comments,
      likes,
      categories,
      tags,
      total: users + plans + comments + likes + categories + tags,
    }
  } catch (error) {
    console.error("Kayıt sayısı hesaplama hatası:", error)
    return {
      users: 0,
      plans: 0,
      comments: 0,
      likes: 0,
      categories: 0,
      tags: 0,
      total: 0,
    }
  }
}

/**
 * Son backup tarihini getirir
 */
export async function getLastBackupDate(): Promise<Date | null> {
  try {
    const lastBackup = await prisma.backup.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    })

    return lastBackup?.createdAt || null
  } catch (error) {
    console.error("Son backup tarihi alma hatası:", error)
    return null
  }
}
