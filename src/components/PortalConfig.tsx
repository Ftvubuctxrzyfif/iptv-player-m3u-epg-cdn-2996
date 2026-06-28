import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, Loader2 } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';

interface PortalConfig {
  _row_id: number;
  name: string;
  portal_url: string;
  mac_address: string;
  is_active: boolean;
}

interface PortalConfigProps {
  onConfigAdded?: (config: PortalConfig) => void;
}

const PortalConfig = ({ onConfigAdded }: PortalConfigProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    portal_url: '',
    mac_address: ''
  });
  const [error, setError] = useState<string | null>(null);

  const generateMacAddress = () => {
    // Generate random MAC address
    const mac = '00:1A:79:' + 
      Array.from({ length: 3 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
      ).join(':');
    setFormData(prev => ({ ...prev, mac_address: mac }));
  };

  const validateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateMac = (mac: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Please enter a name for this portal');
      return;
    }

    if (!validateUrl(formData.portal_url)) {
      setError('Please enter a valid portal URL (http:// or https://)');
      return;
    }

    if (!validateMac(formData.mac_address)) {
      setError('Please enter a valid MAC address (XX:XX:XX:XX:XX:XX)');
      return;
    }

    setIsLoading(true);

    try {
      const user = await auth.getUser();
      if (!user) {
        setError('You must be logged in to add a portal');
        return;
      }

      // Clean portal URL
      let cleanUrl = formData.portal_url.trim();
      if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }

      // Check if portal already exists
      const existing = await db.query('portal_configs', {
        portal_url: `eq.${cleanUrl}`,
        mac_address: `eq.${formData.mac_address}`,
        _created_by: `eq.${user.userUuid}`
      });

      if (existing.length > 0) {
        setError('This portal configuration already exists');
        setIsLoading(false);
        return;
      }

      // Create portal configuration
      const result = await db.insert('portal_configs', {
        name: formData.name.trim(),
        portal_url: cleanUrl,
        mac_address: formData.mac_address.toUpperCase(),
        is_active: false,
        last_used: null
      });

      setIsLoading(false);
      setIsOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        portal_url: '',
        mac_address: ''
      });

      onConfigAdded?.(result[0] as PortalConfig);

    } catch (err) {
      console.error('Error creating portal config:', err);
      setError('Failed to create portal configuration. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Portal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Add Stalker Portal
          </DialogTitle>
          <DialogDescription>
            Configure your IPTV provider's portal URL and MAC address
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portal Name</Label>
            <Input
              id="name"
              placeholder="My IPTV Provider"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portal_url">Portal URL</Label>
            <Input
              id="portal_url"
              placeholder="http://example.com/c"
              value={formData.portal_url}
              onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Enter your provider's portal URL (usually ending with /c)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mac_address">MAC Address</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateMacAddress}
                className="h-7 text-xs"
              >
                Generate
              </Button>
            </div>
            <Input
              id="mac_address"
              placeholder="00:1A:79:XX:XX:XX"
              value={formData.mac_address}
              onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
              disabled={isLoading}
              maxLength={17}
            />
            <p className="text-xs text-gray-500">
              Use the MAC address from your MAG device or generate a new one
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Portal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PortalConfig;