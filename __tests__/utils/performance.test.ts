import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor, getMemoryInfo } from '../../utils/performance';

describe('performance utilities', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  describe('PerformanceMonitor', () => {
    it('measures performance', () => {
      performanceMonitor.start('test');
      performanceMonitor.end('test');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('handles missing start time', () => {
      const result = performanceMonitor.end('nonexistent');
      expect(result).toBeNull();
    });

    it('measures async functions', async () => {
      const result = await performanceMonitor.measure('async-test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');
      const metrics = performanceMonitor.getMetricsByName('async-test');
      expect(metrics).toHaveLength(1);
    });

    it('calculates average duration', () => {
      performanceMonitor.start('test');
      performanceMonitor.end('test');
      performanceMonitor.start('test');
      performanceMonitor.end('test');

      const avg = performanceMonitor.getAverageDuration('test');
      expect(avg).toBeGreaterThanOrEqual(0);
    });

    it('clears metrics', () => {
      performanceMonitor.start('test');
      performanceMonitor.end('test');
      performanceMonitor.clear();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });

    it('logs summary', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      performanceMonitor.start('test');
      performanceMonitor.end('test');
      performanceMonitor.logSummary();

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('getMemoryInfo', () => {
    it('returns memory info when available', () => {
      // Mock Chrome's performance.memory
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000,
        },
        configurable: true,
      });

      const memInfo = getMemoryInfo();
      expect(memInfo).toBeTruthy();
      if (memInfo) {
        expect(memInfo.usedJSHeapSize).toBe(1000000);
        expect(memInfo.usedPercent).toBeGreaterThan(0);
      }
    });

    it('returns null when not available', () => {
      Object.defineProperty(performance, 'memory', {
        value: undefined,
        configurable: true,
      });

      const memInfo = getMemoryInfo();
      expect(memInfo).toBeNull();
    });
  });
});
