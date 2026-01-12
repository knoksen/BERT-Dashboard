/**
 * Analytics Consent Banner
 *
 * Displays a privacy-compliant consent banner for analytics tracking.
 * Allows users to accept or decline analytics tracking.
 */

import { useState, useEffect } from 'react';
import { analytics } from '../../utils/analytics';

export function AnalyticsConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 50);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    analytics.setConsent(true);
    closeBanner();
  };

  const handleDecline = () => {
    analytics.setConsent(false);
    closeBanner();
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <div className="bg-gray-900 border-t-2 border-blue-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3
                id="consent-title"
                className="text-sm font-semibold text-white mb-1"
              >
                🍪 Privacy & Analytics
              </h3>
              <p
                id="consent-description"
                className="text-xs text-gray-300 leading-relaxed"
              >
                We use analytics to improve your experience. Your data is anonymized
                and we respect Do Not Track. You can change this anytime in settings.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
