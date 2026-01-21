import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { StaffManagement } from '@/components/settings/StaffManagement';
import { PharmacyLogoUpload } from '@/components/settings/PharmacyLogoUpload';
import { Loader2, Save, User, Building2, Globe, CreditCard, Bell, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { planType, daysRemaining, isTrial, isExpired } = useSubscriptionStatus();
  const { isAdmin } = usePermissions();
  const { soundEnabled, setSoundEnabled } = useNotificationSettings();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    pharmacy_name: '',
    address: '',
    currency: 'BDT',
    date_format: 'DD/MM/YYYY',
    language: 'en',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        pharmacy_name: profile.pharmacy_name || '',
        address: profile.address || '',
        currency: profile.currency || 'BDT',
        date_format: profile.date_format || 'DD/MM/YYYY',
        language: language, // Use language from context instead of profile
      });
    }
  }, [profile, language]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: formData.full_name || null,
      phone: formData.phone || null,
    }, {
      onSuccess: () => setHasChanges(false),
    });
  };

  const handleSavePharmacy = () => {
    updateProfile.mutate({
      pharmacy_name: formData.pharmacy_name || null,
      address: formData.address || null,
    }, {
      onSuccess: () => setHasChanges(false),
    });
  };

  const handleSavePreferences = () => {
    // Update language via context (which handles localStorage + profile sync)
    if (formData.language === 'en' || formData.language === 'bn') {
      setLanguage(formData.language);
    }
    // Update other preferences
    updateProfile.mutate({
      currency: formData.currency,
      date_format: formData.date_format,
    }, {
      onSuccess: () => setHasChanges(false),
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSubscriptionLabel = () => {
    if (isTrial) return t.settings.freeTrial;
    if (planType === 'monthly') return t.settings.monthlyPlan;
    if (planType === 'yearly') return t.settings.yearlyPlan;
    if (planType === 'lifetime') return t.settings.lifetimePlan;
    return planType || t.settings.noPlan;
  };

  const getSubscriptionStatus = () => {
    if (isExpired) return t.settings.expired;
    if (isTrial && daysRemaining) return `${daysRemaining} ${t.settings.daysRemaining}`;
    if (daysRemaining) return `${t.settings.renewsIn} ${daysRemaining} ${t.settings.days}`;
    return t.settings.active;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="icon-container-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.settings.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
            <div className="flex items-center gap-3">
              <div className="icon-container-info">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.profileInfo}</CardTitle>
                <CardDescription>{t.settings.updatePersonalInfo}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.settings.fullName}</Label>
                <Input 
                  id="fullName" 
                  placeholder={t.settings.yourName}
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.settings.email}</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.settings.phoneNumber}</Label>
              <Input 
                id="phone" 
                placeholder="+880" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={updateProfile.isPending}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {t.settings.saveChanges}
            </Button>
          </CardContent>
        </Card>

        {/* Pharmacy Information */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/30">
            <div className="flex items-center gap-3">
              <div className="icon-container-success">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.pharmacyInfo}</CardTitle>
                <CardDescription>{t.settings.updatePharmacyDetails}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Logo Upload */}
            <PharmacyLogoUpload 
              currentLogo={profile?.pharmacy_logo || null} 
              pharmacyName={formData.pharmacy_name} 
            />
            
            <div className="space-y-2">
              <Label htmlFor="pharmacyName">{t.settings.pharmacyName}</Label>
              <Input 
                id="pharmacyName" 
                placeholder={t.settings.pharmacyNamePlaceholder}
                value={formData.pharmacy_name}
                onChange={(e) => handleChange('pharmacy_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t.settings.address}</Label>
              <Input 
                id="address" 
                placeholder={t.settings.addressPlaceholder}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSavePharmacy} 
              disabled={updateProfile.isPending}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            >
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {t.settings.saveChanges}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.preferences}</CardTitle>
                <CardDescription>{t.settings.customizeExperience}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">{t.settings.currency}</Label>
                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.settings.selectCurrency} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">{t.settings.dateFormat}</Label>
                <Select value={formData.date_format} onValueChange={(v) => handleChange('date_format', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.settings.selectFormat} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t.settings.language}</Label>
                <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.settings.selectLanguage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t.settings.english}</SelectItem>
                    <SelectItem value="bn">{t.settings.bengali}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleSavePreferences} 
              disabled={updateProfile.isPending}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
            >
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {t.settings.savePreferences}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                <Moon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.appearance}</CardTitle>
                <CardDescription>{t.settings.manageAppearance}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border border-slate-200/50 dark:border-slate-800/30">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode-toggle" className="text-base font-medium">{t.settings.darkMode}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.darkModeDesc}
                </p>
              </div>
              <Switch
                id="dark-mode-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30">
            <div className="flex items-center gap-3">
              <div className="icon-container-warning">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.notifications}</CardTitle>
                <CardDescription>{t.settings.manageNotifications}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <div className="space-y-0.5">
                <Label htmlFor="sound-toggle" className="text-base font-medium">{t.settings.notificationSound}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.playSoundOnAlerts}
                </p>
              </div>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Management - Only visible to admins */}
        {isAdmin && <StaffManagement />}

        {/* Subscription */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="icon-container-success">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>{t.settings.subscription}</CardTitle>
                <CardDescription>{t.settings.manageSubscription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div>
                <p className="font-semibold text-lg">{getSubscriptionLabel()}</p>
                <p className="text-sm text-muted-foreground">{getSubscriptionStatus()}</p>
              </div>
              <Button 
                onClick={() => navigate('/billing')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {isTrial || isExpired ? t.settings.upgradePlan : t.settings.managePlan}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
