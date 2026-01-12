/**
 * Tests for Theme Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { themeService, predefinedThemes } from '../../utils/theme';

describe('Theme Service', () => {
  beforeEach(() => {
    // Clear localStorage completely
    localStorage.clear();

    // Reset theme service internal state by clearing saved themes
    localStorage.removeItem('theme_mode');
    localStorage.removeItem('theme_custom');

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock console
    vi.spyOn(console, 'info').mockImplementation(() => {});

    // Reset document classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default theme', () => {
    themeService.initialize({ defaultMode: 'dark' });

    expect(themeService.getMode()).toBe('dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });

  it('initializes with auto theme', () => {
    themeService.initialize({ defaultMode: 'auto' });

    expect(themeService.getMode()).toBe('auto');
    expect(themeService.getEffectiveTheme()).toBe('dark'); // From matchMedia mock
  });

  it('sets light theme', () => {
    themeService.initialize();
    themeService.setTheme('light');

    expect(themeService.getMode()).toBe('light');
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(localStorage.getItem('theme_mode')).toBe('light');
  });

  it('sets dark theme', () => {
    themeService.initialize();
    themeService.setTheme('dark');

    expect(themeService.getMode()).toBe('dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(localStorage.getItem('theme_mode')).toBe('dark');
  });

  it('sets custom theme', () => {
    themeService.initialize();
    const customTheme = predefinedThemes[0];

    themeService.setTheme('custom', customTheme);

    expect(themeService.getMode()).toBe('custom');
    expect(themeService.getCustomTheme()).toEqual(customTheme);
    expect(document.documentElement.classList.contains('theme-custom')).toBe(true);
  });

  it('applies custom theme CSS variables', () => {
    themeService.initialize();
    const customTheme = predefinedThemes[0];

    themeService.setTheme('custom', customTheme);

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary')).toBe(customTheme.colors.primary);
    expect(root.style.getPropertyValue('--color-secondary')).toBe(customTheme.colors.secondary);
  });

  it('persists theme preference', () => {
    themeService.initialize();
    themeService.setTheme('light');

    expect(localStorage.getItem('theme_mode')).toBe('light');
  });

  it('loads saved theme preference', () => {
    localStorage.setItem('theme_mode', 'light');

    themeService.initialize();

    expect(themeService.getMode()).toBe('light');
  });

  it('loads saved custom theme', () => {
    const customTheme = predefinedThemes[1];
    localStorage.setItem('theme_mode', 'custom');
    localStorage.setItem('theme_custom', JSON.stringify(customTheme));

    themeService.initialize();

    expect(themeService.getMode()).toBe('custom');
    expect(themeService.getCustomTheme()?.name).toBe(customTheme.name);
  });

  it('toggles between light and dark', () => {
    themeService.initialize({ defaultMode: 'light' });
    expect(themeService.getEffectiveTheme()).toBe('light');

    themeService.toggle();
    expect(themeService.getMode()).toBe('dark');
    expect(themeService.getEffectiveTheme()).toBe('dark');

    themeService.toggle();
    expect(themeService.getMode()).toBe('light');
  });

  it('subscribes to theme changes', () => {
    localStorage.clear();
    themeService.initialize({ defaultMode: 'dark' });

    const callback = vi.fn();
    const unsubscribe = themeService.subscribe(callback);

    themeService.setTheme('light');
    expect(callback).toHaveBeenCalledWith('light', expect.any(Object));

    unsubscribe();
    themeService.setTheme('dark');
    expect(callback).toHaveBeenCalledTimes(1); // Not called after unsubscribe
  });

  it('exports theme', () => {
    themeService.initialize();
    themeService.setTheme('dark');

    const exported = themeService.exportTheme();
    const parsed = JSON.parse(exported);

    expect(parsed.mode).toBe('dark');
  });

  it('exports custom theme', () => {
    themeService.initialize();
    const customTheme = predefinedThemes[0];
    themeService.setTheme('custom', customTheme);

    const exported = themeService.exportTheme();
    const parsed = JSON.parse(exported);

    expect(parsed.name).toBe(customTheme.name);
    expect(parsed.colors).toEqual(customTheme.colors);
  });

  it('imports custom theme', () => {
    themeService.initialize();
    const customTheme = predefinedThemes[2];
    const themeJson = JSON.stringify(customTheme);

    const result = themeService.importTheme(themeJson);

    expect(result).toBe(true);
    expect(themeService.getMode()).toBe('custom');
    expect(themeService.getCustomTheme()?.name).toBe(customTheme.name);
  });

  it('handles invalid theme import', () => {
    themeService.initialize();

    const errorSpy = vi.spyOn(console, 'error');
    const result = themeService.importTheme('invalid json');

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('updates meta theme-color', () => {
    // Add meta tag
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#000000';
    document.head.appendChild(meta);

    themeService.initialize({ defaultMode: 'light' });

    expect(meta.content).toBe('#ffffff');

    themeService.setTheme('dark');
    expect(meta.content).toBe('#111827');

    // Cleanup
    document.head.removeChild(meta);
  });

  it('resolves auto theme based on system preference', () => {
    themeService.initialize({ defaultMode: 'auto' });

    expect(themeService.getMode()).toBe('auto');
    expect(themeService.getEffectiveTheme()).toBe('dark'); // From matchMedia mock
  });

  it('has predefined themes', () => {
    expect(predefinedThemes.length).toBeGreaterThan(0);

    predefinedThemes.forEach(theme => {
      expect(theme.name).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.background).toBeDefined();
    });
  });
});
