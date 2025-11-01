/**
 * API Request Logger
 * Logs API requests with timing, status, and error information
 */

export interface ApiLogData {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  error?: string;
  timestamp: Date;
}

class ApiLogger {
  private logs: ApiLogData[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  log(data: ApiLogData) {
    this.logs.push(data);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = data.statusCode >= 500 ? '❌' : data.statusCode >= 400 ? '⚠️' : '✅';
      console.log(
        `${emoji} ${data.method} ${data.path} - ${data.statusCode} (${data.duration}ms)${
          data.error ? ` - ${data.error}` : ''
        }`
      );
    }

    // In production, you could send to external logging service
    // Example: Sentry, LogRocket, Datadog, etc.
    if (process.env.NODE_ENV === 'production' && data.statusCode >= 500) {
      // Log errors to console for Vercel logs
      console.error('API Error:', {
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        duration: data.duration,
        userId: data.userId,
        error: data.error,
        timestamp: data.timestamp,
      });
    }
  }

  getRecentLogs(limit: number = 100): ApiLogData[] {
    return this.logs.slice(-limit);
  }

  getErrorLogs(limit: number = 50): ApiLogData[] {
    return this.logs
      .filter((log) => log.statusCode >= 400)
      .slice(-limit);
  }

  getStats() {
    const now = Date.now();
    const last5Minutes = this.logs.filter(
      (log) => now - log.timestamp.getTime() < 5 * 60 * 1000
    );

    return {
      totalRequests: this.logs.length,
      recentRequests: last5Minutes.length,
      errorRate:
        last5Minutes.length > 0
          ? (last5Minutes.filter((log) => log.statusCode >= 400).length /
              last5Minutes.length) *
            100
          : 0,
      avgDuration:
        last5Minutes.length > 0
          ? last5Minutes.reduce((sum, log) => sum + log.duration, 0) /
            last5Minutes.length
          : 0,
    };
  }
}

export const apiLogger = new ApiLogger();

/**
 * Wrapper for API route handlers with logging
 */
export function withApiLogger<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  options?: {
    logBody?: boolean;
    logHeaders?: boolean;
  }
): T {
  return (async (...args: any[]) => {
    const request = args[0] as Request;
    const startTime = Date.now();

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      apiLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        statusCode: response.status,
        duration,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      apiLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        statusCode: 500,
        duration,
        error: errorMessage,
        timestamp: new Date(),
      });

      throw error;
    }
  }) as T;
}

/**
 * Performance monitoring for specific operations
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  track(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const durations = this.metrics.get(operation)!;
    durations.push(duration);

    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${operation} took ${duration}ms`);
    }
  }

  getStats(operation: string) {
    const durations = this.metrics.get(operation) || [];
    if (durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    return {
      count: durations.length,
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [operation, _] of this.metrics) {
      stats[operation] = this.getStats(operation);
    }
    return stats;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Helper to measure async operation performance
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    performanceMonitor.track(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.track(operation, duration);
    throw error;
  }
}
