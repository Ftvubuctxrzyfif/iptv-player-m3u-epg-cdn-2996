import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Tv, 
  Loader2, 
  PanelLeft, 
  Home,
  Radio,
  Clapperboard,
  Clock,
  Star,
  LogOut,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import auth from '@/lib/shared/kliv-auth.js';
import db from '@/lib/shared/kliv-database.js';
import { toast } from 'sonner';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelList from '@/components/IptvChannelList';
import PortalConfig from '@/components/PortalConfig';
import { useTVNavigation } from '@/hooks/use-tv-navigation';

interface Portal {
  _row_id: number;
  name: string;
  portal_url: string;
  mac_address: string;
  is_active: number;
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

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'live' | 'vod' | 'series' | 'favorites' | 'history'>('live');
  const [isLoading, setIsLoading] = useState(false);
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');

  // TV Navigation setup
  const { setFocusedElement } = useTVNavigation({
    onEscapePress: () => {
      if (portalDialogOpen) {
        setPortalDialogOpen(false);
      } else if (selectedChannel) {
        setSelectedChannel(null);
        setStreamUrl('');
      }
    }
  });

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const currentUser = await auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      loadPortals();
    } else {
      navigate('/login');
    }
  };

  const loadPortals = async () => {
    try {
      const result = await db.query('portal_configs', {
        order: '_created_at.desc'
      });
      setPortals(result as Portal[]);
      
      const active = (result as Portal[]).find(p => p.is_active === 1);
      if (active) setActivePortal(active);
    } catch (error) {
      console.error('Error loading portals:', error);
    }
  };

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel);
    setStreamUrl(channel.stream_url);
    setCurrentPage('live');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const SidebarItem = ({ icon: Icon, label, page, count }: { icon: any, label: string, page: any, count?: number }) => (
    <button
      onClick={() => setCurrentPage(page)}
      onFocus={() => {
        // Ensure this element is focused for TV navigation
        const focused = document.activeElement as HTMLElement;
        if (focused) setFocusedElement(focused);
      }}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-lg transition-all ${
        currentPage === page 
          ? 'bg-blue-600 text-white scale-105' 
          : 'text-gray-300 hover:bg-gray-700 focus:ring-2 focus:ring-blue-400'
      }`}
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-6 w-6" />
        <span className="font-medium text-lg">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-sm bg-gray-700 px-3 py-1 rounded">{count}</span>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header - TV optimized */}
      <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700 h-20">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
              onFocus={() => {
                const focused = document.activeElement as HTMLElement;
                if (focused) setFocusedElement(focused);
              }}
            >
              <PanelLeft className="h-6 w-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Tv className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">IPTV Player</h1>
                <p className="text-sm text-gray-400">Powered by Stalker</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activePortal && (
              <Badge variant="outline" className="text-lg px-4 py-2">
                {activePortal.name}
              </Badge>
            )}
            <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="text-lg px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Portal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add Portal Configuration</DialogTitle>
                  <DialogDescription className="text-lg">
                    Enter your Stalker portal details to get started
                  </DialogDescription>
                </DialogHeader>
                <PortalConfig 
                  onConfigAdded={(portal) => {
                    loadPortals();
                    setPortalDialogOpen(false);
                    toast.success('Portal added successfully!');
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLogout}
              className="px-6 py-3"
              tabIndex={0}
              onFocus={() => {
                const focused = document.activeElement as HTMLElement;
                if (focused) setFocusedElement(focused);
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - TV optimized */}
        {sidebarOpen && (
          <aside className="w-80 bg-slate-800/50 border-r border-slate-700 p-6 flex flex-col gap-3">
            <SidebarItem icon={Home} label="Live TV" page="live" />
            <SidebarItem icon={Clapperboard} label="Movies" page="vod" />
            <SidebarItem icon={Radio} label="Series" page="series" />
            <SidebarItem icon={Star} label="Favorites" page="favorites" />
            <SidebarItem icon={Clock} label="History" page="history" />
            
            <div className="border-t border-slate-700 my-3" />
            
            {activePortal && (
              <>
                <Button
                  variant="outline"
                  className="justify-start gap-4 text-lg px-6 py-4 focus:ring-2 focus:ring-blue-400"
                  onClick={() => {/* Refresh logic */}}
                  tabIndex={0}
                  onFocus={() => {
                    const focused = document.activeElement as HTMLElement;
                    if (focused) setFocusedElement(focused);
                  }}
                >
                  <RefreshCw className="h-6 w-6" />
                  Refresh Channels
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-4 text-lg px-6 py-4 text-red-400 hover:text-red-300 focus:ring-2 focus:ring-red-400"
                  onClick={() => setActivePortal(null)}
                  tabIndex={0}
                  onFocus={() => {
                    const focused = document.activeElement as HTMLElement;
                    if (focused) setFocusedElement(focused);
                  }}
                >
                  <X className="h-6 w-6" />
                  Disconnect Portal
                </Button>
              </>
            )}
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {!activePortal ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Card className="max-w-2xl w-full p-12 bg-slate-800/50 border-slate-700">
                <div className="text-center mb-8">
                  <Tv className="h-24 w-24 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-bold text-white mb-4">Welcome to IPTV Player</h2>
                  <p className="text-xl text-gray-400">
                    {portals.length > 0 
                      ? 'Select a portal to continue'
                      : 'Add your Stalker portal to get started'}
                  </p>
                </div>

                {portals.length > 0 ? (
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {portals.map(portal => (
                        <Button
                          key={portal._row_id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-6 text-lg focus:ring-2 focus:ring-blue-400"
                          onClick={() => setActivePortal(portal)}
                          tabIndex={0}
                          onFocus={() => {
                            const focused = document.activeElement as HTMLElement;
                            if (focused) setFocusedElement(focused);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <Tv className="h-8 w-8" />
                            <div className="text-left">
                              <p className="font-medium text-xl">{portal.name}</p>
                              <p className="text-sm text-gray-400">{portal.mac_address}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center">
                    <p className="text-xl text-gray-400 mb-8">No portals configured yet</p>
                    <Button 
                      size="lg"
                      className="text-xl px-8 py-6"
                      onClick={() => setPortalDialogOpen(true)}
                      tabIndex={0}
                      onFocus={() => {
                        const focused = document.activeElement as HTMLElement;
                        if (focused) setFocusedElement(focused);
                      }}
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Add Your First Portal
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : currentPage === 'live' ? (
            <>
              <div className="w-96 border-r border-slate-700">
                <ChannelList
                  portalId={activePortal._row_id}
                  onChannelSelect={handleChannelSelect}
                  selectedChannel={selectedChannel}
                />
              </div>
              <div className="flex-1 flex flex-col">
                {selectedChannel ? (
                  <>
                    <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                      <div className="flex items-center gap-6">
                        {selectedChannel.logo && (
                          <img
                            src={selectedChannel.logo}
                            alt={selectedChannel.name}
                            className="w-20 h-20 object-contain rounded"
                          />
                        )}
                        <div>
                          <h2 className="text-3xl font-bold text-white">
                            {selectedChannel.name}
                          </h2>
                          {selectedChannel.group_title && (
                            <p className="text-lg text-gray-400">{selectedChannel.group_title}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-black">
                      <VideoPlayer
                        streamUrl={streamUrl}
                        isLive={true}
                        autoplay={true}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Tv className="h-24 w-24 mx-auto mb-6" />
                      <p className="text-2xl">Select a channel to start watching</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                {currentPage === 'vod' && <Clapperboard className="h-24 w-24 mx-auto mb-6" />}
                {currentPage === 'series' && <Radio className="h-24 w-24 mx-auto mb-6" />}
                {currentPage === 'favorites' && <Star className="h-24 w-24 mx-auto mb-6" />}
                {currentPage === 'history' && <Clock className="h-24 w-24 mx-auto mb-6" />}
                <p className="text-2xl capitalize">{currentPage === 'vod' ? 'Movies' : currentPage === 'series' ? 'TV Series' : currentPage} coming soon</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;