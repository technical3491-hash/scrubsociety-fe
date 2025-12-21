// Environment configuration

/**
 * Normalize API URL to ensure it has a protocol
 * If the URL doesn't start with http:// or https://, add https://
 */
function normalizeApiUrl(url: string | undefined): string {
  if (!url) {
    return 'http://localhost:3000';
  }
  
  // If URL already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, add https:// protocol
  return `https://${url}`;
}

export const env = {
  apiUrl: normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

