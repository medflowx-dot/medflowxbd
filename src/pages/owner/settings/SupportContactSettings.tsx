import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Phone, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportContactSettings() {
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

  const sectionKeys = ['support_phone', 'support_email', 'support_whatsapp'];

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
      toast.success('Support Contact সেটিংস সেভ হয়েছে!');
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
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Support Contact</h1>
          <p className="text-muted-foreground">Contact information shown on billing page</p>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Phone, email and WhatsApp details</CardDescription>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input
                value={getCleanValue(localSettings.support_phone) || ''}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                type="email"
                value={getCleanValue(localSettings.support_email) || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={getCleanValue(localSettings.support_whatsapp) || ''}
                onChange={(e) => handleChange('support_whatsapp', e.target.value)}
                placeholder="+8801XXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">Country code সহ (e.g., +8801604334494)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
