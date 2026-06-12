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
export const APP_VERSION = '2026.06.12.005';

/**
 * Get the current app version for display or logging
 */
export function getAppVersion(): string {
  return APP_VERSION;
}

function versionParts(version: string | null): number[] {
  if (!version) return [];
  return version.match(/\d+/g)?.map(Number) ?? [];
}

export function compareAppVersions(a: string | null, b: string | null): number {
  const left = versionParts(a);
  const right = versionParts(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

/**
 * Check if the current version is outdated
 * Can be used for emergency cache-busting scenarios
 */
export function isVersionOutdated(cachedVersion: string | null): boolean {
  if (!cachedVersion) return true;
  return compareAppVersions(cachedVersion, APP_VERSION) < 0;
}

export function isCurrentBundleStale(cachedVersion: string | null): boolean {
  if (!cachedVersion) return false;
  return compareAppVersions(cachedVersion, APP_VERSION) > 0;
}
