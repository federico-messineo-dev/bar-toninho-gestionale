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

let _eventReceived = false;

async function handleRealtimeEvent(payload: any) {
  console.log('[Realtime] Callback chiamata', payload);
  _eventReceived = true;

  const eventType = payload.eventType;
  const remote = payload.new as Record<string, any> | undefined;
  const oldRow = payload.old as Record<string, any> | undefined;

  console.log('[Realtime] Evento ricevuto:', eventType, remote?.id || oldRow?.id);

  if (eventType === 'DELETE') {
    const deletedId = oldRow?.id;
    if (!deletedId) return;
    await db.products.delete(deletedId);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  if (!remote?.id) return;

  const local = await db.products.get(remote.id);

  if (!local) {
    const doc = mapRemoteToDoc(remote);
    await db.products.put(doc);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  if (local.synced) {
    const doc = mapRemoteToDoc(remote);
    await db.products.put(doc);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  const remoteTime = new Date(remote.updated_at || 0).getTime();
  const localTime = new Date(local.updated_at || 0).getTime();

  if (remoteTime > localTime) {
    const doc = mapRemoteToDoc(remote);
    await db.products.put(doc);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
  } else {
    console.log('[Realtime] Aggiornamento scartato: locale più recente per', remote.id);
  }
}

async function pollProducts() {
  console.log('[Polling] Recupero prodotti da Supabase...');
  try {
    const { data: remoteProducts, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !remoteProducts) {
      console.error('[Polling] Errore:', error?.message);
      return;
    }

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
      console.log(`[Polling] ${updated} prodotti aggiornati`);
    }
  } catch (e) {
    console.error('[Polling] Eccezione:', e);
  }
}

export function useRealtimeProducts() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopPolling();
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }
    if (channelRef.current) {
      console.log('[Realtime] Disconnessione canale precedente');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [stopPolling]);

  const startPollingIfNeeded = useCallback(() => {
    stopPolling();
    _eventReceived = false;

    safetyRef.current = setTimeout(() => {
      if (!_eventReceived) {
        console.warn('[Realtime] Nessun evento ricevuto dopo 10s, avvio polling ogni 5s');
        pollProducts();
        pollRef.current = setInterval(pollProducts, 5000);
      }
    }, 10000);
  }, [stopPolling]);

  const subscribe = useCallback(() => {
    cleanup();

    if (!isSupabaseConfigured || !navigator.onLine) return;

    console.log('[Realtime] Tentativo di connessione...');

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        handleRealtimeEvent
      )
      .subscribe((status) => {
        console.log('[Realtime] Stato canale:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connesso e in ascolto sulla tabella products');
          startPollingIfNeeded();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Errore canale, riconnessione tra 3s...');
          retryRef.current = setTimeout(() => subscribe(), 3000);
        } else if (status === 'CLOSED') {
          console.warn('[Realtime] Canale chiuso, riconnessione tra 3s...');
          retryRef.current = setTimeout(() => subscribe(), 3000);
        }
      });

    channelRef.current = channel;
  }, [cleanup, startPollingIfNeeded]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Realtime] Online rilevato');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('[Realtime] Offline rilevato');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      subscribe();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOnline, subscribe, cleanup]);
}
