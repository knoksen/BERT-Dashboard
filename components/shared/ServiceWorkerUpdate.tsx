/**
 * Service Worker Update Notification
 *
 * Displays a toast notification when a new version of the app is available.
 * Allows users to reload the page to get the latest version.
 */

import { useState, useEffect } from 'react';

export function ServiceWorkerUpdate() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check for updates periodically
      setInterval(() => {
        reg.update();
      }, 60000); // Check every minute

      // Listen for waiting service worker
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setShowUpdate(true);
              setTimeout(() => setIsVisible(true), 50);
            }
          });
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[ServiceWorker] Update notification received:', event.data.version);
        setShowUpdate(true);
        setTimeout(() => setIsVisible(true), 50);
      }
    });

    // Check if there's already a waiting service worker
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setShowUpdate(true);
        setTimeout(() => setIsVisible(true), 50);
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Reload the page to activate new service worker
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setShowUpdate(false), 300);
  };

  if (!showUpdate) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400 rounded-xl shadow-2xl max-w-md">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">
                Update Available
              </h3>
              <p className="text-xs text-blue-100 mb-3">
                A new version of the app is ready. Reload to get the latest features and improvements.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Reload Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-white hover:text-blue-100 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-blue-200 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
              aria-label="Dismiss"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
