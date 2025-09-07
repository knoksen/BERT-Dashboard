

// Add your instrumentation key or use the APPLICATIONINSIGHTSKEY environment variable on your production machine to start collecting data.
var ai = require('applicationinsights');
ai.setup(process.env.APPLICATIONINSIGHTSKEY || 'your_instrumentation_key').start();import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Registration was successful
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Handle splash screen fade-out
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        // Start the fade-out
        splashScreen.classList.add('fade-out');

        // Remove the element from the DOM after the transition is complete
        setTimeout(() => {
            splashScreen.remove();
        }, 500); // This duration should match the CSS transition duration
    }
});