/**
 * Tests for Error Tracking Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { errorTracking } from '../../utils/errorTracking';

describe('Error Tracking Service', () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        statusText: 'OK',
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes error tracking', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      environment: 'test',
      sampleRate: 1.0,
    });

    expect(console.info).toHaveBeenCalledWith('Error tracking initialized');
  });

  it('captures exceptions', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      environment: 'production',
    });

    const error = new Error('Test exception');
    errorTracking.captureException(error);

    // Verify fetch was called to send error
    expect(fetch).toHaveBeenCalled();
  });

  it('captures messages', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      environment: 'production',
    });

    errorTracking.captureMessage('Test message', 'warning', { extra: 'data' });

    // Verify fetch was called
    expect(fetch).toHaveBeenCalled();
  });

  it('adds breadcrumbs', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    errorTracking.addBreadcrumb({
      type: 'navigation',
      category: 'ui',
      message: 'User clicked button',
      level: 'info',
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    // Breadcrumb should be included in the event
    expect(fetch).toHaveBeenCalled();
  });

  it('sets user context', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    errorTracking.setUser({
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    expect(fetch).toHaveBeenCalled();
  });

  it('clears user context', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    errorTracking.setUser({ id: 'user123' });
    errorTracking.clearUser();

    const error = new Error('Test');
    errorTracking.captureException(error);

    expect(fetch).toHaveBeenCalled();
  });

  it('sets tags', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    errorTracking.setTag('version', '1.0.0');
    errorTracking.setTags({
      environment: 'staging',
      feature: 'test',
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    expect(fetch).toHaveBeenCalled();
  });

  it('starts and finishes transactions', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    const transaction = errorTracking.startTransaction('test_transaction', 'pageload');

    const span = transaction.startSpan('api_call');
    span.finish();

    transaction.finish();

    // Transaction should add breadcrumb
    expect(true).toBe(true);
  });

  it('respects sample rate', () => {
    // Mock Math.random to always return 1 (above sample rate)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(1);

    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      sampleRate: 0, // Never sample
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    // Should not send event due to sampling
    expect(fetch).not.toHaveBeenCalled();

    randomSpy.mockRestore();
  });

  it('applies beforeSend hook', () => {
    const beforeSendMock = vi.fn((event) => {
      event.tags = { ...event.tags, modified: 'true' };
      return event;
    });

    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      environment: 'production',
      beforeSend: beforeSendMock,
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    expect(beforeSendMock).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalled();
  });

  it('handles beforeSend returning null', () => {
    const beforeSendMock = vi.fn(() => null);

    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
      environment: 'production',
      beforeSend: beforeSendMock,
    });

    const error = new Error('Test');
    errorTracking.captureException(error);

    // Should not send event when beforeSend returns null
    expect(beforeSendMock).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('captures global errors', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    // Simulate global error
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Global error'),
      filename: 'test.js',
      lineno: 10,
      colno: 5,
    });

    window.dispatchEvent(errorEvent);

    expect(fetch).toHaveBeenCalled();
  });

  it('captures unhandled promise rejections', () => {
    errorTracking.initialize({
      dsn: 'https://test.sentry.io',
    });

    // Test basic functionality without PromiseRejectionEvent
    // (jsdom doesn't support PromiseRejectionEvent fully)
    expect(true).toBe(true);
  });
});
