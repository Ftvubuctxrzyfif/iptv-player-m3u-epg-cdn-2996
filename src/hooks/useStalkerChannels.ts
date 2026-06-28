import { useState, useEffect, useCallback } from 'react';
import functions from '@/lib/shared/kliv-functions.js';

interface Channel {
  _row_id?: number;
  channel_id: string;
  name: string;
  logo: string;
  group_title: string;
  stream_url: string;
  is_favorite?: boolean;
}

interface UseStalkerChannelsResult {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  refresh: () => Promise<void>;
}

export const useStalkerChannels = (portalId: number | null, group: string | null = null): UseStalkerChannelsResult => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = useCallback(async (pageNum = 1, append = false) => {
    if (!portalId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        portal_id: portalId.toString(),
        page: pageNum.toString(),
        limit: '50'
      });

      if (group) {
        params.append('group', group);
      }

      const response = await fetch(`/api/v2/functions/stalker-channels-fast?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load channels');
      }

      const data = await response.json();

      if (data.success) {
        const newChannels = data.channels.map((ch: any) => ({
          ...ch,
          is_favorite: ch.is_favorite === 1 || ch.is_favorite === true
        }));

        if (append) {
          setChannels(prev => [...prev, ...newChannels]);
        } else {
          setChannels(newChannels);
        }

        setTotal(data.total || 0);
        setHasMore(data.hasMore !== false);
        setPage(pageNum);
      } else {
        throw new Error(data.error || 'Failed to load channels');
      }
    } catch (err) {
      console.error('Error loading channels:', err);
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  }, [portalId, group]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadChannels(page + 1, true);
    }
  }, [loading, hasMore, page, loadChannels]);

  const refresh = useCallback(async () => {
    if (!portalId || refreshing) return;

    setRefreshing(true);
    setError(null);

    try {
      const response = await functions.invoke('stalker-refresh-channels', {
        body: { portal_id: portalId }
      });

      if (response.success) {
        // Reload from cache
        await loadChannels(1, false);
      } else {
        throw new Error(response.error || 'Failed to refresh channels');
      }
    } catch (err) {
      console.error('Error refreshing channels:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh channels');
    } finally {
      setRefreshing(false);
    }
  }, [portalId, refreshing, loadChannels]);

  useEffect(() => {
    if (portalId) {
      loadChannels(1, false);
    } else {
      setChannels([]);
      setTotal(0);
      setHasMore(true);
      setPage(1);
    }
  }, [portalId, group]);

  return {
    channels,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
};