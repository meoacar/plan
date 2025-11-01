/**
 * Error Tracking Utility
 * Centralized error handling and reporting
 * Can be integrated with Sentry or other error tracking services
 */

export interface ErrorContext {
  userId?: string;
  groupId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ErrorTracker {
  private errors: Array<{
    error: Error;
    context?: ErrorContext;
    timestamp: Date;
  }> = [];

  private maxErrors = 500;

  /**
   * Track an error
   */
  track(error: Error, context?: ErrorContext) {
    this.errors.push({
      error,
      context,
      timestamp: new Date(),
    });

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console
    this.logError(error, context);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(error, context);
    }
  }

  private logError(error: Error, context?: ErrorContext) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error tracked:', errorInfo);
    } else {
      // Production: structured logging for Vercel
      console.error(JSON.stringify(errorInfo));
    }
  }

  private reportToService(error: Error, context?: ErrorContext) {
    // TODO: Integrate with Sentry or other error tracking service
    // Example Sentry integration:
    /*
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    }
    */

    // For now, just ensure it's logged
    console.error('Error reported:', {
      message: error.message,
      context,
    });
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50) {
    return this.errors.slice(-limit).map((item) => ({
      name: item.error.name,
      message: item.error.message,
      context: item.context,
      timestamp: item.timestamp,
    }));
  }

  /**
   * Get error statistics
   */
  getStats() {
    const now = Date.now();
    const last24Hours = this.errors.filter(
      (item) => now - item.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    const errorsByType: Record<string, number> = {};
    last24Hours.forEach((item) => {
      const type = item.error.name || 'Unknown';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      last24Hours: last24Hours.length,
      errorsByType,
    };
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Wrapper for async functions with error tracking
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      errorTracker.track(error, context);
    }
    throw error;
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    errorTracker.track(error, error.context);
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    errorTracker.track(error);
    return Response.json(
      {
        error: {
          message:
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      error: {
        message: 'Unknown error occurred',
      },
    },
    { status: 500 }
  );
}
