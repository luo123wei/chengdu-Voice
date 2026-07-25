'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const gaMeasurementId = settings?.gaMeasurementId;
        
        if (gaMeasurementId && gaMeasurementId.startsWith('G-')) {
          const script = document.createElement('script');
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
          script.async = true;
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          const gtag = (...args: any[]) => {
            window.dataLayer?.push(args);
          };
          gtag('js', new Date());
          gtag('config', gaMeasurementId);
        }
      } catch (e) {
        console.error('Failed to load Google Analytics:', e);
      }
    }
  }, []);

  return null;
}