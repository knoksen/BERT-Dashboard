/**
 * Theme Selector Component
 *
 * Provides UI for selecting and customizing application themes.
 * Supports light, dark, auto, and custom themes with presets.
 */

import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { predefinedThemes, ThemeMode } from '../../utils/theme';

export function ThemeSelector() {
  const { mode, setTheme, effectiveTheme } = useTheme();
  const [showPresets, setShowPresets] = useState(false);

  const handleModeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
    if (newMode !== 'custom') {
      setShowPresets(false);
    }
  };

  const handlePresetSelect = (preset: typeof predefinedThemes[0]) => {
    setTheme('custom', preset);
    setShowPresets(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Theme Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleModeChange('light')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              mode === 'light'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-sm font-medium">Light</span>
          </button>

          <button
            onClick={() => handleModeChange('dark')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              mode === 'dark'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <span className="text-sm font-medium">Dark</span>
          </button>

          <button
            onClick={() => handleModeChange('auto')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              mode === 'auto'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="text-sm font-medium">Auto</span>
            <span className="text-xs opacity-60">({effectiveTheme})</span>
          </button>

          <button
            onClick={() => {
              if (mode !== 'custom') {
                setShowPresets(true);
              } else {
                setShowPresets(!showPresets);
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              mode === 'custom'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span className="text-sm font-medium">Custom</span>
          </button>
        </div>
      </div>

      {showPresets && (
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose a Preset
          </label>
          <div className="grid grid-cols-1 gap-2">
            {predefinedThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 group"
              >
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-gray-600 group-hover:ring-gray-500"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-gray-600 group-hover:ring-gray-500"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-gray-600 group-hover:ring-gray-500"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
                <span className="text-sm font-medium text-white flex-1 text-left">
                  {preset.name}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          💡 Theme preference is saved automatically and syncs across tabs
        </p>
      </div>
    </div>
  );
}
