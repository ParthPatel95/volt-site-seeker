/**
 * Client-side cache for signed URLs to avoid redundant edge function calls
 * URLs are cached with their expiration time and automatically invalidated when expired
 */

interface CachedUrl {
  url: string;
  expiresAt: number; // Unix timestamp
  storagePath: string;
}

// In-memory cache for signed URLs
const urlCache = new Map<string, CachedUrl>();

// Buffer time before expiry to refresh URLs (5 minutes)
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Generate a cache key from storage path and video flag
 */
export const getCacheKey = (storagePath: string, isVideo: boolean = false): string => {
  return `${storagePath}:${isVideo ? 'video' : 'default'}`;
};

/**
 * Get a cached URL if it exists and hasn't expired
 */
export const getCachedUrl = (storagePath: string, isVideo: boolean = false): string | null => {
  const key = getCacheKey(storagePath, isVideo);
  const cached = urlCache.get(key);
  
  if (!cached) return null;
  
  // Check if URL is still valid (with buffer time)
  const now = Date.now();
  if (cached.expiresAt - EXPIRY_BUFFER_MS <= now) {
    // URL is expired or about to expire, remove from cache
    urlCache.delete(key);
    return null;
  }
  
  return cached.url;
};

/**
 * Cache a signed URL with its expiration time
 */
export const cacheUrl = (
  storagePath: string, 
  url: string, 
  expiresInSeconds: number,
  isVideo: boolean = false
): void => {
  const key = getCacheKey(storagePath, isVideo);
  const expiresAt = Date.now() + (expiresInSeconds * 1000);
  
  urlCache.set(key, {
    url,
    expiresAt,
    storagePath
  });
};

/**
 * Cache multiple URLs at once (for batch responses)
 */
export const cacheUrls = (
  urls: Array<{ storagePath: string; url: string; expiresIn: number; isVideo?: boolean }>
): void => {
  for (const item of urls) {
    cacheUrl(item.storagePath, item.url, item.expiresIn, item.isVideo);
  }
};

/**
 * Get multiple cached URLs, returns map of storagePath -> url for hits
 * and list of paths that need to be fetched
 */
export const getCachedUrls = (
  paths: Array<{ storagePath: string; isVideo?: boolean }>
): { cached: Map<string, string>; uncached: Array<{ storagePath: string; isVideo?: boolean }> } => {
  const cached = new Map<string, string>();
  const uncached: Array<{ storagePath: string; isVideo?: boolean }> = [];
  
  for (const item of paths) {
    const url = getCachedUrl(item.storagePath, item.isVideo);
    if (url) {
      cached.set(item.storagePath, url);
    } else {
      uncached.push(item);
    }
  }
  
  return { cached, uncached };
};

/**
 * Clear all cached URLs
 */
export const clearUrlCache = (): void => {
  urlCache.clear();
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = (): { size: number; paths: string[] } => {
  return {
    size: urlCache.size,
    paths: Array.from(urlCache.keys())
  };
};
