import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Tv } from 'lucide-react';
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
  portalId: number;
  onChannelSelect: (channel: Channel) => void;
  selectedChannel?: Channel | null;
}

const ChannelList = ({ portalId, onChannelSelect, selectedChannel }: ChannelListProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadChannels();
  }, [portalId]);

  useEffect(() => {
    filterChannels();
  }, [channels, searchTerm, selectedGroup, showFavorites]);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      const result = await db.query('stalker_channels', {
        portal_id: `eq.${portalId}`,
        order: 'group_title.asc,name.asc'
      });

      setChannels(result as Channel[]);

      // Extract unique groups
      const uniqueGroups = Array.from(
        new Set(result.map((ch: any) => ch.group_title).filter(Boolean))
      ).sort();
      setGroups(uniqueGroups as string[]);

    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChannels = () => {
    let filtered = [...channels];

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(ch => ch.is_favorite);
    }

    // Filter by group
    if (selectedGroup) {
      filtered = filtered.filter(ch => ch.group_title === selectedGroup);
    }

    // Filter by search term
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

  const groupedChannels = filteredChannels.reduce((acc, channel) => {
    const group = channel.group_title || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Search and filter */}
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
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </Button>
        </div>

        {/* Groups */}
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

      {/* Channel list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Tv className="h-12 w-12 mb-2" />
            <p className="text-sm">No channels found</p>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {Object.entries(groupedChannels).map(([group, groupChannels]) => (
              <div key={group}>
                <h3 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                  {group}
                </h3>
                {groupChannels.map(channel => (
                  <button
                    key={channel._row_id}
                    onClick={() => onChannelSelect(channel)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedChannel?._row_id === channel._row_id
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {/* Channel logo */}
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

                    {/* Channel info */}
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

                    {/* Favorite button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleFavorite(channel, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          channel.is_favorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </Button>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Channel count */}
      <div className="p-3 border-t border-gray-800 text-xs text-gray-400">
        {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
      </div>
    </div>
  );
};

export default ChannelList;