import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Settings, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      const settingsMap: Record<string, any> = {};
      settings.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (key: string) => {
    await updateSetting.mutateAsync({
      settingKey: key,
      value: localSettings[key],
    });
    setHasChanges(false);
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(localSettings);
    for (const key of keys) {
      await updateSetting.mutateAsync({
        settingKey: key,
        value: localSettings[key],
      });
    }
    setHasChanges(false);
    toast.success('All settings saved');
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure global platform settings</p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveAll} disabled={updateSetting.isPending}>
            {updateSetting.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        )}
      </div>

      {/* Branding Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Platform name and identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input
                value={localSettings.platform_name?.replace(/"/g, '') || ''}
                onChange={(e) => handleChange('platform_name', `"${e.target.value}"`)}
                placeholder="MedFlowX"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select 
                value={localSettings.default_currency?.replace(/"/g, '') || 'BDT'}
                onValueChange={(value) => handleChange('default_currency', `"${value}"`)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
          <CardDescription>Regional format settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={localSettings.date_format?.replace(/"/g, '') || 'DD/MM/YYYY'}
                onValueChange={(value) => handleChange('date_format', `"${value}"`)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select 
                value={localSettings.time_format?.replace(/"/g, '') || '12h'}
                onValueChange={(value) => handleChange('time_format', `"${value}"`)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Subscription Settings</CardTitle>
          <CardDescription>Trial and renewal configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Trial Duration (days)</Label>
              <Input
                type="number"
                value={localSettings.trial_duration_days || 7}
                onChange={(e) => handleChange('trial_duration_days', parseInt(e.target.value))}
                placeholder="7"
              />
            </div>
            <div className="space-y-2">
              <Label>Yearly Service Charge (BDT)</Label>
              <Input
                type="number"
                value={localSettings.yearly_service_charge || 999}
                onChange={(e) => handleChange('yearly_service_charge', parseInt(e.target.value))}
                placeholder="999"
              />
              <p className="text-xs text-muted-foreground">For lifetime plan maintenance</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label>Auto-Renewal</Label>
              <p className="text-sm text-muted-foreground">Automatically renew subscriptions</p>
            </div>
            <Switch
              checked={localSettings.auto_renew_enabled === true}
              onCheckedChange={(checked) => handleChange('auto_renew_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="border-0 shadow-card border-orange-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle>System Controls</CardTitle>
          </div>
          <CardDescription>Critical system settings - use with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
            <div>
              <Label className="text-orange-800 dark:text-orange-200">Maintenance Mode</Label>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                When enabled, only owner can access the platform
              </p>
            </div>
            <Switch
              checked={localSettings.maintenance_mode === true}
              onCheckedChange={(checked) => handleChange('maintenance_mode', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
