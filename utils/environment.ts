/**
 * Environment validation and configuration utilities
 */

export interface EnvironmentConfig {
  apiKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: string;
}

/**
 * Validates required environment variables
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    errors.push('Missing GEMINI_API_KEY environment variable');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the current environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    nodeEnv,
  };
}

/**
 * Checks if all required features are supported
 */
export function checkBrowserSupport(): { supported: boolean; missingFeatures: string[] } {
  const missingFeatures: string[] = [];

  // Check for required APIs
  if (!('localStorage' in window)) {
    missingFeatures.push('localStorage');
  }

  if (!('fetch' in window)) {
    missingFeatures.push('fetch');
  }

  if (!('Promise' in window)) {
    missingFeatures.push('Promise');
  }

  if (!('serviceWorker' in navigator)) {
    missingFeatures.push('Service Worker');
  }

  return {
    supported: missingFeatures.length === 0,
    missingFeatures,
  };
}

/**
 * Logs environment information
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  const browserSupport = checkBrowserSupport();
  const validation = validateEnvironment();

  console.group('🌍 Environment Info');
  console.log('Node Environment:', config.nodeEnv);
  console.log('Is Development:', config.isDevelopment);
  console.log('Is Production:', config.isProduction);
  console.log('API Key Present:', !!config.apiKey);
  console.log('Browser Support:', browserSupport.supported ? '✅ Full' : '⚠️ Partial');
  
  if (browserSupport.missingFeatures.length > 0) {
    console.warn('Missing Features:', browserSupport.missingFeatures);
  }
  
  if (!validation.valid) {
    console.error('Validation Errors:', validation.errors);
  }
  
  console.groupEnd();
}

/**
 * Shows a user-friendly error message for unsupported browsers
 */
export function showBrowserNotSupportedMessage(): void {
  const browserSupport = checkBrowserSupport();
  
  if (!browserSupport.supported) {
    const message = `Your browser is missing required features: ${browserSupport.missingFeatures.join(', ')}. Please use a modern browser like Chrome, Firefox, Safari, or Edge.`;
    
    // Create a simple error message element
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #111827;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      z-index: 99999;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    errorDiv.innerHTML = `
      <h1 style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem;">Browser Not Supported</h1>
      <p style="max-width: 600px; line-height: 1.6; color: #9ca3af;">${message}</p>
    `;
    
    document.body.appendChild(errorDiv);
  }
}

/**
 * Initializes environment checks
 */
export function initializeEnvironment(): void {
  if (process.env.NODE_ENV === 'development') {
    logEnvironmentInfo();
  }
  
  const browserSupport = checkBrowserSupport();
  if (!browserSupport.supported) {
    showBrowserNotSupportedMessage();
  }
}
