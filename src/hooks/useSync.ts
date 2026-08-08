import { useState, useEffect, useCallback } from 'react';
import {
  getSyncStatus,
  onSyncStatusChange,
  fullSync,
  startOnlineSyncListener,
  stopOnlineSyncListener,
  type SyncStatus,
} from '../utils/syncQueue';
import { isSupabaseConfigured } from '../lib/supabase';

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    startOnlineSyncListener();
    const unsub = onSyncStatusChange(setStatus);

    return () => {
      unsub();
      stopOnlineSyncListener();
    };
  }, []);

  const sync = useCallback(async () => {
    if (!isSupabaseConfigured || !navigator.onLine) return;
    const result = await fullSync();
    return result;
  }, []);

  return {
    status,
    isConfigured: isSupabaseConfigured,
    isOnline: navigator.onLine,
    pendingCount,
    sync,
  };
}
