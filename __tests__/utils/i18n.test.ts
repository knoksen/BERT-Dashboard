/**
 * Tests for i18n Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18n } from '../../utils/i18n';

describe('i18n Service', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });

    // Mock console
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default language', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr'],
      translations: {
        en: {
          hello: 'Hello',
          greeting: 'Hello, {{name}}!',
        },
      },
    });

    expect(i18n.getLanguage()).toBe('en');
  });

  it('detects browser language', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'es-ES',
    });

    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr'],
      translations: {},
    });

    expect(i18n.getLanguage()).toBe('es');
  });

  it('translates simple keys', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {
        en: {
          hello: 'Hello',
          world: 'World',
        },
      },
    });

    expect(i18n.t('hello')).toBe('Hello');
    expect(i18n.t('world')).toBe('World');
  });

  it('translates nested keys', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {
        en: {
          common: {
            save: 'Save',
            cancel: 'Cancel',
          },
        },
      },
    });

    expect(i18n.t('common.save')).toBe('Save');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('interpolates parameters', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {
        en: {
          greeting: 'Hello, {{name}}!',
          message: 'You have {{count}} messages',
        },
      },
    });

    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!');
    expect(i18n.t('message', { count: 5 })).toBe('You have 5 messages');
  });

  it('falls back to fallback language', () => {
    i18n.initialize({
      defaultLanguage: 'es',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      translations: {
        en: {
          hello: 'Hello',
        },
        es: {
          // Missing translation
        },
      },
    });

    i18n.setLanguage('es');
    expect(i18n.t('hello')).toBe('Hello'); // Falls back to English
  });

  it('returns key when translation missing', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {
        en: {},
      },
    });

    expect(i18n.t('missing.key')).toBe('missing.key');
    expect(console.warn).toHaveBeenCalledWith('Translation missing for key: missing.key');
  });

  it('changes language', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      translations: {
        en: { hello: 'Hello' },
        es: { hello: 'Hola' },
      },
    });

    expect(i18n.t('hello')).toBe('Hello');

    i18n.setLanguage('es');
    expect(i18n.getLanguage()).toBe('es');
    expect(i18n.t('hello')).toBe('Hola');
  });

  it('persists language preference', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      translations: {},
    });

    i18n.setLanguage('es');
    expect(localStorage.getItem('app_language')).toBe('es');
  });

  it('loads saved language preference', () => {
    localStorage.setItem('app_language', 'fr');

    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr'],
      translations: {},
    });

    expect(i18n.getLanguage()).toBe('fr');
  });

  it('subscribes to language changes', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      translations: {},
    });

    const callback = vi.fn();
    const unsubscribe = i18n.subscribe(callback);

    i18n.setLanguage('es');
    expect(callback).toHaveBeenCalledWith('es');

    unsubscribe();
    i18n.setLanguage('en');
    expect(callback).toHaveBeenCalledTimes(1); // Not called again after unsubscribe
  });

  it('gets supported languages', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      translations: {},
    });

    expect(i18n.getSupportedLanguages()).toEqual(['en', 'es', 'fr', 'de']);
  });

  it('gets language name in native script', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'ja', 'zh'],
      translations: {},
    });

    expect(i18n.getLanguageName('en')).toBe('English');
    expect(i18n.getLanguageName('es')).toBe('Español');
    expect(i18n.getLanguageName('ja')).toBe('日本語');
    expect(i18n.getLanguageName('zh')).toBe('中文');
  });

  it('formats numbers according to locale', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'de'],
      translations: {},
    });

    expect(i18n.formatNumber(1234.56)).toBe('1,234.56');

    i18n.setLanguage('de');
    expect(i18n.formatNumber(1234.56)).toBe('1.234,56');
  });

  it('formats dates according to locale', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {},
    });

    const date = new Date('2024-01-15T12:00:00Z');
    const formatted = i18n.formatDate(date, { dateStyle: 'short' });

    // Accept both full year and 2-digit year formats
    expect(formatted).toMatch(/1\/15\/(2024|24)|15\/1\/(2024|24)/);
  });

  it('formats relative time', () => {
    i18n.initialize({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en'],
      translations: {},
    });

    expect(i18n.formatRelativeTime(-1, 'day')).toBe('yesterday');
    expect(i18n.formatRelativeTime(1, 'day')).toBe('tomorrow');
    expect(i18n.formatRelativeTime(-2, 'hour')).toBe('2 hours ago');
  });
});
