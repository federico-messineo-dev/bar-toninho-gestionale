import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import db, { type ProductDoc } from '../db/dexie';
import useAppStore from '../store/useAppStore';

function mapRemoteToDoc(remote: Record<string, any>): ProductDoc {
  return {
    id: remote.id,
    name: remote.name || '',
    price: Number(remote.price) || 0,
    price_purchase: remote.price_purchase ?? null,
    category: remote.category || 'Altro',
    format: remote.format || null,
    description: remote.description || '',
    supplier: remote.supplier || null,
    stock: Number(remote.stock) || 0,
    min_stock: Number(remote.min_stock) || 2,
    active: !!remote.active,
    image_url: remote.image_url || '',
    barcode: remote.barcode || null,
    allergens: remote.allergens || '',
    notes: remote.notes || '',
    requires_review: !!remote.requires_review,
    created_at: remote.created_at || new Date().toISOString(),
    updated_at: remote.updated_at || new Date().toISOString(),
    synced: true,
  };
}

const POLL_INTERVAL = 3000;

let _lastSyncAt: string | null = null;

async function pollProducts() {
  try {
    let query = supabase.from('products').select('*');

    if (_lastSyncAt) {
      query = query.gt('updated_at', _lastSyncAt);
    }

    const { data: remoteProducts, error } = await query.order('updated_at', { ascending: false });

    if (error || !remoteProducts || remoteProducts.length === 0) return;

    _lastSyncAt = remoteProducts[0]?.updated_at || _lastSyncAt;

    let updated = 0;
    for (const remote of remoteProducts) {
      const local = await db.products.get(remote.id);
      if (!local || new Date(remote.updated_at) > new Date(local.updated_at)) {
        await db.products.put(mapRemoteToDoc(remote));
        updated++;
      }
    }

    if (updated > 0) {
      const products = await db.products.toArray();
      useAppStore.setState({ products });
    }
  } catch {
    // silent
  }
}

async function handleRealtimeEvent(payload: any) {
  const remote = payload.new as Record<string, any> | undefined;
  const oldRow = payload.old as Record<string, any> | undefined;

  if (payload.eventType === 'DELETE' && oldRow?.id) {
    await db.products.delete(oldRow.id);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  if (!remote?.id) return;

  const local = await db.products.get(remote.id);
  if (!local || new Date(remote.updated_at) > new Date(local.updated_at)) {
    await db.products.put(mapRemoteToDoc(remote));
    const products = await db.products.toArray();
    useAppStore.setState({ products });
  }
}

export function useRealtimeProducts() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollProducts();
    pollRef.current = setInterval(pollProducts, POLL_INTERVAL);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startRealtime = useCallback(() => {
    if (channelRef.current || !isSupabaseConfigured) return;

    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, handleRealtimeEvent)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Sync] Realtime connesso');
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.warn('[Sync] Realtime non disponibile, polling attivo');
          setTimeout(() => {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          }, 1000);
        }
      });

    channelRef.current = channel;
  }, []);

  const cleanup = useCallback(() => {
    stopPolling();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    _lastSyncAt = null;
  }, [stopPolling]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (!isOnline || !isSupabaseConfigured) {
      cleanup();
      return;
    }

    startPolling();
    startRealtime();

    return cleanup;
  }, [isOnline, startPolling, startRealtime, cleanup]);
}
