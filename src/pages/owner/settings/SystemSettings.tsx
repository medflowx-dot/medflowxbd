import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Settings, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [savingDateTime, setSavingDateTime] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);
  const [savedDateTime, setSavedDateTime] = useState(false);
  const [savedSubscription, setSavedSubscription] = useState(false);
  const [savedSystem, setSavedSystem] = useState(false);

  useEffect(() => {
    if (settings) {
      const settingsMap: Record<string, any> = {};
      settings.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const getCleanValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/^"|"$/g, '');
    }
    return value;
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setChangedKeys(prev => new Set(prev).add(key));
  };

  const dateTimeKeys = ['date_format', 'time_format'];
  const subscriptionKeys = ['trial_duration_days', 'yearly_service_charge', 'abandoned_payment_cleanup_minutes', 'auto_renew_enabled'];
  const systemKeys = ['maintenance_mode'];

  const handleSaveDateTime = async () => {
    setSavingDateTime(true);
    try {
      for (const key of dateTimeKeys) {
        if (localSettings[key] !== undefined && changedKeys.has(key)) {
          await updateSetting.mutateAsync({ settingKey: key, value: localSettings[key] });
        }
      }
      dateTimeKeys.forEach(k => changedKeys.delete(k));
      setChangedKeys(new Set(changedKeys));
      setSavedDateTime(true);
      setTimeout(() => setSavedDateTime(false), 3000);
      toast.success('Date & Time সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingDateTime(false);
    }
  };

  const handleSaveSubscription = async () => {
    setSavingSubscription(true);
    try {
      for (const key of subscriptionKeys) {
        if (localSettings[key] !== undefined && changedKeys.has(key)) {
          await updateSetting.mutateAsync({ settingKey: key, value: localSettings[key] });
        }
      }
      subscriptionKeys.forEach(k => changedKeys.delete(k));
      setChangedKeys(new Set(changedKeys));
      setSavedSubscription(true);
      setTimeout(() => setSavedSubscription(false), 3000);
      toast.success('Subscription সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleSaveSystem = async () => {
    setSavingSystem(true);
    try {
      for (const key of systemKeys) {
        if (localSettings[key] !== undefined && changedKeys.has(key)) {
          await updateSetting.mutateAsync({ settingKey: key, value: localSettings[key] });
        }
      }
      systemKeys.forEach(k => changedKeys.delete(k));
      setChangedKeys(new Set(changedKeys));
      setSavedSystem(true);
      setTimeout(() => setSavedSystem(false), 3000);
      toast.success('System Controls সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingSystem(false);
    }
  };

  const hasDateTimeChanges = dateTimeKeys.some(key => changedKeys.has(key));
  const hasSubscriptionChanges = subscriptionKeys.some(key => changedKeys.has(key));
  const hasSystemChanges = systemKeys.some(key => changedKeys.has(key));

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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Date/Time, Subscription এবং System Controls</p>
        </div>
      </div>

      {/* Date & Time Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>Regional format settings</CardDescription>
          </div>
          {savedDateTime ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleSaveDateTime}
              disabled={savingDateTime || !hasDateTimeChanges}
            >
              {savingDateTime ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={getCleanValue(localSettings.date_format) || 'DD/MM/YYYY'}
                onValueChange={(value) => handleChange('date_format', value)}
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
                value={getCleanValue(localSettings.time_format) || '12h'}
                onValueChange={(value) => handleChange('time_format', value)}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Settings</CardTitle>
            <CardDescription>Trial and renewal configuration</CardDescription>
          </div>
          {savedSubscription ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleSaveSubscription}
              disabled={savingSubscription || !hasSubscriptionChanges}
            >
              {savingSubscription ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Abandoned Payment Cleanup (minutes)</Label>
              <Input
                type="number"
                min="10"
                max="1440"
                value={String(localSettings.abandoned_payment_cleanup_minutes || '60').replace(/"/g, '')}
                onChange={(e) => handleChange('abandoned_payment_cleanup_minutes', e.target.value)}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground">
                Empty transaction ID সহ pending requests এই সময়ের পর auto-delete হবে
              </p>
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

      {/* System Controls */}
      <Card className="border-0 shadow-card border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <CardTitle>System Controls</CardTitle>
              <CardDescription>Critical system settings - use with caution</CardDescription>
            </div>
          </div>
          {savedSystem ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          ) : (
            <Button 
              size="sm"
              variant="outline"
              className="border-orange-300 hover:bg-orange-50"
              onClick={handleSaveSystem}
              disabled={savingSystem || !hasSystemChanges}
            >
              {savingSystem ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
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
