/**
 * Internationalization (i18n) Service
 *
 * Lightweight i18n implementation for multi-language support.
 * Supports language switching, translation loading, and interpolation.
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'pt' | 'ru' | 'it';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  supportedLanguages: Language[];
  translations: Partial<Record<Language, TranslationDictionary>>;
}

class I18nService {
  private config: I18nConfig | null = null;
  private currentLanguage: Language = 'en';
  private listeners: Array<(language: Language) => void> = [];

  /**
   * Initialize i18n service
   */
  initialize(config: I18nConfig): void {
    this.config = config;

    // Try to detect user's preferred language
    const storedLanguage = localStorage.getItem('app_language') as Language;
    const browserLanguage = this.detectBrowserLanguage();

    const preferredLanguage = storedLanguage || browserLanguage || config.defaultLanguage;

    // Set language if supported
    if (config.supportedLanguages.includes(preferredLanguage)) {
      this.currentLanguage = preferredLanguage;
    } else {
      this.currentLanguage = config.defaultLanguage;
    }

    console.info(`i18n initialized with language: ${this.currentLanguage}`);
  }

  /**
   * Get translation for a key
   */
  t(key: string, params?: Record<string, string | number>): string {
    if (!this.config) {
      console.warn('i18n not initialized');
      return key;
    }

    const translation = this.getTranslation(key, this.currentLanguage);

    if (!translation) {
      // Try fallback language
      const fallbackTranslation = this.getTranslation(key, this.config.fallbackLanguage);
      if (fallbackTranslation) {
        return this.interpolate(fallbackTranslation, params);
      }

      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    if (!this.config) {
      console.warn('i18n not initialized');
      return;
    }

    if (!this.config.supportedLanguages.includes(language)) {
      console.warn(`Language not supported: ${language}`);
      return;
    }

    this.currentLanguage = language;
    localStorage.setItem('app_language', language);

    // Notify listeners
    this.notifyListeners(language);

    // Update document language
    document.documentElement.lang = language;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return this.config?.supportedLanguages || ['en'];
  }

  /**
   * Subscribe to language changes
   */
  subscribe(callback: (language: Language) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Load translations dynamically
   */
  async loadTranslations(language: Language): Promise<void> {
    if (!this.config) {
      console.warn('i18n not initialized');
      return;
    }

    try {
      const response = await fetch(`/locales/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}`);
      }

      const translations = await response.json();

      if (!this.config.translations) {
        this.config.translations = {};
      }

      this.config.translations[language] = translations;

      console.info(`Loaded translations for ${language}`);
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
    }
  }

  /**
   * Get translation from dictionary
   */
  private getTranslation(key: string, language: Language): string | undefined {
    if (!this.config?.translations?.[language]) {
      return undefined;
    }

    const keys = key.split('.');
    let current: string | TranslationDictionary | undefined = this.config.translations[language];

    for (const k of keys) {
      if (typeof current === 'object' && current !== null) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Interpolate variables in translation
   */
  private interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * Detect browser language
   */
  private detectBrowserLanguage(): Language | null {
    const browserLang = navigator.language.split('-')[0] as Language;
    return this.config?.supportedLanguages.includes(browserLang) ? browserLang : null;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(language: Language): void {
    this.listeners.forEach(callback => {
      try {
        callback(language);
      } catch (error) {
        console.error('Error in i18n listener:', error);
      }
    });
  }

  /**
   * Get language name in native script
   */
  getLanguageName(language: Language): string {
    const names: Record<Language, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      ja: '日本語',
      zh: '中文',
      ar: 'العربية',
      pt: 'Português',
      ru: 'Русский',
      it: 'Italiano',
    };

    return names[language] || language;
  }

  /**
   * Format number according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(value);
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  /**
   * Format relative time
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    return rtf.format(value, unit);
  }
}

// Export singleton instance
export const i18n = new I18nService();
