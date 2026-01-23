import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, MessageSquare, Save, Eye, EyeOff, Send, Wallet, ExternalLink, CheckCircle, Phone, Bell, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export default function SmsGatewaySettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [smsBalance, setSmsBalance] = useState<{ balance: string; currency: string } | null>(null);

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

  const sectionKeys = ['bulksmsbd_enabled', 'bulksmsbd_api_key', 'bulksmsbd_sender_id', 'sms_low_balance_threshold', 'sms_alert_email'];
  const templateKeys = ['sms_template_staff_invite', 'sms_template_password_reset', 'sms_template_subscription_expiry', 'sms_template_subscription_expired'];

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
      sectionKeys.forEach(k => changedKeys.delete(k));
      setChangedKeys(new Set(changedKeys));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success('SMS Gateway সেটিংস সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    try {
      for (const key of templateKeys) {
        if (localSettings[key] !== undefined && changedKeys.has(key)) {
          await updateSetting.mutateAsync({
            settingKey: key,
            value: localSettings[key],
          });
        }
      }
      templateKeys.forEach(k => changedKeys.delete(k));
      setChangedKeys(new Set(changedKeys));
      setSavedTemplates(true);
      setTimeout(() => setSavedTemplates(false), 3000);
      toast.success('SMS Templates সেভ হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleCheckBalance = async () => {
    const apiKey = String(localSettings.bulksmsbd_api_key || '').replace(/"/g, '');
    
    if (!apiKey) {
      toast.error('API Key প্রয়োজন');
      return;
    }
    
    setCheckingBalance(true);
    setSmsBalance(null);
    try {
      const response = await fetch(`https://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`);
      const data = await response.json();
      
      if (data.balance !== undefined) {
        setSmsBalance({
          balance: data.balance,
          currency: data.currency || 'BDT'
        });
        toast.success('ব্যালেন্স লোড হয়েছে!');
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error('Balance check error:', error);
      toast.error(error.message || 'ব্যালেন্স চেক করতে সমস্যা হয়েছে');
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone) {
      toast.error('ফোন নম্বর দিন');
      return;
    }
    
    const apiKey = String(localSettings.bulksmsbd_api_key || '').replace(/"/g, '');
    const senderId = String(localSettings.bulksmsbd_sender_id || '').replace(/"/g, '');
    
    if (!apiKey || !senderId) {
      toast.error('API Key এবং Sender ID প্রয়োজন');
      return;
    }
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-client-notification', {
        body: {
          testMode: true,
          testPhone: testPhone,
          testMessage: 'BulkSMSBD টেস্ট মেসেজ - MedFlowX থেকে পাঠানো হয়েছে।',
          testApiKey: apiKey,
          testSenderId: senderId,
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
      
      toast.success('টেস্ট SMS সফলভাবে পাঠানো হয়েছে!');
    } catch (error: any) {
      console.error('Test SMS error:', error);
      toast.error(error.message || 'SMS পাঠাতে সমস্যা হয়েছে');
    } finally {
      setTesting(false);
    }
  };

  const hasChanges = sectionKeys.some(key => changedKeys.has(key));
  const hasTemplateChanges = templateKeys.some(key => changedKeys.has(key));

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
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">SMS Gateway Settings</h1>
          <p className="text-muted-foreground">Configure BulkSMSBD for sending SMS notifications</p>
        </div>
      </div>

      {/* BulkSMSBD Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>BulkSMSBD Configuration</CardTitle>
            <CardDescription>API credentials and balance settings</CardDescription>
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
              <Label>Enable BulkSMSBD</Label>
              <p className="text-sm text-muted-foreground">Allow system to send SMS via BulkSMSBD</p>
            </div>
            <Switch
              checked={localSettings.bulksmsbd_enabled === true || localSettings.bulksmsbd_enabled === 'true'}
              onCheckedChange={(checked) => handleChange('bulksmsbd_enabled', checked)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={String(localSettings.bulksmsbd_api_key || '').replace(/"/g, '')}
                  onChange={(e) => handleChange('bulksmsbd_api_key', e.target.value)}
                  placeholder="Enter BulkSMSBD API Key"
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
              <p className="text-xs text-muted-foreground">Get API key from BulkSMSBD Dashboard</p>
            </div>
            <div className="space-y-2">
              <Label>Sender ID</Label>
              <Input
                type="text"
                value={String(localSettings.bulksmsbd_sender_id || '').replace(/"/g, '')}
                onChange={(e) => handleChange('bulksmsbd_sender_id', e.target.value)}
                placeholder="8809617XXXXXX or BRAND_NAME"
              />
              <p className="text-xs text-muted-foreground">Your approved Sender ID (Masking or Non-Masking)</p>
            </div>
          </div>

          {/* Balance Check Section */}
          <div className="border-t pt-4 mt-4">
            <Label className="mb-2 block">SMS ব্যালেন্স চেক</Label>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCheckBalance} 
                disabled={checkingBalance || !localSettings.bulksmsbd_api_key}
                variant="outline"
              >
                {checkingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                ব্যালেন্স দেখুন
              </Button>
              {smsBalance && (
                <div className={`px-4 py-2 rounded-lg border ${
                  Number(smsBalance.balance) <= Number(localSettings.sms_low_balance_threshold || 100)
                    ? 'bg-destructive/10 border-destructive/50'
                    : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <span className={`text-lg font-bold ${
                    Number(smsBalance.balance) <= Number(localSettings.sms_low_balance_threshold || 100)
                      ? 'text-destructive'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {smsBalance.balance} {smsBalance.currency}
                  </span>
                  {Number(smsBalance.balance) <= Number(localSettings.sms_low_balance_threshold || 100) && (
                    <span className="text-xs text-destructive ml-2">⚠️ Low Balance!</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Low Balance Threshold Setting */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm">Low Balance Alert Threshold (BDT)</Label>
                <Input
                  type="number"
                  value={getCleanValue(localSettings.sms_low_balance_threshold) || '100'}
                  onChange={(e) => handleChange('sms_low_balance_threshold', e.target.value)}
                  placeholder="100"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Alert Email</Label>
                <Input
                  type="email"
                  value={getCleanValue(localSettings.sms_alert_email) || ''}
                  onChange={(e) => handleChange('sms_alert_email', e.target.value)}
                  placeholder="admin@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Test SMS Section */}
          <div className="border-t pt-4 mt-4">
            <Label className="mb-2 block">টেস্ট SMS পাঠান</Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="flex-1"
              />
              <Button 
                onClick={handleTestSms} 
                disabled={testing || !localSettings.bulksmsbd_api_key || !localSettings.bulksmsbd_sender_id}
                variant="outline"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                টেস্ট SMS
              </Button>
            </div>
          </div>
          
          {/* Info box */}
          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">BulkSMSBD Integration</p>
                <p className="text-xs text-muted-foreground mt-1">
                  বাংলাদেশের সকল মোবাইল অপারেটরে SMS পাঠানো যায়। Masking (Brand Name) বা Non-Masking (Phone Number) Sender ID সাপোর্ট করে।
                </p>
                <a 
                  href="https://bulksmsbd.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Visit BulkSMSBD <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Templates */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SMS Templates</CardTitle>
            <CardDescription>Customize SMS messages for various system actions</CardDescription>
          </div>
          {savedTemplates ? (
            <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleSaveTemplates}
              disabled={savingTemplates || !hasTemplateChanges}
            >
              {savingTemplates ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Staff Invite Template */}
          <div className="space-y-2 p-4 rounded-lg border bg-card">
            <Label className="flex items-center gap-2 font-semibold">
              <Phone className="h-4 w-4 text-primary" />
              Staff Invite SMS Template
            </Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={getCleanValue(localSettings.sms_template_staff_invite) || 'MedFlowX স্টাফ অ্যাক্সেস:\nLogin: {{login_url}}\nPhone: {{phone}}\nPass: {{password}}\nপ্রথম লগইনে পাসওয়ার্ড পরিবর্তন করুন।'}
              onChange={(e) => handleChange('sms_template_staff_invite', e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Placeholders:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{staff_name}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{phone}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{password}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{pharmacy_name}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{login_url}}'}</code>
              </div>
            </div>
          </div>

          {/* Password Reset Template */}
          <div className="space-y-2 p-4 rounded-lg border bg-card">
            <Label className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Password Reset Confirmation SMS Template
            </Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={getCleanValue(localSettings.sms_template_password_reset) || '{{pharmacy_name}}, আপনার MedFlowX পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।'}
              onChange={(e) => handleChange('sms_template_password_reset', e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Placeholders:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{pharmacy_name}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{phone}}'}</code>
              </div>
            </div>
          </div>

          {/* Subscription Expiry Reminder Template */}
          <div className="space-y-2 p-4 rounded-lg border bg-card">
            <Label className="flex items-center gap-2 font-semibold">
              <Bell className="h-4 w-4 text-blue-500" />
              Subscription Expiry Reminder SMS Template
            </Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={getCleanValue(localSettings.sms_template_subscription_expiry) || '{{pharmacy_name}}, আপনার MedFlowX {{plan_type}} সাবস্ক্রিপশন {{days_remaining}} দিনের মধ্যে শেষ হবে।'}
              onChange={(e) => handleChange('sms_template_subscription_expiry', e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Placeholders:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{pharmacy_name}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{plan_type}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{days_remaining}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{expiry_date}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{billing_url}}'}</code>
              </div>
            </div>
          </div>

          {/* Subscription Expired Template */}
          <div className="space-y-2 p-4 rounded-lg border bg-card">
            <Label className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Subscription Expired SMS Template
            </Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={getCleanValue(localSettings.sms_template_subscription_expired) || '{{pharmacy_name}}, আপনার MedFlowX সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে।'}
              onChange={(e) => handleChange('sms_template_subscription_expired', e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Placeholders:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{pharmacy_name}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{plan_type}}'}</code>
                <code className="px-1.5 py-0.5 bg-muted rounded">{'{{billing_url}}'}</code>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">SMS Character Limit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  বাংলায় ৭০ ক্যারেক্টার = ১ SMS। ইংরেজিতে ১৬০ ক্যারেক্টার = ১ SMS। বেশি হলে multiple SMS charge হবে।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
