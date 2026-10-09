import { Advertisement } from '../types';

const DB_NAME = 'dailywork_app_db';
const DB_VERSION = 2;
const ADS_STORE = 'advertisements';
const LOCAL_STORAGE_KEY = 'daily_work_ads_v1';

/**
 * Open or upgrade the native IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ADS_STORE)) {
        db.createObjectStore(ADS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Save all advertisements into IndexedDB (supports large videos & high-res photos without 5MB limits)
 */
export async function saveAdsToIndexedDB(ads: Advertisement[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ADS_STORE, 'readwrite');
      const store = tx.objectStore(ADS_STORE);

      // Clear existing records in store to maintain exact sync
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        for (const ad of ads) {
          store.put(ad);
        }
      };

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => {
        console.warn('IndexedDB transaction error:', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('Error saving ads to IndexedDB:', err);
  }
}

/**
 * Load advertisements from IndexedDB
 */
export async function loadAdsFromIndexedDB(): Promise<Advertisement[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(ADS_STORE, 'readonly');
      const store = tx.objectStore(ADS_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as Advertisement[];
        if (Array.isArray(results) && results.length > 0) {
          resolve(results);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error loading ads from IndexedDB:', err);
    return null;
  }
}

/**
 * Save advertisements safely to both IndexedDB and localStorage:
 * - Full data (including high-resolution video and photo data URLs) is stored in IndexedDB.
 * - In localStorage, if the full data exceeds the 5MB quota, a sanitized version without massive data URLs
 *   is safely preserved so localStorage never throws QuotaExceededError and never crashes the app!
 */
export async function saveAdsSafely(ads: Advertisement[]): Promise<void> {
  // 1. First persist complete data in IndexedDB
  await saveAdsToIndexedDB(ads);

  // 2. Persist in localStorage with QuotaExceededError resilience
  try {
    const json = JSON.stringify(ads);
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
  } catch (quotaError) {
    console.warn('localStorage quota exceeded. Saving sanitized ads cache in localStorage...', quotaError);
    try {
      // Create a lightweight version for localStorage where huge data URLs (> 50KB) are trimmed
      // while keeping the type, name, status, and metadata intact. IndexedDB holds the full video!
      const lightweightAds = ads.map((ad) => {
        if (ad.mediaUrl && ad.mediaUrl.startsWith('data:') && ad.mediaUrl.length > 50000) {
          return {
            ...ad,
            // Keep preview placeholder or mark that full media is in IndexedDB
            mediaUrl: ad.mediaType === 'video' ? '' : ad.mediaUrl.substring(0, 1000),
            _mediaStoredInIndexedDB: true,
          };
        }
        return ad;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweightAds));
    } catch (fallbackError) {
      console.warn('Could not write lightweight ads to localStorage; relying on IndexedDB:', fallbackError);
    }
  }
}

/**
 * Compress an image file using an offscreen canvas to keep file size lightweight (< 500KB)
 * while preserving high visual fidelity (max 1280px).
 */
export function compressImageFile(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 1280,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or gif, return as data URL directly
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
