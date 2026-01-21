import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Phone, CheckCircle2, AlertCircle, Loader2, Shield, Clock } from 'lucide-react';

interface PhoneVerificationProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
}

export function PhoneVerification({ phone, onPhoneChange }: PhoneVerificationProps) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { t } = useLanguage();
  
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const {
    otpTimeRemaining,
    resendTimeRemaining,
    isOtpExpired,
    canResend,
    formatTime,
    startTimers,
    resetTimers,
  } = useOtpTimer();

  const isVerified = profile?.phone_verified && profile?.phone === phone;
  const hasPhoneChanged = profile?.phone !== phone;

  // Reset verification status when phone changes
  useEffect(() => {
    if (hasPhoneChanged) {
      setError('');
    }
  }, [hasPhoneChanged]);

  const formatPhoneForApi = (phoneNumber: string): string => {
    let formatted = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    }
    if (formatted.startsWith('0')) {
      formatted = '880' + formatted.substring(1);
    } else if (!formatted.startsWith('880')) {
      formatted = '880' + formatted;
    }
    return formatted;
  };

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error(t.phoneVerification?.enterPhone || 'Please enter a phone number');
      return;
    }

    setIsSendingOtp(true);
    setError('');
    
    try {
      const formattedPhone = formatPhoneForApi(phone);
      
      const { data, error: funcError } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone, purpose: 'verification' },
      });

      if (funcError) throw funcError;
      if (data?.error) throw new Error(data.error);

      toast.success(t.phoneVerification?.otpSent || 'OTP sent to your phone');
      setShowVerifyDialog(true);
      startTimers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(t.phoneVerification?.enterCompleteOtp || 'Please enter the complete 6-digit OTP');
      return;
    }

    if (isOtpExpired) {
      setError(t.phoneVerification?.otpExpired || 'OTP has expired. Please request a new one.');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const formattedPhone = formatPhoneForApi(phone);
      
      const { data, error: funcError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: formattedPhone, otp, purpose: 'verification' },
      });

      if (funcError) throw funcError;
      if (data?.error) throw new Error(data.error);

      // Update profile with verified phone
      await updateProfile.mutateAsync({
        phone: phone, // Save in original format
        phone_verified: true,
      });

      toast.success(t.phoneVerification?.verified || 'Phone number verified successfully!');
      setShowVerifyDialog(false);
      setOtp('');
      resetTimers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setOtp('');
    setError('');
    await handleSendOtp();
  };

  const handleDialogClose = () => {
    setShowVerifyDialog(false);
    setOtp('');
    setError('');
    resetTimers();
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">{t.settings.phoneNumber}</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input 
              id="phone" 
              placeholder="+880" 
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="pr-24"
            />
            {isVerified && !hasPhoneChanged && (
              <Badge 
                variant="secondary" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t.phoneVerification?.verified || 'Verified'}
              </Badge>
            )}
          </div>
          {(!isVerified || hasPhoneChanged) && phone && (
            <Button 
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={isSendingOtp || !phone}
              className="shrink-0"
            >
              {isSendingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t.phoneVerification?.verify || 'Verify'}
                </>
              )}
            </Button>
          )}
        </div>
        {hasPhoneChanged && profile?.phone_verified && (
          <p className="text-sm text-warning flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t.phoneVerification?.needsReverification || 'Phone number changed. Re-verification required.'}
          </p>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              {t.phoneVerification?.verifyPhone || 'Verify Phone Number'}
            </DialogTitle>
            <DialogDescription>
              {t.phoneVerification?.otpSentTo || 'We sent a 6-digit OTP to'} <strong>{phone}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* OTP Timer Status */}
            <div className={`p-3 rounded-lg text-center ${
              isOtpExpired 
                ? 'bg-destructive/10 text-destructive' 
                : otpTimeRemaining <= 60 
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' 
                  : 'bg-primary/10 text-primary'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                {isOtpExpired 
                  ? (t.phoneVerification?.otpExpiredMessage || 'OTP expired. Request a new one.')
                  : (
                    <span>
                      {t.phoneVerification?.otpValidFor || 'OTP valid for'}: <strong>{formatTime(otpTimeRemaining)}</strong>
                    </span>
                  )
                }
              </div>
            </div>

            {/* OTP Input */}
            <div className="flex flex-col items-center gap-4">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                disabled={isOtpExpired}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleVerifyOtp} 
                disabled={isVerifying || otp.length !== 6 || isOtpExpired}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.phoneVerification?.verifying || 'Verifying...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t.phoneVerification?.verifyOtp || 'Verify OTP'}
                  </>
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleResendOtp}
                disabled={!canResend || isSendingOtp}
                className="w-full"
              >
                {isSendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : canResend ? (
                  t.phoneVerification?.resendOtp || 'Resend OTP'
                ) : (
                  <span className="text-muted-foreground">
                    {formatTime(resendTimeRemaining)} {t.phoneVerification?.afterResend || 'to resend'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
