import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, ShieldAlert, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityAlertSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const sectionKeys = ['lockout_notifications_enabled', 'security_alert_email', 'admin_phone'];

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const key of sectionKeys) {
        if (localSettings[key] !== undefined && changedKeys.has(key)) {
          await updateSetting.mutateAsync({
            settingKey: key,
            value: localSettings[key],
          });
        }
      }
      setChangedKeys(new Set());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('Security Alert সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = sectionKeys.some(key => changedKeys.has(key));

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
        <div className="p-2 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Security Alert Settings</h1>
          <p className="text-muted-foreground">Login lockout এবং security notification সেটিংস</p>
        </div>
      </div>

      <Card className="border-0 shadow-card border-red-200 dark:border-red-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Security Notifications</CardTitle>
            <CardDescription>Get notified about security events</CardDescription>
          </div>
          {saved ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <div>
              <Label className="text-red-800 dark:text-red-200">Enable Lockout Notifications</Label>
              <p className="text-sm text-red-600 dark:text-red-400">
                কোন অ্যাকাউন্ট lock হলে email/SMS alert পাঠান
              </p>
            </div>
            <Switch
              checked={localSettings.lockout_notifications_enabled === true || localSettings.lockout_notifications_enabled === 'true'}
              onCheckedChange={(checked) => handleChange('lockout_notifications_enabled', checked)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Security Alert Email</Label>
              <Input
                type="email"
                value={getCleanValue(localSettings.security_alert_email) || ''}
                onChange={(e) => handleChange('security_alert_email', e.target.value)}
                placeholder="security@yourdomain.com"
              />
              <p className="text-xs text-muted-foreground">Lockout alerts এই email-এ পাঠানো হবে</p>
            </div>
            <div className="space-y-2">
              <Label>Admin Phone (SMS Alert)</Label>
              <Input
                type="tel"
                value={getCleanValue(localSettings.admin_phone) || ''}
                onChange={(e) => handleChange('admin_phone', e.target.value)}
                placeholder="01XXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">Critical alerts এই নম্বরে SMS করা হবে</p>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Security Alert System</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  কোন ক্লায়েন্ট বা স্টাফের অ্যাকাউন্ট repeated failed login attempts এর কারণে lock হলে,
                  আপনাকে তাৎক্ষণিক email এবং SMS এর মাধ্যমে জানানো হবে।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
