import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Mail, Save, Eye, EyeOff, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export default function SmtpSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

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

  const sectionKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email', 'smtp_from_name', 'smtp_secure'];

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
      toast.success('SMTP সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('ইমেইল অ্যাড্রেস দিন');
      return;
    }
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: testEmail,
          subject: 'SMTP Test Email - MedFlowX',
          html: '<h1>SMTP Configuration Test</h1><p>If you received this email, your SMTP settings are configured correctly!</p><p>Sent from MedFlowX Admin Panel</p>',
        },
      });
      
      const errorData = await parseEdgeFunctionError(error, data);
      if (errorData?.error) {
        toast.error(errorData.error);
        return;
      }
      
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না।');
      }
      
      toast.success('টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!');
    } catch (error: any) {
      console.error('Test email error:', error);
      toast.error(error.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে');
    } finally {
      setTesting(false);
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
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">SMTP Configuration</h1>
          <p className="text-muted-foreground">Configure email server for sending notifications</p>
        </div>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Email Server Settings</CardTitle>
            <CardDescription>SMTP host, port and authentication</CardDescription>
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
              <Label>SMTP Host</Label>
              <Input
                value={getCleanValue(localSettings.smtp_host) || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com or mail.yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Select 
                value={String(getCleanValue(localSettings.smtp_port) || 587)}
                onValueChange={(value) => handleChange('smtp_port', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="587">587 (TLS - Recommended)</SelectItem>
                  <SelectItem value="465">465 (SSL)</SelectItem>
                  <SelectItem value="25">25 (Plain - Not Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Username / Email</Label>
              <Input
                value={getCleanValue(localSettings.smtp_user) || ''}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password / App Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={getCleanValue(localSettings.smtp_password) || ''}
                  onChange={(e) => handleChange('smtp_password', e.target.value)}
                  placeholder="••••••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">For Gmail, use App Password instead of regular password</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                value={getCleanValue(localSettings.smtp_from_email) || ''}
                onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={getCleanValue(localSettings.smtp_from_name) || 'MedFlowX'}
                onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                placeholder="MedFlowX"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label>Use TLS/SSL</Label>
              <p className="text-sm text-muted-foreground">Enable secure connection (recommended)</p>
            </div>
            <Switch
              checked={localSettings.smtp_secure === true || localSettings.smtp_secure === 'true'}
              onCheckedChange={(checked) => handleChange('smtp_secure', checked)}
            />
          </div>
          
          {/* Test Email Section */}
          <div className="border-t pt-4 mt-4">
            <Label className="mb-2 block">Test SMTP Configuration</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to send test"
                className="flex-1"
              />
              <Button 
                onClick={handleTestEmail} 
                disabled={testing || !getCleanValue(localSettings.smtp_host)}
                variant="outline"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
            </div>
            {!getCleanValue(localSettings.smtp_host) && (
              <p className="text-xs text-muted-foreground mt-2">Configure SMTP settings and save before testing</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
