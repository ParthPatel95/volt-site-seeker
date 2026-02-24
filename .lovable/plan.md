

# Offline-Resilient Image Uploads for Inventory

## Problem
When you're at a job site with poor cell signal, inventory image uploads fail silently because the current implementation makes a single upload attempt with no retry, no offline queuing, and no image compression to reduce payload size.

## Solution: Three-Layer Resilience

### Layer 1: Image Compression Before Upload
Compress photos client-side before uploading. Camera captures are typically 2-5 MB at full resolution. Compressing to 80% quality and capping dimensions at 1280px reduces most images to 100-300 KB -- dramatically improving success on slow connections.

### Layer 2: Automatic Retry with Exponential Backoff
When an upload fails, automatically retry up to 3 times with increasing delays (1s, 3s, 7s). This handles the common case of brief signal drops without user intervention.

### Layer 3: Offline Queue with IndexedDB
When all retries fail (no signal at all), save the image locally in the browser's IndexedDB storage along with the item metadata. When connectivity returns, a background sync process automatically uploads the queued images. A small badge on the inventory UI shows how many uploads are pending.

## What You'll See

- **During upload**: A progress indicator showing compression and upload stages
- **On retry**: A toast saying "Poor connection, retrying upload... (attempt 2/3)"
- **When offline**: A toast saying "Image saved locally -- will upload when back online" with a green checkmark so you can keep working
- **Pending queue badge**: A small indicator showing "2 pending uploads" when queued images exist
- **Auto-sync**: When you regain signal, pending images upload automatically in the background with a success notification

## Technical Details

### Files to Create

1. **`src/utils/imageCompression.ts`**
   - `compressImage(blob, maxWidth=1280, quality=0.8)` -- uses canvas API to resize and compress JPEG
   - Targets sub-300KB output for typical inventory photos

2. **`src/utils/offlineUploadQueue.ts`**
   - IndexedDB-backed queue using simple `idb-keyval`-style wrapper (no new dependency -- raw IndexedDB API)
   - `queueUpload(imageBlob, metadata)` -- stores image + metadata locally
   - `getPendingUploads()` -- returns count and list
   - `processQueue()` -- attempts to upload all pending items
   - `clearCompleted()` -- removes successful uploads from queue

3. **`src/components/inventory/components/OfflineUploadIndicator.tsx`**
   - Small badge component showing pending upload count
   - Listens for `online` browser event to trigger auto-sync
   - Shows progress when syncing

### Files to Modify

4. **`src/components/inventory/hooks/useImageUpload.ts`**
   - Add image compression step before upload
   - Add retry logic with exponential backoff (3 attempts)
   - On final failure, queue to IndexedDB instead of showing error
   - Add `pendingCount` to returned state
   - Add `navigator.onLine` check to skip upload attempt and queue immediately when offline

5. **`src/components/inventory/components/InventoryCameraCapture.tsx`**
   - Update upload feedback to show compression/retry/queued states
   - Change "Uploading..." to show current stage

6. **`src/components/inventory/components/InventorySmartCapture.tsx`**
   - Same upload feedback improvements as CameraCapture

7. **`src/components/inventory/InventoryPage.tsx`** (or equivalent shell)
   - Add `OfflineUploadIndicator` component to show pending upload badge

### Core Logic (useImageUpload changes)

```text
uploadImage(file):
  1. Compress image (canvas resize + JPEG quality reduction)
  2. Check navigator.onLine
     - If offline -> queue to IndexedDB, return placeholder, show toast
  3. Attempt upload with retry:
     - Try 1: immediate
     - Try 2: wait 1s
     - Try 3: wait 3s
  4. If all retries fail -> queue to IndexedDB, return placeholder
  5. On success -> return URL as normal
```

### Auto-Sync Logic

```text
- Listen for browser 'online' event
- On reconnect: call processQueue()
- For each queued item:
  - Attempt upload to Supabase storage
  - On success: update the inventory item's image_url in the database
  - Remove from IndexedDB queue
- Show toast: "X photos synced successfully"
```

### No New Dependencies
All functionality uses built-in browser APIs:
- Canvas API for image compression
- IndexedDB for offline storage
- `navigator.onLine` and `online`/`offline` events for connectivity detection

