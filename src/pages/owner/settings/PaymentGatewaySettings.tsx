import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, CreditCard, Save, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentGatewaySettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

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

  const sectionKeys = ['uddoktapay_enabled', 'uddoktapay_api_key', 'uddoktapay_base_url'];

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
      toast.success('Payment Gateway সেটিংস সেভ হয়েছে!');
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
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payment Gateway Settings</h1>
          <p className="text-muted-foreground">Configure UddoktaPay for accepting payments</p>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>UddoktaPay Configuration</CardTitle>
            <CardDescription>API credentials for payment processing</CardDescription>
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
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label>Enable UddoktaPay</Label>
              <p className="text-sm text-muted-foreground">Accept payments via UddoktaPay gateway</p>
            </div>
            <Switch
              checked={localSettings.uddoktapay_enabled === true || localSettings.uddoktapay_enabled === 'true'}
              onCheckedChange={(checked) => handleChange('uddoktapay_enabled', checked)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={getCleanValue(localSettings.uddoktapay_api_key) || ''}
                  onChange={(e) => handleChange('uddoktapay_api_key', e.target.value)}
                  placeholder="Enter UddoktaPay API Key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Get API key from UddoktaPay Dashboard</p>
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={getCleanValue(localSettings.uddoktapay_base_url) || 'https://sandbox.uddoktapay.com/api'}
                onChange={(e) => handleChange('uddoktapay_base_url', e.target.value)}
                placeholder="https://sandbox.uddoktapay.com/api"
              />
              <p className="text-xs text-muted-foreground">
                Sandbox: https://sandbox.uddoktapay.com/api | Live: https://pay.uddoktapay.com/api
              </p>
            </div>
          </div>
          
          {/* Info box */}
          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">UddoktaPay Integration</p>
                <p className="text-xs text-muted-foreground mt-1">
                  বাংলাদেশে bKash, Nagad, Rocket, Cards এবং Internet Banking এর মাধ্যমে পেমেন্ট গ্রহণ করুন।
                  Sandbox মোডে টেস্ট করুন এবং তারপর Live API Key দিয়ে প্রোডাকশনে যান।
                </p>
                <a 
                  href="https://uddoktapay.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Visit UddoktaPay <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
