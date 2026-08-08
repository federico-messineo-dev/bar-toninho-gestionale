import { supabase, isSupabaseConfigured } from '../lib/supabase';
import db, { type ProductDoc, type MovementDoc } from '../db/dexie';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

let _status: SyncStatus = navigator.onLine ? 'idle' : 'offline';
let _listeners: Array<(s: SyncStatus) => void> = [];

export function getSyncStatus(): SyncStatus {
  return _status;
}

export function onSyncStatusChange(fn: (s: SyncStatus) => void): () => void {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function setSyncStatus(s: SyncStatus) {
  _status = s;
  _listeners.forEach((fn) => fn(s));
}

function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const raw = atob(parts[1] || parts[0]);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function uploadImageToStorage(productId: string, base64Data: string): Promise<string | null> {
  if (!isSupabaseConfigured || !navigator.onLine) return null;
  try {
    const ext = base64Data.includes('image/png') ? 'png' : 'jpg';
    const fileName = `${productId}-${Date.now()}.${ext}`;
    const blob = base64ToBlob(base64Data);

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, { contentType: blob.type, upsert: true });

    if (error) {
      console.error('[Sync] Image upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (e) {
    console.error('[Sync] Image upload failed:', e);
    return null;
  }
}

export async function syncPendingProducts(): Promise<number> {
  if (!isSupabaseConfigured || !navigator.onLine) return 0;

  setSyncStatus('syncing');
  let syncedCount = 0;

  try {
    const allProducts = await db.products.toArray();
    const unsynced = allProducts.filter((p) => !p.synced);

    for (const product of unsynced) {
      try {
        let imageUrl = product.image_url;

        if (imageUrl && imageUrl.startsWith('data:')) {
          const uploadedUrl = await uploadImageToStorage(product.id, imageUrl);
          if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const { error } = await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          price_purchase: product.price_purchase,
          category: product.category,
          format: product.format,
          description: product.description,
          supplier: product.supplier,
          stock: product.stock,
          min_stock: product.min_stock,
          active: product.active,
          image_url: imageUrl,
          barcode: product.barcode,
          allergens: product.allergens,
          notes: product.notes,
          requires_review: product.requires_review,
          created_at: product.created_at,
          updated_at: product.updated_at,
        }, { onConflict: 'id' });

        if (!error) {
          await db.products.update(product.id, { synced: true });
          syncedCount++;
        } else {
          console.error(`[Sync] Product ${product.id} upsert error:`, error.message);
        }
      } catch (e) {
        console.error(`[Sync] Product ${product.id} sync failed:`, e);
      }
    }

    const allMovements = await db.movements.toArray();
    const unsyncedMovements = allMovements.filter((m) => !m.synced);
    for (const movement of unsyncedMovements) {
      try {
        const { error } = await supabase.from('movements').upsert({
          id: movement.id,
          product_id: movement.product_id,
          type: movement.type,
          qty: movement.qty,
          at: movement.at,
        }, { onConflict: 'id' });

        if (!error) {
          await db.movements.update(movement.id, { synced: true });
          syncedCount++;
        }
      } catch (e) {
        console.error(`[Sync] Movement ${movement.id} sync failed:`, e);
      }
    }

    setSyncStatus(syncedCount > 0 ? 'idle' : 'idle');
  } catch (e) {
    console.error('[Sync] Full sync failed:', e);
    setSyncStatus('error');
  }

  return syncedCount;
}

export async function pullProductsFromSupabase(): Promise<number> {
  if (!isSupabaseConfigured || !navigator.onLine) return 0;

  try {
    const { data: remoteProducts, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !remoteProducts) {
      console.error('[Sync] Pull products error:', error?.message);
      return 0;
    }

    let updatedCount = 0;

    for (const remote of remoteProducts) {
      const local = await db.products.get(remote.id);

      if (!local) {
        await db.products.add({
          ...remote,
          synced: true,
        } as ProductDoc);
        updatedCount++;
      } else if (new Date(remote.updated_at) > new Date(local.updated_at)) {
        await db.products.update(remote.id, {
          ...remote,
          synced: true,
        });
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (e) {
    console.error('[Sync] Pull failed:', e);
    return 0;
  }
}

export async function fullSync(): Promise<{ pushed: number; pulled: number }> {
  if (!isSupabaseConfigured || !navigator.onLine) {
    return { pushed: 0, pulled: 0 };
  }

  setSyncStatus('syncing');
  try {
    const pulled = await pullProductsFromSupabase();
    const pushed = await syncPendingProducts();
    setSyncStatus('idle');
    return { pushed, pulled };
  } catch (e) {
    setSyncStatus('error');
    return { pushed: 0, pulled: 0 };
  }
}

let _onlineHandler: (() => void) | null = null;

export function startOnlineSyncListener() {
  if (_onlineHandler) return;

  _onlineHandler = () => {
    if (isSupabaseConfigured) {
      console.log('[Sync] Back online, syncing...');
      fullSync();
    }
  };

  window.addEventListener('online', _onlineHandler);
  window.addEventListener('offline', () => setSyncStatus('offline'));
}

export function stopOnlineSyncListener() {
  if (_onlineHandler) {
    window.removeEventListener('online', _onlineHandler);
    _onlineHandler = null;
  }
}
