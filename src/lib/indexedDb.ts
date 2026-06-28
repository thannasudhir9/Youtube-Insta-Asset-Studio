import { StoredAsset } from "../types";

const DB_NAME = "The90sBreezeOfflineDB";
const STORE_NAME = "assets";
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database for offline assets.
 */
export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn("IndexedDB is not supported in this browser fallback to memory / localStorage.");
      reject("IndexedDB not supported");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening offline database");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Saves a StoredAsset to the offline IndexedDB store.
 */
export async function saveAssetToOfflineDB(asset: StoredAsset): Promise<void> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(asset);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error saving asset to IndexedDB:", event);
        reject("Error saving asset");
      };
    });
  } catch (err) {
    console.error("Failed to save to IndexedDB, falling back:", err);
  }
}

/**
 * Retrieves all saved StoredAssets from the offline IndexedDB store.
 */
export async function getAssetsFromOfflineDB(): Promise<StoredAsset[]> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        console.error("Error getting assets from IndexedDB:", event);
        reject("Error retrieving assets");
      };
    });
  } catch (err) {
    console.error("Failed to read from IndexedDB, falling back:", err);
    return [];
  }
}

/**
 * Deletes a StoredAsset from the offline IndexedDB store by ID.
 */
export async function deleteAssetFromOfflineDB(id: string): Promise<void> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting asset from IndexedDB:", event);
        reject("Error deleting asset");
      };
    });
  } catch (err) {
    console.error("Failed to delete from IndexedDB, falling back:", err);
  }
}
