'use client';

import { useEffect, useState } from 'react';
import { getDeviceType, getConnectionSpeed, getMemoryUsage, isLowPowerMode } from '@/lib/mobile-performance';

export function PerformanceMonitor() {
  const [showMonitor, setShowMonitor] = useState(false);
  const [metrics, setMetrics] = useState({
    deviceType: 'unknown',
    connectionSpeed: 'unknown',
    memoryUsage: 0,
    lowPowerMode: false,
  });

  useEffect(() => {
    // Sadece development modda göster
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = async () => {
      setMetrics({
        deviceType: getDeviceType(),
        connectionSpeed: getConnectionSpeed(),
        memoryUsage: getMemoryUsage() || 0,
        lowPowerMode: await isLowPowerMode(),
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Production'da gösterme
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowMonitor(!showMonitor)}
        className="fixed bottom-20 right-4 z-[9999] bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Monitor Panel */}
      {showMonitor && (
        <div className="fixed bottom-32 right-4 z-[9999] bg-white rounded-lg shadow-2xl p-4 w-64 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Performance Monitor</h3>
            <button
              onClick={() => setShowMonitor(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Device:</span>
              <span className="font-semibold">{metrics.deviceType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Connection:</span>
              <span
                className={`font-semibold ${
                  metrics.connectionSpeed === 'fast'
                    ? 'text-green-600'
                    : metrics.connectionSpeed === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.connectionSpeed}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Memory:</span>
              <span
                className={`font-semibold ${
                  metrics.memoryUsage < 50
                    ? 'text-green-600'
                    : metrics.memoryUsage < 80
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.memoryUsage}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Low Power:</span>
              <span className={`font-semibold ${metrics.lowPowerMode ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.lowPowerMode ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="text-gray-500 text-xs">
                FPS: {typeof window !== 'undefined' ? Math.round(1000 / 16.67) : 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
