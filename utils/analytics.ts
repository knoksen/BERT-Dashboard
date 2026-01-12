/**
 * Analytics Service
 *
 * Privacy-focused analytics tracking for user interactions and performance.
 * Supports Google Analytics 4, custom events, and user privacy controls.
 */

export interface AnalyticsConfig {
  measurementId: string;
  enableDebug?: boolean;
  respectDNT?: boolean; // Respect Do Not Track
  anonymizeIP?: boolean;
}

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
  value?: number;
}

export interface PageViewParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

class AnalyticsService {
  private config: AnalyticsConfig | null = null;
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private userConsent = false;

  /**
   * Initialize analytics with configuration
   */
  initialize(config: AnalyticsConfig): void {
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    // Check Do Not Track
    if (config.respectDNT && this.isDoNotTrackEnabled()) {
      console.info('Analytics disabled: DNT is enabled');
      return;
    }

    this.config = config;

    // Check for stored consent
    const storedConsent = localStorage.getItem('analytics_consent');
    if (storedConsent === 'true') {
      this.userConsent = true;
      this.loadGoogleAnalytics();
    }
  }

  /**
   * Set user consent for analytics
   */
  setConsent(consent: boolean): void {
    this.userConsent = consent;
    localStorage.setItem('analytics_consent', consent.toString());

    if (consent && this.config && !this.initialized) {
      this.loadGoogleAnalytics();
    } else if (!consent && this.initialized) {
      this.disableAnalytics();
    }
  }

  /**
   * Get current consent status
   */
  getConsent(): boolean {
    return this.userConsent;
  }

  /**
   * Track page view
   */
  trackPageView(params?: PageViewParams): void {
    if (!this.canTrack()) return;

    const event: AnalyticsEvent = {
      name: 'page_view',
      params: {
        page_title: params?.page_title || document.title,
        page_location: params?.page_location || window.location.href,
        page_path: params?.page_path || window.location.pathname,
      },
    };

    this.trackEvent(event);
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.canTrack()) {
      if (this.config?.enableDebug) {
        console.log('[Analytics] Event queued:', event);
      }
      this.queue.push(event);
      return;
    }

    if (this.config?.enableDebug) {
      console.log('[Analytics] Tracking event:', event);
    }

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.name, event.params);
    }
  }

  /**
   * Track user interaction
   */
  trackInteraction(category: string, action: string, label?: string, value?: number): void {
    this.trackEvent({
      name: 'user_interaction',
      params: {
        event_category: category,
        event_action: action,
        event_label: label || '',
        value: value || 0,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, fatal = false): void {
    this.trackEvent({
      name: 'exception',
      params: {
        description: error.message,
        fatal: fatal,
        stack: error.stack || '',
      },
    });
  }

  /**
   * Track timing (performance)
   */
  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent({
      name: 'timing_complete',
      params: {
        name: variable,
        value: time,
        event_category: category,
        event_label: label || '',
      },
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, string | number | boolean>): void {
    if (!this.canTrack()) return;

    if (typeof window.gtag !== 'undefined') {
      window.gtag('set', 'user_properties', properties);
    }
  }

  /**
   * Check if tracking is allowed
   */
  private canTrack(): boolean {
    return this.initialized && this.userConsent && this.config !== null;
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDoNotTrackEnabled(): boolean {
    return (
      navigator.doNotTrack === '1' ||
      (window as Window & { doNotTrack?: string }).doNotTrack === '1'
    );
  }

  /**
   * Load Google Analytics script
   */
  private loadGoogleAnalytics(): void {
    if (!this.config) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.config.measurementId, {
      anonymize_ip: this.config.anonymizeIP !== false,
      send_page_view: false, // We'll track page views manually
    });

    this.initialized = true;

    // Process queued events
    if (this.queue.length > 0) {
      if (this.config.enableDebug) {
        console.log(`[Analytics] Processing ${this.queue.length} queued events`);
      }
      this.queue.forEach((event) => this.trackEvent(event));
      this.queue = [];
    }
  }

  /**
   * Disable analytics and clear data
   */
  private disableAnalytics(): void {
    if (!this.config) return;

    // Set opt-out flag
    const disableStr = `ga-disable-${this.config.measurementId}`;
    (window as Window & Record<string, boolean>)[disableStr] = true;

    this.initialized = false;
    this.queue = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Type augmentation for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
