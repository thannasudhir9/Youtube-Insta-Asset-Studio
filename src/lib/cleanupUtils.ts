import { StoredAsset } from "../types";
import { getAssetsFromOfflineDB, deleteAssetFromOfflineDB } from "./indexedDb";

/**
 * Parses the savedAt date string.
 * Supports standard formats and formats with " (DL)" suffix.
 */
export function parseSavedAt(savedAt: string): Date {
  if (!savedAt) return new Date();
  const clean = savedAt.replace(" (DL)", "").trim();
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  return new Date();
}

/**
 * Performs auto-cleanup on local stored assets.
 * Clears temporary local files/assets older than 30 days while keeping those marked as curated.
 * 
 * Returns the list of deleted assets for toast reporting.
 */
export async function performAutoCleanup(): Promise<{
  deletedCount: number;
  keptCount: number;
  deletedTitles: string[];
}> {
  try {
    // 1. Get all assets from IndexedDB
    const dbAssets = await getAssetsFromOfflineDB();
    
    // 2. Also read from localStorage to stay synchronized
    const localStr = localStorage.getItem("the90s_Breeze_local_assets");
    let localAssets: StoredAsset[] = [];
    if (localStr) {
      try {
        localAssets = JSON.parse(localStr);
      } catch (e) {
        console.error("Failed to parse local_assets from localStorage", e);
      }
    }

    // Merge/align them - use dbAssets as the source of truth, or localAssets
    const allAssets = dbAssets.length > 0 ? dbAssets : localAssets;
    
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const keptAssets: StoredAsset[] = [];
    const deletedAssets: StoredAsset[] = [];

    for (const asset of allAssets) {
      const savedDate = parseSavedAt(asset.savedAt);
      const isOlderThan30Days = savedDate < thirtyDaysAgo;
      const isCurated = !!asset.isCurated;

      // Keep if:
      // - It is not local (though auto-cleanup is for local)
      // - OR it is less than 30 days old
      // - OR it is marked as curated
      if (asset.source === "drive" || !isOlderThan30Days || isCurated) {
        keptAssets.push(asset);
      } else {
        deletedAssets.push(asset);
      }
    }

    // Update DB
    for (const deleted of deletedAssets) {
      await deleteAssetFromOfflineDB(deleted.id);
    }

    // Update localStorage
    localStorage.setItem("the90s_Breeze_local_assets", JSON.stringify(keptAssets));

    // Store execution log
    localStorage.setItem("the90s_Breeze_last_cleanup", new Date().toISOString());

    return {
      deletedCount: deletedAssets.length,
      keptCount: keptAssets.length,
      deletedTitles: deletedAssets.map(a => a.title || a.name)
    };
  } catch (err) {
    console.error("Auto-cleanup failed:", err);
    return { deletedCount: 0, keptCount: 0, deletedTitles: [] };
  }
}
