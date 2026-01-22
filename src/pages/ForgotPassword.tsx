import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Phone, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Timer, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import logoAuthFallback from '@/assets/logo-auth.png';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

type ResetStep = 'phone' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState<ResetStep>('phone');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // OTP Timer
  const { 
    otpTimeRemaining, 
    resendTimeRemaining, 
    isOtpExpired, 
    canResend, 
    startTimers, 
    resetTimers, 
    formatTime 
  } = useOtpTimer();

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) {
      toast.error('সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)');
      return;
    }

    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose: 'reset' }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setSendingOtp(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      toast.success('OTP পাঠানো হয়েছে!');
      startTimers();
      setStep('otp');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OTP পাঠাতে ব্যর্থ';
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (isOtpExpired) {
      toast.error('OTP মেয়াদোত্তীর্ণ হয়েছে। নতুন OTP নিন।');
      return;
    }
    
    if (otp.length !== 6) {
      toast.error('৬ ডিজিটের OTP দিন');
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, otp, purpose: 'reset' }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setVerifyingOtp(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      setVerificationToken(data.verificationToken);
      toast.success('OTP যাচাই সফল!');
      setStep('password');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OTP যাচাই ব্যর্থ';
      toast.error(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }

    setResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { phone, verificationToken, newPassword }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setResettingPassword(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      toast.success('পাসওয়ার্ড রিসেট সফল!');
      setStep('success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পাসওয়ার্ড রিসেট ব্যর্থ';
      toast.error(message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose: 'reset' }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setSendingOtp(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      toast.success('নতুন OTP পাঠানো হয়েছে!');
      setOtp('');
      resetTimers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OTP পাঠাতে ব্যর্থ';
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
        <Card className="w-full max-w-md shadow-elegant text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">পাসওয়ার্ড রিসেট সফল!</CardTitle>
              <CardDescription className="mt-2">
                আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              লগইন করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-8">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={platformLogo} alt="MedFlowx" className="h-16 w-auto" />
          </Link>
          <div>
            <CardTitle className="text-2xl font-display">পাসওয়ার্ড রিসেট করুন</CardTitle>
            <CardDescription>মোবাইল নাম্বার দিয়ে পাসওয়ার্ড পুনরুদ্ধার করুন</CardDescription>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${step === 'phone' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`w-8 h-0.5 ${step !== 'phone' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-primary' : step === 'password' ? 'bg-primary/30' : 'bg-muted'}`} />
            <div className={`w-8 h-0.5 ${step === 'password' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'password' ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">মোবাইল নাম্বার</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
                    className="pl-10"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  রেজিস্টার্ড মোবাইল নাম্বারে OTP পাঠানো হবে
                </p>
              </div>
              
              <Button 
                onClick={handleSendOtp} 
                className="w-full" 
                disabled={sendingOtp || phone.length < 11}
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    OTP পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    OTP পাঠান
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                লগইন পেজে ফিরে যান
              </Button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{phone}</strong> নাম্বারে ৬ ডিজিটের OTP পাঠানো হয়েছে
                </p>
              </div>

              {/* OTP Timer Display */}
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                isOtpExpired 
                  ? 'bg-destructive/10 text-destructive' 
                  : otpTimeRemaining <= 60 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-primary/10 text-primary'
              }`}>
                {isOtpExpired ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">OTP মেয়াদোত্তীর্ণ। নতুন OTP নিন।</span>
                  </>
                ) : (
                  <>
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      OTP মেয়াদ: {formatTime(otpTimeRemaining)}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex justify-center">
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

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  পিছনে
                </Button>
                <Button 
                  onClick={handleVerifyOtp} 
                  className="flex-1" 
                  disabled={verifyingOtp || otp.length !== 6 || isOtpExpired}
                >
                  {verifyingOtp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'যাচাই করুন'
                  )}
                </Button>
              </div>

              <div className="text-center">
                {canResend ? (
                  <Button 
                    variant="link" 
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-sm"
                  >
                    {sendingOtp ? 'পাঠানো হচ্ছে...' : 'আবার OTP পাঠান'}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {formatTime(resendTimeRemaining)} পর আবার পাঠাতে পারবেন
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">কমপক্ষে ৬ অক্ষর</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep('otp')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  পিছনে
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={resettingPassword}
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      রিসেট হচ্ছে...
                    </>
                  ) : (
                    'পাসওয়ার্ড রিসেট করুন'
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">পাসওয়ার্ড মনে আছে? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              সাইন ইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
