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

async function handleRealtimeEvent(payload: {
  eventType: string;
  new: Record<string, any> | undefined;
  old: Record<string, any> | undefined;
}) {
  const { eventType, new: remote, old: oldRow } = payload;

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

  // Prodotto nuovo → accetta sempre
  if (!local) {
    const doc = mapRemoteToDoc(remote);
    await db.products.put(doc);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  // Se il prodotto locale è già sincronizzato, il remoto è più recente
  if (local.synced) {
    const doc = mapRemoteToDoc(remote);
    await db.products.put(doc);
    const products = await db.products.toArray();
    useAppStore.setState({ products });
    return;
  }

  // Prodotto locale NON sincronizzato: confronto stretto dei timestamp
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

export function useRealtimeProducts() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const cleanup = useCallback(() => {
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }
    if (channelRef.current) {
      console.log('[Realtime] Disconnessione canale precedente');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Errore canale, riconnessione tra 3s...');
          retryRef.current = setTimeout(() => subscribe(), 3000);
        } else if (status === 'CLOSED') {
          console.warn('[Realtime] Canale chiuso, riconnessione tra 3s...');
          retryRef.current = setTimeout(() => subscribe(), 3000);
        }
      });

    channelRef.current = channel;
  }, [cleanup]);

  // Online/offline listener
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

  // Subscribe/unsubscribe in base a isOnline
  useEffect(() => {
    if (isOnline) {
      subscribe();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOnline, subscribe, cleanup]);
}
