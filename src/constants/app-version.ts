/**
 * Application Version Tracking
 * 
 * This version string is used to:
 * 1. Detect stale cached sessions
 * 2. Enable emergency cache-busting if needed
 * 3. Track deployments for debugging
 * 
 * The version is based on the deployment timestamp.
 * It will be updated with each new build.
 */
export const APP_VERSION = '2026.02.11.001';

/**
 * Get the current app version for display or logging
 */
export function getAppVersion(): string {
  return APP_VERSION;
}

/**
 * Check if the current version is outdated
 * Can be used for emergency cache-busting scenarios
 */
export function isVersionOutdated(cachedVersion: string | null): boolean {
  if (!cachedVersion) return true;
  return cachedVersion !== APP_VERSION;
}
