/**
 * Lightweight Web Vitals monitoring using the native PerformanceObserver API.
 * No external dependencies — works in all modern browsers.
 *
 * Usage: import and call reportWebVitals() once at app startup.
 * In dev mode metrics are logged to the console.
 * In production, replace the `sendToAnalytics` stub with a real beacon.
 */

type MetricName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// ─── Thresholds (from https://web.dev/vitals) ────────────────────────
const THRESHOLDS: Record<MetricName, [number, number]> = {
  CLS:  [0.1, 0.25],
  FID:  [100, 300],
  LCP:  [2500, 4000],
  FCP:  [1800, 3000],
  TTFB: [800, 1800],
  INP:  [200, 500],
};

function rate(name: MetricName, value: number): WebVitalMetric['rating'] {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// Stub — replace with navigator.sendBeacon() / fetch() to your analytics endpoint
function sendToAnalytics(metric: WebVitalMetric) {
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? '#22c55e' : metric.rating === 'needs-improvement' ? '#eab308' : '#ef4444';
    console.log(
      `%c[WebVital] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
  // Production: send to your analytics backend
  // navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
}

function observe(type: string, callback: (entry: PerformanceEntry) => void) {
  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) callback(entry);
    });
    po.observe({ type, buffered: true });
    return po;
  } catch {
    // Observer not supported for this type
    return null;
  }
}

export function reportWebVitals() {
  // ─── FCP (First Contentful Paint) ───────────────────────────────
  observe('paint', (entry) => {
    if (entry.name === 'first-contentful-paint') {
      sendToAnalytics({ name: 'FCP', value: entry.startTime, rating: rate('FCP', entry.startTime) });
    }
  });

  // ─── LCP (Largest Contentful Paint) ─────────────────────────────
  observe('largest-contentful-paint', (entry) => {
    sendToAnalytics({ name: 'LCP', value: entry.startTime, rating: rate('LCP', entry.startTime) });
  });

  // ─── CLS (Cumulative Layout Shift) ──────────────────────────────
  let clsValue = 0;
  observe('layout-shift', (entry: any) => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      sendToAnalytics({ name: 'CLS', value: clsValue, rating: rate('CLS', clsValue) });
    }
  });

  // ─── FID (First Input Delay) ────────────────────────────────────
  observe('first-input', (entry: any) => {
    const fid = entry.processingStart - entry.startTime;
    sendToAnalytics({ name: 'FID', value: fid, rating: rate('FID', fid) });
  });

  // ─── INP (Interaction to Next Paint) ────────────────────────────
  let maxINP = 0;
  observe('event', (entry: any) => {
    const duration = entry.duration;
    if (duration > maxINP) {
      maxINP = duration;
      sendToAnalytics({ name: 'INP', value: duration, rating: rate('INP', duration) });
    }
  });

  // ─── TTFB (Time to First Byte) ─────────────────────────────────
  observe('navigation', (entry: any) => {
    sendToAnalytics({ name: 'TTFB', value: entry.responseStart, rating: rate('TTFB', entry.responseStart) });
  });
}
