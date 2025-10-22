import { prisma } from "./prisma"

interface LogActivityParams {
  userId: string
  type: string
  description: string
  targetId?: string
  targetType?: string
  metadata?: Record<string, any>
  request?: Request
}

/**
 * Admin aktivitelerini ve önemli kullanıcı işlemlerini loglar
 * Requirements: 7.7, 7.8
 */
export async function logActivity({
  userId,
  type,
  description,
  targetId,
  targetType,
  metadata,
  request,
}: LogActivityParams): Promise<void> {
  try {
    // Request'ten IP adresi ve user agent bilgilerini al
    const ipAddress = request
      ? request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null
      : null

    const userAgent = request ? request.headers.get("user-agent") : null

    await prisma.activityLog.create({
      data: {
        userId,
        type: type as any,
        description,
        targetId,
        targetType,
        metadata: metadata ? metadata : undefined,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Loglama hatası uygulamayı durdurmamalı
    console.error("Activity log hatası:", error)
  }
}
