/**
 * React Hook for Theme Management
 *
 * Provides theme state and controls in React components.
 */

import { useEffect, useState } from 'react';
import { themeService, ThemeMode, CustomTheme } from '../../utils/theme';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(themeService.getMode());
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(
    themeService.getCustomTheme()
  );
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    themeService.getEffectiveTheme()
  );

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeService.subscribe((newMode, newTheme) => {
      setMode(newMode);
      setCustomTheme(newTheme);
      setEffectiveTheme(themeService.getEffectiveTheme());
    });

    return unsubscribe;
  }, []);

  return {
    mode,
    customTheme,
    effectiveTheme,
    setTheme: themeService.setTheme.bind(themeService),
    toggle: themeService.toggle.bind(themeService),
    exportTheme: themeService.exportTheme.bind(themeService),
    importTheme: themeService.importTheme.bind(themeService),
  };
}
