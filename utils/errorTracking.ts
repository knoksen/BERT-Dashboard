/**
 * Error Tracking Service (Sentry Integration)
 *
 * Comprehensive error tracking and monitoring with Sentry.
 * Captures errors, user context, breadcrumbs, and performance data.
 */

import type { ErrorInfo } from 'react';

export interface ErrorTrackingConfig {
  dsn: string; // Sentry DSN
  environment?: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null;
}

export interface ErrorEvent {
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: number;
  user?: UserContext;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  fingerprint?: string[];
  breadcrumbs?: Breadcrumb[];
  exception?: {
    values: ExceptionValue[];
  };
}

export interface UserContext {
  id?: string;
  username?: string;
  email?: string;
  ip_address?: string;
}

export interface Breadcrumb {
  type: 'default' | 'http' | 'navigation' | 'user' | 'error';
  category: string;
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface ExceptionValue {
  type: string;
  value: string;
  stacktrace?: {
    frames: StackFrame[];
  };
}

export interface StackFrame {
  filename: string;
  function: string;
  lineno: number;
  colno: number;
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig | null = null;
  private initialized = false;
  private breadcrumbs: Breadcrumb[] = [];
  private userContext: UserContext = {};
  private tags: Record<string, string> = {};
  private maxBreadcrumbs = 100;

  /**
   * Initialize error tracking
   */
  initialize(config: ErrorTrackingConfig): void {
    if (this.initialized) {
      console.warn('Error tracking already initialized');
      return;
    }

    this.config = {
      environment: 'production',
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      ...config,
    };

    // Set up global error handlers
    this.setupGlobalHandlers();

    // Set default tags
    this.setTag('browser', navigator.userAgent);
    this.setTag('platform', navigator.platform);
    this.setTag('language', navigator.language);

    this.initialized = true;
    console.info('Error tracking initialized');
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>): void {
    if (!this.initialized || !this.shouldSample()) {
      return;
    }

    const event: ErrorEvent = {
      message: error.message,
      level: 'error',
      timestamp: Date.now(),
      user: this.userContext,
      tags: this.tags,
      extra: {
        ...context,
        componentStack: errorInfo?.componentStack,
      },
      breadcrumbs: [...this.breadcrumbs],
      exception: {
        values: [
          {
            type: error.name,
            value: error.message,
            stacktrace: this.parseStackTrace(error.stack),
          },
        ],
      },
    };

    this.sendEvent(event);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: ErrorEvent['level'] = 'info', extra?: Record<string, unknown>): void {
    if (!this.initialized) return;

    const event: ErrorEvent = {
      message,
      level,
      timestamp: Date.now(),
      user: this.userContext,
      tags: this.tags,
      extra,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.sendEvent(event);
  }

  /**
   * Add breadcrumb (navigation trail)
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Set user context
   */
  setUser(user: UserContext): void {
    this.userContext = { ...user };
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.userContext = {};
  }

  /**
   * Set a tag
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Set multiple tags
   */
  setTags(tags: Record<string, string>): void {
    this.tags = { ...this.tags, ...tags };
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, operation: string): Transaction {
    const transaction = new Transaction(name, operation, this);
    return transaction;
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureMessage(
        `Unhandled Promise Rejection: ${event.reason}`,
        'error',
        { reason: event.reason }
      );
    });

    // Global errors
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.captureException(event.error, undefined, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    });
  }

  /**
   * Parse stack trace
   */
  private parseStackTrace(stack?: string): { frames: StackFrame[] } | undefined {
    if (!stack) return undefined;

    const lines = stack.split('\n');
    const frames: StackFrame[] = [];

    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        });
      }
    }

    return { frames };
  }

  /**
   * Check if event should be sampled
   */
  private shouldSample(): boolean {
    if (!this.config?.sampleRate) return true;
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Send event to Sentry
   */
  private sendEvent(event: ErrorEvent): void {
    if (!this.config?.dsn) {
      console.warn('Error tracking DSN not configured');
      return;
    }

    // Apply beforeSend hook
    let finalEvent: ErrorEvent | null = event;
    if (this.config.beforeSend) {
      finalEvent = this.config.beforeSend(event);
    }

    if (!finalEvent) return;

    // In a real implementation, this would send to Sentry
    // For now, we'll log to console in development
    if (this.config.environment === 'development') {
      console.group('🔍 Error Tracked');
      console.log('Level:', finalEvent.level);
      console.log('Message:', finalEvent.message);
      console.log('Tags:', finalEvent.tags);
      console.log('Extra:', finalEvent.extra);
      console.log('Breadcrumbs:', finalEvent.breadcrumbs);
      console.groupEnd();
    }

    // Send to Sentry API
    this.sendToSentry(finalEvent);
  }

  /**
   * Send event to Sentry API
   */
  private async sendToSentry(event: ErrorEvent): Promise<void> {
    if (!this.config?.dsn) return;

    try {
      const response = await fetch(this.config.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error('Failed to send error to Sentry:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending to Sentry:', error);
    }
  }
}

/**
 * Performance Transaction
 */
export class Transaction {
  private startTime: number;
  private spans: Array<{ name: string; duration: number }> = [];

  constructor(
    private name: string,
    private operation: string,
    private service: ErrorTrackingService
  ) {
    this.startTime = performance.now();
  }

  /**
   * Add a span to the transaction
   */
  startSpan(name: string): Span {
    return new Span(name, this);
  }

  /**
   * Finish the transaction
   */
  finish(): void {
    const duration = performance.now() - this.startTime;

    this.service.addBreadcrumb({
      type: 'default',
      category: 'performance',
      message: `Transaction: ${this.name}`,
      level: 'info',
      data: {
        operation: this.operation,
        duration,
        spans: this.spans,
      },
    });
  }

  /**
   * Add completed span
   */
  addSpan(name: string, duration: number): void {
    this.spans.push({ name, duration });
  }
}

/**
 * Performance Span
 */
export class Span {
  private startTime: number;

  constructor(
    private name: string,
    private transaction: Transaction
  ) {
    this.startTime = performance.now();
  }

  /**
   * Finish the span
   */
  finish(): void {
    const duration = performance.now() - this.startTime;
    this.transaction.addSpan(this.name, duration);
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();
