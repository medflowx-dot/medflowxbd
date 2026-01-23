import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Palette, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PlatformBrandingUpload } from '@/components/owner/PlatformBrandingUpload';

export default function BrandingSettings() {
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

  const sectionKeys = ['platform_name', 'default_currency'];

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
      toast.success('Branding সেটিংস সেভ হয়েছে!');
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
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Branding Settings</h1>
          <p className="text-muted-foreground">Platform name, currency and visual identity</p>
        </div>
      </div>

      {/* Platform Branding Assets Upload */}
      <PlatformBrandingUpload settings={localSettings} />

      {/* Branding Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Platform Identity</CardTitle>
            <CardDescription>Platform name and default currency</CardDescription>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input
                value={getCleanValue(localSettings.platform_name) || ''}
                onChange={(e) => handleChange('platform_name', e.target.value)}
                placeholder="MedFlowX"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select 
                value={getCleanValue(localSettings.default_currency) || 'BDT'}
                onValueChange={(value) => handleChange('default_currency', value)}
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
    </div>
  );
}
