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
import { StaffManagement } from '@/components/settings/StaffManagement';
import { PharmacyLogoUpload } from '@/components/settings/PharmacyLogoUpload';
import { Loader2, Save, User, Building2, Globe, CreditCard, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { planType, daysRemaining, isTrial, isExpired } = useSubscriptionStatus();
  const { isAdmin } = usePermissions();
  const { soundEnabled, setSoundEnabled } = useNotificationSettings();

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
        language: profile.language || 'en',
      });
    }
  }, [profile]);

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
    updateProfile.mutate({
      currency: formData.currency,
      date_format: formData.date_format,
      language: formData.language,
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
    if (isTrial) return 'Free Trial';
    if (planType === 'monthly') return 'Monthly Plan';
    if (planType === 'yearly') return 'Yearly Plan';
    if (planType === 'lifetime') return 'Lifetime Plan';
    return planType || 'No Plan';
  };

  const getSubscriptionStatus = () => {
    if (isExpired) return 'Expired';
    if (isTrial && daysRemaining) return `${daysRemaining} days remaining`;
    if (daysRemaining) return `Renews in ${daysRemaining} days`;
    return 'Active';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and pharmacy settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="Your name" 
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+880" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Pharmacy Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Pharmacy Information</CardTitle>
            </div>
            <CardDescription>Update your pharmacy details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <PharmacyLogoUpload 
              currentLogo={profile?.pharmacy_logo || null} 
              pharmacyName={formData.pharmacy_name} 
            />
            
            <div className="space-y-2">
              <Label htmlFor="pharmacyName">Pharmacy Name</Label>
              <Input 
                id="pharmacyName" 
                placeholder="City Pharmacy" 
                value={formData.pharmacy_name}
                onChange={(e) => handleChange('pharmacy_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="123 Main Street, Dhaka" 
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <Button onClick={handleSavePharmacy} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={formData.date_format} onValueChange={(v) => handleChange('date_format', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSavePreferences} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-toggle" className="text-base">Notification Sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play a sound when new alerts appear
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium">{getSubscriptionLabel()}</p>
                <p className="text-sm text-muted-foreground">{getSubscriptionStatus()}</p>
              </div>
              <Button onClick={() => navigate('/billing')}>
                {isTrial || isExpired ? 'Upgrade Plan' : 'Manage Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
