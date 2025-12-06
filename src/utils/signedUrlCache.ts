/**
 * Client-side cache for signed URLs to avoid redundant edge function calls
 * URLs are cached with their expiration time and automatically invalidated when expired
 */

interface CachedUrl {
  url: string;
  expiresAt: number; // Unix timestamp
  storagePath: string;
}

// In-memory cache for signed URLs (primary)
const urlCache = new Map<string, CachedUrl>();

// Buffer time before expiry to refresh URLs (5 minutes)
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

// Track cache statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generate a cache key from storage path and video flag
 */
export const getCacheKey = (storagePath: string, isVideo: boolean = false): string => {
  return `${storagePath}:${isVideo ? 'video' : 'default'}`;
};

/**
 * Try to persist cache to localStorage (best effort, non-blocking)
 */
const persistToStorage = (): void => {
  try {
    const cacheData = Array.from(urlCache.entries());
    localStorage.setItem('signedUrlCache', JSON.stringify(cacheData));
  } catch (e) {
    // Quota exceeded or storage unavailable - silently ignore
    console.debug('[SignedUrlCache] localStorage persist failed (non-critical):', e);
  }
};

/**
 * Restore cache from localStorage on module load
 */
const restoreFromStorage = (): void => {
  try {
    const stored = localStorage.getItem('signedUrlCache');
    if (stored) {
      const entries: [string, CachedUrl][] = JSON.parse(stored);
      const now = Date.now();
      
      // Only restore non-expired entries
      for (const [key, value] of entries) {
        if (value.expiresAt - EXPIRY_BUFFER_MS > now) {
          urlCache.set(key, value);
        }
      }
      console.log(`[SignedUrlCache] Restored ${urlCache.size} URLs from localStorage`);
    }
  } catch (e) {
    // Failed to restore - start fresh
    console.debug('[SignedUrlCache] localStorage restore failed (non-critical):', e);
  }
};

// Attempt to restore cache on module load
restoreFromStorage();

/**
 * Get a cached URL if it exists and hasn't expired
 */
export const getCachedUrl = (storagePath: string, isVideo: boolean = false): string | null => {
  const key = getCacheKey(storagePath, isVideo);
  const cached = urlCache.get(key);
  
  if (!cached) {
    cacheMisses++;
    return null;
  }
  
  // Check if URL is still valid (with buffer time)
  const now = Date.now();
  if (cached.expiresAt - EXPIRY_BUFFER_MS <= now) {
    // URL is expired or about to expire, remove from cache
    urlCache.delete(key);
    cacheMisses++;
    return null;
  }
  
  cacheHits++;
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
  try {
    const key = getCacheKey(storagePath, isVideo);
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    
    urlCache.set(key, {
      url,
      expiresAt,
      storagePath
    });
    
    // Persist to localStorage (best effort)
    persistToStorage();
  } catch (e) {
    // If caching fails, continue without caching
    console.warn('[SignedUrlCache] Failed to cache URL:', e);
  }
};

/**
 * Cache multiple URLs at once (for batch responses)
 */
export const cacheUrls = (
  urls: Array<{ storagePath: string; url: string; expiresIn: number; isVideo?: boolean }>
): void => {
  try {
    for (const item of urls) {
      const key = getCacheKey(item.storagePath, item.isVideo);
      const expiresAt = Date.now() + (item.expiresIn * 1000);
      
      urlCache.set(key, {
        url: item.url,
        expiresAt,
        storagePath: item.storagePath
      });
    }
    
    // Persist to localStorage (best effort)
    persistToStorage();
  } catch (e) {
    console.warn('[SignedUrlCache] Failed to cache batch URLs:', e);
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
  cacheHits = 0;
  cacheMisses = 0;
  
  try {
    localStorage.removeItem('signedUrlCache');
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = (): { 
  size: number; 
  paths: string[]; 
  hits: number; 
  misses: number; 
  hitRate: string;
} => {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? ((cacheHits / total) * 100).toFixed(1) + '%' : 'N/A';
  
  return {
    size: urlCache.size,
    paths: Array.from(urlCache.keys()),
    hits: cacheHits,
    misses: cacheMisses,
    hitRate
  };
};
