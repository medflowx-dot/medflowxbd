import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Bell, Save, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
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

  const sectionKeys = ['notification_email_enabled', 'notification_sms_enabled', 'notification_days_before', 'notification_time_utc'];

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
      toast.success('Notification সেটিংস সেভ হয়েছে!');
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
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">সাবস্ক্রিপশন মেয়াদ শেষের আগে স্বয়ংক্রিয় নোটিফিকেশন সেটিংস</p>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>নোটিফিকেশন কনফিগারেশন</CardTitle>
            <CardDescription>Email এবং SMS নোটিফিকেশন সেটিংস</CardDescription>
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
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Email নোটিফিকেশন</Label>
                <p className="text-sm text-muted-foreground">সাবস্ক্রিপশন মেয়াদ শেষ হওয়ার আগে ইমেইল রিমাইন্ডার পাঠান</p>
              </div>
            </div>
            <Switch
              checked={localSettings.notification_email_enabled === true || localSettings.notification_email_enabled === 'true'}
              onCheckedChange={(checked) => handleChange('notification_email_enabled', checked)}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>SMS নোটিফিকেশন</Label>
                <p className="text-sm text-muted-foreground">সাবস্ক্রিপশন মেয়াদ শেষ হওয়ার আগে SMS রিমাইন্ডার পাঠান</p>
              </div>
            </div>
            <Switch
              checked={localSettings.notification_sms_enabled === true || localSettings.notification_sms_enabled === 'true'}
              onCheckedChange={(checked) => handleChange('notification_sms_enabled', checked)}
            />
          </div>

          {/* Notification Timing */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>রিমাইন্ডার পাঠানোর সময় (দিন আগে)</Label>
              <Select 
                value={String(localSettings.notification_days_before || 3)}
                onValueChange={(value) => handleChange('notification_days_before', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">১ দিন আগে</SelectItem>
                  <SelectItem value="2">২ দিন আগে</SelectItem>
                  <SelectItem value="3">৩ দিন আগে</SelectItem>
                  <SelectItem value="5">৫ দিন আগে</SelectItem>
                  <SelectItem value="7">৭ দিন আগে</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>দৈনিক নোটিফিকেশন সময়</Label>
              <Select 
                value={getCleanValue(localSettings.notification_time_utc) || '03:00'}
                onValueChange={(value) => handleChange('notification_time_utc', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="03:00">সকাল ৯:০০ (BD Time)</SelectItem>
                  <SelectItem value="06:00">দুপুর ১২:০০ (BD Time)</SelectItem>
                  <SelectItem value="10:00">বিকাল ৪:০০ (BD Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">স্বয়ংক্রিয় নোটিফিকেশন সিস্টেম</p>
                <p className="text-xs text-muted-foreground mt-1">
                  প্রতিদিন নির্ধারিত সময়ে সিস্টেম স্বয়ংক্রিয়ভাবে চেক করে কোন ক্লায়েন্টের সাবস্ক্রিপশন শেষ হতে যাচ্ছে এবং তাদের Email/SMS পাঠায়।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
