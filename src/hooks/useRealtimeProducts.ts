import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import db, { type ProductDoc } from '../db/dexie';
import useAppStore from '../store/useAppStore';

export function useRealtimeProducts() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !navigator.onLine) return;

    const channel = supabase
      .channel('supabase_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          const eventType = payload.eventType;
          const remote = payload.new as Record<string, any> | undefined;
          const oldId = (payload.old as Record<string, any>)?.id;

          if (eventType === 'DELETE' && oldId) {
            await db.products.delete(oldId);
            const products = await db.products.toArray();
            useAppStore.setState({ products });
            return;
          }

          if (!remote?.id) return;

          const local = await db.products.get(remote.id);
          const remoteUpdated = new Date(remote.updated_at || 0).getTime();
          const localUpdated = local ? new Date(local.updated_at || 0).getTime() : 0;

          if (remoteUpdated >= localUpdated) {
            const doc: ProductDoc = {
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

            await db.products.put(doc);
            const products = await db.products.toArray();
            useAppStore.setState({ products });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (!isSupabaseConfigured) return;
      if (channelRef.current) return;

      const channel = supabase
        .channel('supabase_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async (payload) => {
            const eventType = payload.eventType;
            const remote = payload.new as Record<string, any> | undefined;
            const oldId = (payload.old as Record<string, any>)?.id;

            if (eventType === 'DELETE' && oldId) {
              await db.products.delete(oldId);
              const products = await db.products.toArray();
              useAppStore.setState({ products });
              return;
            }

            if (!remote?.id) return;

            const local = await db.products.get(remote.id);
            const remoteUpdated = new Date(remote.updated_at || 0).getTime();
            const localUpdated = local ? new Date(local.updated_at || 0).getTime() : 0;

            if (remoteUpdated >= localUpdated) {
              const doc: ProductDoc = {
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

              await db.products.put(doc);
              const products = await db.products.toArray();
              useAppStore.setState({ products });
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    const handleOffline = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
