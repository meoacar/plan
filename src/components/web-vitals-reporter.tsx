'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    // Sadece production'da çalıştır
    if (process.env.NODE_ENV === 'production') {
      reportWebVitals();
    }
  }, []);

  return null;
}
