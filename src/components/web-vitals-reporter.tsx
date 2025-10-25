'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Web Vitals tracking'i başlat
    reportWebVitals();
  }, []);

  return null;
}
