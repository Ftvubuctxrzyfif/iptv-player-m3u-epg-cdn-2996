import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PortalConfig from '@/components/PortalConfig';
import ChannelList from '@/components/ChannelList';
import VideoPlayer from '@/components/VideoPlayer';
import { Tv, Settings, Loader2, AlertCircle } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';

interface Portal {
  _row_id: number;
  name: string;
  portal_url: string;
  mac_address: string;
  is_active: boolean;
}

interface Channel {
  _row_id: number;
  channel_id: string;
  name: string;
  logo: string;
  group_title: string;
  stream_url: string;
  is_favorite: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [portals, setPortals] = useState<Portal[]>([]);
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadPortals();
  }, []);

  const checkAuthAndLoadPortals = async () => {
    try {
      const user = await auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      await loadPortals();
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortals = async () => {
    try {
      const result = await db.query('portal_configs', {
        order: '_created_at.desc'
      });

      setPortals(result as Portal[]);

      // Set active portal
      const active = (result as Portal[]).find(p => p.is_active);
      if (active) {
        setActivePortal(active);
        await loadChannels(active._row_id);
      }
    } catch (error) {
      console.error('Error loading portals:', error);
      setError('Failed to load portals. Please try again.');
    }
  };

  const loadChannels = async (portalId: number) => {
    try {
      setIsLoadingChannels(true);
      const result = await db.query('stalker_channels', {
        portal_id: `eq.${portalId}`,
        order: 'group_title.asc,name.asc',
        limit: '1'
      });

      if (result.length === 0) {
        // Need to fetch channels from Stalker portal
        await fetchChannelsFromPortal(portalId);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const fetchChannelsFromPortal = async (portalId: number) => {
    // This will be implemented via edge function to avoid CORS
    // For now, we'll show a message that channels need to be loaded
    console.log('Channels need to be fetched from portal - implement edge function');
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    
    // Add to watch history
    addToWatchHistory(channel);
  };

  const addToWatchHistory = async (channel: Channel) => {
    try {
      await db.insert('watch_history', {
        channel_id: channel.channel_id,
        channel_name: channel.name,
        watched_at: Math.floor(Date.now() / 1000),
        duration_seconds: 0
      });
    } catch (error) {
      console.error('Error adding to watch history:', error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (portals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <Card className="max-w-md w-full p-8 bg-slate-800/50 border-slate-700">
          <div className="text-center mb-6">
            <Tv className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to IPTV Player</h1>
            <p className="text-gray-400">
              Add your Stalker portal configuration to get started
            </p>
          </div>

          <div className="flex justify-center">
            <PortalConfig onConfigAdded={loadPortals} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tv className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white">IPTV Player</h1>
              {activePortal && (
                <p className="text-xs text-gray-400">{activePortal.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePortal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePortal(null)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Portal
              </Button>
            )}
            <PortalConfig onConfigAdded={loadPortals} />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto p-4 h-[calc(100vh-73px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Channel list */}
          <div className="lg:col-span-1 h-[calc(100vh-89px)]">
            <Card className="h-full bg-slate-800/50 border-slate-700 overflow-hidden">
              {activePortal ? (
                <ChannelList
                  portalId={activePortal._row_id}
                  onChannelSelect={handleChannelSelect}
                  selectedChannel={selectedChannel}
                />
              ) : (
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Your Portals</h2>
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      {portals.map(portal => (
                        <Button
                          key={portal._row_id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => {
                            setActivePortal(portal);
                            loadChannels(portal._row_id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Tv className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">{portal.name}</p>
                              <p className="text-xs text-gray-400">{portal.mac_address}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>
          </div>

          {/* Video player */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              {selectedChannel ? (
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    {selectedChannel.logo && (
                      <img
                        src={selectedChannel.logo}
                        alt={selectedChannel.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedChannel.name}
                      </h2>
                      {selectedChannel.group_title && (
                        <p className="text-gray-400">{selectedChannel.group_title}</p>
                      )}
                    </div>
                  </div>

                  <VideoPlayer
                    streamUrl={selectedChannel.stream_url}
                    isLive={true}
                    autoplay={true}
                    onError={(error) => console.error('Player error:', error)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <Tv className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Select a channel to start watching</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;