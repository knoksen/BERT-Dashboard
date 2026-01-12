/**
 * React Hook for i18n
 *
 * Provides translation functions and language management in React components.
 */

import { useEffect, useState } from 'react';
import { i18n, Language } from '../../utils/i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = i18n.subscribe((newLanguage) => {
      setLanguage(newLanguage);
    });

    return unsubscribe;
  }, []);

  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    supportedLanguages: i18n.getSupportedLanguages(),
    getLanguageName: i18n.getLanguageName.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
  };
}
