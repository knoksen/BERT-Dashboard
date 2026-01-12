/**
 * Theme Service
 *
 * Manages application themes with support for light, dark, auto, and custom themes.
 * Persists theme preference and provides system theme detection.
 */

export type ThemeMode = 'light' | 'dark' | 'auto' | 'custom';

export interface CustomTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
}

export interface ThemeConfig {
  defaultMode: ThemeMode;
  customThemes?: CustomTheme[];
}

class ThemeService {
  private currentMode: ThemeMode = 'dark';
  private currentTheme: CustomTheme | null = null;
  private systemTheme: 'light' | 'dark' = 'dark';
  private listeners: Array<(mode: ThemeMode, theme: CustomTheme | null) => void> = [];
  private mediaQuery: MediaQueryList | null = null;

  /**
   * Initialize theme service
   */
  initialize(config?: ThemeConfig): void {
    const defaultMode = config?.defaultMode || 'auto';

    // Load saved theme preference
    const savedMode = localStorage.getItem('theme_mode') as ThemeMode;
    const savedTheme = localStorage.getItem('theme_custom');

    if (savedTheme) {
      try {
        this.currentTheme = JSON.parse(savedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }

    // Set up system theme detection
    this.setupSystemThemeDetection();

    // Apply saved or default theme
    if (savedMode) {
      this.setTheme(savedMode);
    } else {
      this.setTheme(defaultMode);
    }

    console.info(`Theme initialized: ${this.currentMode}`);
  }

  /**
   * Get current theme mode
   */
  getMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Get current custom theme
   */
  getCustomTheme(): CustomTheme | null {
    return this.currentTheme;
  }

  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode, customTheme?: CustomTheme): void {
    this.currentMode = mode;

    if (mode === 'custom' && customTheme) {
      this.currentTheme = customTheme;
      localStorage.setItem('theme_custom', JSON.stringify(customTheme));
    }

    localStorage.setItem('theme_mode', mode);

    // Apply the theme
    this.applyTheme();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get effective theme (resolves 'auto' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentMode === 'auto') {
      return this.systemTheme;
    }
    if (this.currentMode === 'custom') {
      return 'dark'; // Custom themes use dark mode as base
    }
    return this.currentMode;
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (mode: ThemeMode, theme: CustomTheme | null) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Toggle between light and dark themes
   */
  toggle(): void {
    const effectiveTheme = this.getEffectiveTheme();
    this.setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-custom');

    if (this.currentMode === 'custom' && this.currentTheme) {
      // Apply custom theme
      root.classList.add('theme-custom');
      this.applyCustomTheme(this.currentTheme);
    } else {
      // Apply standard theme
      root.classList.add(`theme-${effectiveTheme}`);
      this.removeCustomTheme();
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'light' ? '#ffffff' : '#111827'
      );
    }
  }

  /**
   * Apply custom theme CSS variables
   */
  private applyCustomTheme(theme: CustomTheme): void {
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-info', theme.colors.info);
  }

  /**
   * Remove custom theme CSS variables
   */
  private removeCustomTheme(): void {
    const root = document.documentElement;
    const customProps = [
      '--color-primary',
      '--color-secondary',
      '--color-accent',
      '--color-background',
      '--color-surface',
      '--color-text',
      '--color-text-secondary',
      '--color-border',
      '--color-error',
      '--color-warning',
      '--color-success',
      '--color-info',
    ];

    customProps.forEach(prop => root.style.removeProperty(prop));
  }

  /**
   * Set up system theme detection
   */
  private setupSystemThemeDetection(): void {
    if (!window.matchMedia) return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemTheme = e.matches ? 'dark' : 'light';

      // Re-apply theme if in auto mode
      if (this.currentMode === 'auto') {
        this.applyTheme();
        this.notifyListeners();
      }
    });
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentMode, this.currentTheme);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }

  /**
   * Export current theme
   */
  exportTheme(): string {
    if (this.currentMode === 'custom' && this.currentTheme) {
      return JSON.stringify(this.currentTheme, null, 2);
    }
    return JSON.stringify({ mode: this.currentMode }, null, 2);
  }

  /**
   * Import theme from JSON
   */
  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as CustomTheme;

      // Validate theme structure
      if (!theme.name || !theme.colors) {
        throw new Error('Invalid theme structure');
      }

      this.setTheme('custom', theme);
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();

// Predefined custom themes
export const predefinedThemes: CustomTheme[] = [
  {
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#0c1222',
      surface: '#162033',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#334155',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6',
    },
  },
  {
    name: 'Forest Green',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#0a1810',
      surface: '#142822',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#166534',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
      info: '#3b82f6',
    },
  },
  {
    name: 'Purple Haze',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      background: '#1a0f25',
      surface: '#2a1a3a',
      text: '#faf5ff',
      textSecondary: '#d8b4fe',
      border: '#6b21a8',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6',
    },
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#1a0f0a',
      surface: '#2a1810',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      border: '#9a3412',
      error: '#dc2626',
      warning: '#fbbf24',
      success: '#10b981',
      info: '#3b82f6',
    },
  },
];
