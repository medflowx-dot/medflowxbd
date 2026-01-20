import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatformSettings, useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { Loader2, Settings, Save, AlertTriangle, Mail, Eye, EyeOff, Send, CreditCard, ExternalLink, Bell, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OwnerSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

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

  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter an email address');
      return;
    }
    
    setTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: testEmailAddress,
          subject: 'SMTP Test Email - MedFlowX',
          html: '<h1>SMTP Configuration Test</h1><p>If you received this email, your SMTP settings are configured correctly!</p><p>Sent from MedFlowX Admin Panel</p>',
        },
      });
      
      if (error) throw error;
      toast.success('Test email sent successfully!');
    } catch (error: any) {
      console.error('Test email error:', error);
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
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

      {/* SMTP Email Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>SMTP Email Configuration</CardTitle>
          </div>
          <CardDescription>Configure email server for sending notifications (staff invites, etc.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input
                value={localSettings.smtp_host?.replace(/"/g, '') || ''}
                onChange={(e) => handleChange('smtp_host', `"${e.target.value}"`)}
                placeholder="smtp.gmail.com or mail.yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Select 
                value={String(localSettings.smtp_port || 587)}
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
                value={localSettings.smtp_user?.replace(/"/g, '') || ''}
                onChange={(e) => handleChange('smtp_user', `"${e.target.value}"`)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password / App Password</Label>
              <div className="relative">
                <Input
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={localSettings.smtp_password?.replace(/"/g, '') || ''}
                  onChange={(e) => handleChange('smtp_password', `"${e.target.value}"`)}
                  placeholder="••••••••••••"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                >
                  {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">For Gmail, use App Password instead of regular password</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                value={localSettings.smtp_from_email?.replace(/"/g, '') || ''}
                onChange={(e) => handleChange('smtp_from_email', `"${e.target.value}"`)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={localSettings.smtp_from_name?.replace(/"/g, '') || 'MedFlowX'}
                onChange={(e) => handleChange('smtp_from_name', `"${e.target.value}"`)}
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
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email to send test"
                className="flex-1"
              />
              <Button 
                onClick={handleTestEmail} 
                disabled={testingEmail || !localSettings.smtp_host?.replace(/"/g, '')}
                variant="outline"
              >
                {testingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
            </div>
            {!localSettings.smtp_host?.replace(/"/g, '') && (
              <p className="text-xs text-muted-foreground mt-2">Configure SMTP settings and save before testing</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>নোটিফিকেশন সেটিংস</CardTitle>
          </div>
          <CardDescription>সাবস্ক্রিপশন মেয়াদ শেষের আগে ক্লায়েন্টদের স্বয়ংক্রিয় নোটিফিকেশন পাঠানোর সেটিংস</CardDescription>
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
                value={String(localSettings.notification_time_utc || '03:00')}
                onValueChange={(value) => handleChange('notification_time_utc', `"${value}"`)}
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
                  একই দিনে একই ক্লায়েন্টকে দ্বিতীয়বার নোটিফিকেশন পাঠানো হয় না।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UddoktaPay Payment Gateway */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>UddoktaPay Payment Gateway</CardTitle>
          </div>
          <CardDescription>Configure UddoktaPay for subscription payments (bKash, Nagad, Rocket, Bank)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label>Enable UddoktaPay</Label>
              <p className="text-sm text-muted-foreground">Allow users to pay via UddoktaPay gateway</p>
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
                  value={String(localSettings.uddoktapay_api_key || '').replace(/"/g, '')}
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
                type="text"
                value={String(localSettings.uddoktapay_base_url || '').replace(/"/g, '')}
                onChange={(e) => handleChange('uddoktapay_base_url', e.target.value)}
                placeholder="https://sandbox.uddoktapay.com"
              />
              <p className="text-xs text-muted-foreground">
                Enter your UddoktaPay API base URL (e.g., https://sandbox.uddoktapay.com or your custom domain)
              </p>
            </div>
          </div>
          
          {/* Info box */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">UddoktaPay Integration</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Supports bKash, Nagad, Rocket, Upay and Bank payments. Users will be redirected to UddoktaPay checkout page to complete payment. 
                  Subscription will be activated automatically after successful payment.
                </p>
                <a 
                  href="https://uddoktapay.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
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
