import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatNumber,
  truncate,
  debounce,
  throttle,
  deepClone,
  generateId,
  formatDate,
  timeAgo,
  isValidEmail,
  isValidUrl,
  copyToClipboard,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  sleep,
  retry,
  groupBy,
  isPWA,
  safeJsonParse,
} from '../../utils/helpers';

describe('helpers utilities', () => {
  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123)).toBe('123');
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hi', 5)).toBe('Hi');
      expect(truncate('Test', 4)).toBe('Test');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('debounces function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('throttles function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone', () => {
    it('creates deep copy of objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('timeAgo', () => {
    it('calculates time ago correctly', () => {
      const now = Date.now();

      expect(timeAgo(now)).toBe('just now');
      expect(timeAgo(now - 3600000)).toContain('hour');
      expect(timeAgo(now - 86400000)).toContain('day');
    });
  });

  describe('isValidEmail', () => {
    it('validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org')).toBe(true);
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('copies text to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard('test');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test');
    });

    it('handles clipboard errors', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const result = await copyToClipboard('test');

      expect(result).toBe(false);
    });
  });

  describe('localStorage utilities', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('gets and sets localStorage values', () => {
      setLocalStorage('test', { value: 123 });
      const result = getLocalStorage('test', { value: 0 });

      expect(result).toEqual({ value: 123 });
    });

    it('returns default value for missing keys', () => {
      const result = getLocalStorage('missing', { default: true });

      expect(result).toEqual({ default: true });
    });

    it('removes localStorage items', () => {
      setLocalStorage('test', 'value');
      removeLocalStorage('test');
      const result = getLocalStorage('test', null);

      expect(result).toBeNull();
    });
  });

  describe('sleep', () => {
    it('delays execution', async () => {
      vi.useFakeTimers();
      const promise = sleep(50);
      vi.advanceTimersByTime(50);
      await promise;
      vi.useRealTimers();
      expect(true).toBe(true); // Test completes if sleep works
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('retries failed operations', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      });

      const promise = retry(fn, { maxAttempts: 3, initialDelay: 10 });

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('throws after max attempts', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails');
      });

      const promise = retry(fn, { maxAttempts: 2, initialDelay: 10 });

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('groupBy', () => {
    it('groups array items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];

      const grouped = groupBy(items, (item) => item.type);

      expect(grouped).toEqual({
        a: [{ type: 'a', value: 1 }, { type: 'a', value: 3 }],
        b: [{ type: 'b', value: 2 }],
      });
    });
  });

  describe('isPWA', () => {
    it('detects PWA mode', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const result = isPWA();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      const result = safeJsonParse('{"test": 123}', {});
      expect(result).toEqual({ test: 123 });
    });

    it('returns default for invalid JSON', () => {
      const result = safeJsonParse('invalid', { default: true });
      expect(result).toEqual({ default: true });
    });
  });
});
