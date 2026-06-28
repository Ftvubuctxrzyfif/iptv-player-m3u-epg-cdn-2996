import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Tv, RefreshCw, Loader2 } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

interface Channel {
  _row_id: number;
  channel_id: string;
  name: string;
  logo: string;
  group_title: string;
  stream_url: string;
  is_favorite: boolean;
}

interface ChannelListProps {
  portalId: number | null;
  onChannelSelect: (channel: Channel) => void;
  selectedChannel?: Channel | null;
}

const ChannelList = ({ portalId, onChannelSelect, selectedChannel }: ChannelListProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (portalId) {
      loadChannels();
    } else {
      setChannels([]);
      setFilteredChannels([]);
    }
  }, [portalId]);

  useEffect(() => {
    filterChannels();
  }, [channels, searchTerm, selectedGroup, showFavorites]);

  const loadChannels = async (pageNum = 1, append = false) => {
    if (!portalId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        portal_id: portalId.toString(),
        page: pageNum.toString(),
        limit: '100'
      });

      const response = await fetch(`/api/v2/functions/stalker-channels-fast?${params}`);
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
          
          const uniqueGroups = Array.from(
            new Set(newChannels.map((ch: Channel) => ch.group_title).filter(Boolean))
          ).sort();
          setGroups(uniqueGroups);
        }

        setHasMore(data.hasMore !== false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChannels = () => {
    let filtered = [...channels];

    if (showFavorites) {
      filtered = filtered.filter(ch => ch.is_favorite);
    }

    if (selectedGroup) {
      filtered = filtered.filter(ch => ch.group_title === selectedGroup);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(search) ||
        ch.group_title?.toLowerCase().includes(search)
      );
    }

    setFilteredChannels(filtered);
  };

  const toggleFavorite = async (channel: Channel, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.update('stalker_channels', { _row_id: `eq.${channel._row_id}` }, {
        is_favorite: !channel.is_favorite
      });

      setChannels(prev =>
        prev.map(ch =>
          ch._row_id === channel._row_id
            ? { ...ch, is_favorite: !ch.is_favorite }
            : ch
        )
      );
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    if (scrollBottom < 100 && hasMore && !isLoading) {
      loadChannels(page + 1, true);
    }
  };

  if (!portalId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Tv className="h-12 w-12 mb-2" />
        <p className="text-sm">Select a portal first</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 space-y-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
            className={showFavorites ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsRefreshing(true);
              loadChannels(1, false);
              setTimeout(() => setIsRefreshing(false), 2000);
            }}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-20">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedGroup === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGroup(null)}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {groups.map(group => (
              <Button
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGroup(group)}
                className="whitespace-nowrap"
              >
                {group}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1" onScroll={handleScroll}>
        {isLoading && channels.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Tv className="h-12 w-12 mb-2" />
            <p className="text-sm">No channels found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChannels.map(channel => (
              <button
                key={channel._row_id}
                onClick={() => onChannelSelect(channel)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  selectedChannel?._row_id === channel._row_id
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                    <Tv className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {channel.name}
                  </p>
                  {channel.group_title && (
                    <p className="text-xs text-gray-400 truncate">
                      {channel.group_title}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleFavorite(channel, e)}
                  className="h-8 w-8 p-0"
                >
                  <Star
                    className={`h-4 w-4 ${
                      channel.is_favorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </Button>
              </button>
            ))}
            
            {isLoading && hasMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-800 text-xs text-gray-400 text-center">
        {filteredChannels.length} channels
      </div>
    </div>
  );
};

export default ChannelList;