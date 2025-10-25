// Web Vitals tracking için utility
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

// Analytics endpoint'e veri gönder
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // Navigator.sendBeacon kullan (sayfa kapanırken bile çalışır)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    // Fallback: fetch
    fetch('/api/analytics/web-vitals', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(console.error);
  }
}

// Tüm Web Vitals metriklerini izle
export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  } catch (error) {
    console.error('Web Vitals tracking error:', error);
  }
}
