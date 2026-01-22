import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';

interface ChangePasswordScreenProps {
  tempSession: {
    access_token: string;
    refresh_token: string;
  };
  onSuccess: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ tempSession, onSuccess, onLogout }: ChangePasswordScreenProps) {
  const { language } = useLanguage();
  const { logoAuth } = usePlatformBranding();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Change Your Password',
      description: 'For security, please set a new password before continuing.',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      changeButton: 'Change Password',
      logout: 'Logout',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordRequirements: 'Must contain uppercase, lowercase, and numbers',
      success: 'Password changed successfully!',
    },
    bn: {
      title: 'পাসওয়ার্ড পরিবর্তন করুন',
      description: 'নিরাপত্তার জন্য, অনুগ্রহ করে চালিয়ে যাওয়ার আগে একটি নতুন পাসওয়ার্ড সেট করুন।',
      currentPassword: 'বর্তমান পাসওয়ার্ড',
      newPassword: 'নতুন পাসওয়ার্ড',
      confirmPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
      changeButton: 'পাসওয়ার্ড পরিবর্তন করুন',
      logout: 'লগআউট',
      passwordMismatch: 'পাসওয়ার্ড মিলছে না',
      passwordTooShort: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে',
      passwordRequirements: 'বড় হাতের, ছোট হাতের এবং সংখ্যা থাকতে হবে',
      success: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!',
    },
  };

  const t = translations[language];

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const isValidPassword = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!isValidPassword) {
      setError(t.passwordRequirements);
      return;
    }

    if (!passwordsMatch) {
      setError(t.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('change-temp-password', {
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
        headers: {
          Authorization: `Bearer ${tempSession.access_token}`,
        },
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(fnError, data);

      if (errorData?.error) {
        setError(errorData.error);
        setIsLoading(false);
        return;
      }
      
      if (fnError && !data) {
        throw fnError;
      }

      // Set new session if returned
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Success - redirect to dashboard
      onSuccess();

    } catch (err) {
      console.error('Password change error:', err);
      const errorData = await parseEdgeFunctionError(err as Error, null);
      setError(errorData?.error || (err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-primary' : 'text-muted-foreground'}`}>
      {met ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/50" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center pb-2">
          {logoAuth && (
            <img 
              src={logoAuth} 
              alt="MedFlowX" 
              className="h-12 mx-auto mb-4 object-contain"
            />
          )}
          <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t.currentPassword}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t.newPassword}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password requirements */}
              {newPassword && (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-1.5">
                  <PasswordRequirement met={hasMinLength} text={language === 'bn' ? 'কমপক্ষে ৮ অক্ষর' : 'At least 8 characters'} />
                  <PasswordRequirement met={hasUpperCase} text={language === 'bn' ? 'একটি বড় হাতের অক্ষর' : 'One uppercase letter'} />
                  <PasswordRequirement met={hasLowerCase} text={language === 'bn' ? 'একটি ছোট হাতের অক্ষর' : 'One lowercase letter'} />
                  <PasswordRequirement met={hasNumbers} text={language === 'bn' ? 'একটি সংখ্যা' : 'One number'} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`pr-10 ${confirmPassword && !passwordsMatch ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">{t.passwordMismatch}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isValidPassword || !passwordsMatch || !currentPassword}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.changeButton}
            </Button>

            {/* Logout option */}
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onLogout}
            >
              {t.logout}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
