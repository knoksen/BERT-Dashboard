/**
 * Performance monitoring utilities for the BERT Dashboard
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

class PerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  private metrics: PerformanceMetrics[] = [];

  /**
   * Starts a performance measurement
   */
  start(name: string): void {
    this.measurements.set(name, performance.now());
  }

  /**
   * Ends a performance measurement and records it
   */
  end(name: string): number | null {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      name,
      duration,
      startTime,
      endTime,
    });

    this.measurements.delete(name);
    return duration;
  }

  /**
   * Measures a function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Gets all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Gets metrics by name
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Gets average duration for a metric name
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  /**
   * Clears all metrics
   */
  clear(): void {
    this.measurements.clear();
    this.metrics = [];
  }

  /**
   * Logs a summary of all metrics
   */
  logSummary(): void {
    if (this.metrics.length === 0) {
      console.log('No performance metrics recorded');
      return;
    }

    console.group('📊 Performance Summary');
    
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(grouped).forEach(([name, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      console.log(
        `${name}: avg ${avg.toFixed(2)}ms | min ${min.toFixed(2)}ms | max ${max.toFixed(2)}ms (${durations.length} samples)`
      );
    });
    
    console.groupEnd();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Web Vitals monitoring
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function measureWebVitals(onReport?: (vitals: WebVitals) => void): void {
  const vitals: WebVitals = {};

  // Measure FCP
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    vitals.FCP = fcpEntry.startTime;
  }

  // Measure LCP using PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
        if (onReport) onReport(vitals);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // @ts-expect-error - processingStart is not in TypeScript types yet
          vitals.FID = entry.processingStart - entry.startTime;
          if (onReport) onReport(vitals);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Measure CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // @ts-expect-error - value is not in TypeScript types yet
          if (!entry.hadRecentInput) {
            // @ts-expect-error - value is not in TypeScript types yet
            clsValue += entry.value;
            vitals.CLS = clsValue;
            if (onReport) onReport(vitals);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Error setting up Performance Observers:', error);
    }
  }

  // Measure TTFB
  const navigationEntries = performance.getEntriesByType('navigation');
  if (navigationEntries.length > 0) {
    const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
    vitals.TTFB = navEntry.responseStart - navEntry.requestStart;
  }

  if (onReport) {
    // Report initial vitals
    onReport(vitals);
  }
}

/**
 * Memory usage monitoring (Chrome only)
 */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}

export function getMemoryInfo(): MemoryInfo | null {
  // @ts-expect-error - memory is Chrome-specific
  if (performance.memory) {
    // @ts-expect-error - memory is Chrome-specific
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    return {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      usedPercent: (usedJSHeapSize / jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

/**
 * Logs memory usage
 */
export function logMemoryInfo(): void {
  const memInfo = getMemoryInfo();
  if (memInfo) {
    console.log('🧠 Memory Usage:', {
      used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      percent: `${memInfo.usedPercent.toFixed(2)}%`,
    });
  } else {
    console.log('Memory info not available (Chrome only feature)');
  }
}

/**
 * Monitors long tasks (Chrome only)
 */
export function monitorLongTasks(threshold = 50): void {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > threshold) {
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }
  }
}
