import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiLogger, performanceMonitor } from '@/lib/api-logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Admin monitoring endpoint
 * Provides system health and performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only allow admin users
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get API logs stats
    const apiStats = apiLogger.getStats();
    const recentErrors = apiLogger.getErrorLogs(20);

    // Get performance metrics
    const performanceStats = performanceMonitor.getAllStats();

    // Get database stats
    const dbStats = await getDatabaseStats();

    // Get system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV,
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      api: apiStats,
      recentErrors: recentErrors.map((log) => ({
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        error: log.error,
        timestamp: log.timestamp,
      })),
      performance: performanceStats,
      database: dbStats,
      system: systemInfo,
    });
  } catch (error) {
    console.error('Monitoring endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getDatabaseStats() {
  try {
    const [
      totalUsers,
      totalGroups,
      totalPosts,
      totalMessages,
      activeGroups,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.groupPost.count(),
      prisma.groupMessage.count(),
      prisma.group.count({
        where: {
          status: 'APPROVED',
          members: {
            some: {
              lastActiveAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalGroups,
      totalPosts,
      totalMessages,
      activeGroups,
      recentUsers,
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return {
      error: 'Failed to fetch database stats',
    };
  }
}
