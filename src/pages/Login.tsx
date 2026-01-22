import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, Phone, Mail, Lock, Smartphone, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import logoAuthFallback from '@/assets/logo-auth.png';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseEdgeFunctionError, getErrorMessage } from '@/lib/edgeFunctionError';
import { ChangePasswordScreen } from '@/components/auth/ChangePasswordScreen';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const { logoAuth } = usePlatformBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  
  // Detect if running in a mobile app context
  const [isMobileApp, setIsMobileApp] = useState(false);
  
  useEffect(() => {
    // Check if running in Capacitor or similar mobile wrapper
    const isCapacitor = typeof (window as { Capacitor?: unknown }).Capacitor !== 'undefined';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsMobileApp(isCapacitor || isStandalone);
  }, []);
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Tab state
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  
  // Email login states
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Phone login states
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  
  // Phone Lock state
  const [isPhoneLocked, setIsPhoneLocked] = useState(false);
  const [phoneLockRemainingMinutes, setPhoneLockRemainingMinutes] = useState(0);
  const [phoneAttemptsRemaining, setPhoneAttemptsRemaining] = useState<number | null>(null);
  
  // Email Lock state
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [emailLockRemainingMinutes, setEmailLockRemainingMinutes] = useState(0);
  const [emailAttemptsRemaining, setEmailAttemptsRemaining] = useState<number | null>(null);
  
  // PIN states (only for mobile app)
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'setup' | 'confirm'>('setup');
  const [pinLoading, setPinLoading] = useState(false);
  const [hasPinSetup, setHasPinSetup] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [loginPin, setLoginPin] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [pinAttemptsRemaining, setPinAttemptsRemaining] = useState<number | null>(null);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [pinLockRemainingMinutes, setPinLockRemainingMinutes] = useState(0);

  // Password change flow state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [tempSession, setTempSession] = useState<{ access_token: string; refresh_token: string } | null>(null);

  // Check for saved user and PIN on mount (mobile app only)
  useEffect(() => {
    const initializePinLogin = async () => {
      if (!isMobileApp) return;
      
      const savedUserId = localStorage.getItem('medflowx_user_id');
      const savedSession = localStorage.getItem('medflowx_session');
      
      if (savedUserId && savedSession) {
        setUserId(savedUserId);
        
        try {
          // First restore the session so we can query the database
          const sessionData = JSON.parse(savedSession);
          if (sessionData?.refresh_token) {
            // Try to refresh the session to get a valid access token
            const { data: refreshedSession, error: refreshError } = await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token
            });
            
            if (!refreshError && refreshedSession?.session) {
              // Session is valid, now check if user has PIN
              await checkUserHasPin(savedUserId);
              
              // Update stored session with refreshed tokens
              localStorage.setItem('medflowx_session', JSON.stringify(refreshedSession.session));
            } else {
              console.log('Session refresh failed, clearing stored data');
              // Session invalid, clear stored data
              localStorage.removeItem('medflowx_session');
              localStorage.removeItem('medflowx_user_id');
              setUserId(null);
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          // Clear invalid session data
          localStorage.removeItem('medflowx_session');
          localStorage.removeItem('medflowx_user_id');
          setUserId(null);
        }
      }
    };
    
    initializePinLogin();
  }, [isMobileApp]);

  const checkUserHasPin = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_pins')
        .select('id, is_active')
        .eq('user_id', uid)
        .eq('is_active', true)
        .single();
      
      if (data && !error) {
        setHasPinSetup(true);
        setShowPinLogin(true);
      } else {
        console.log('No PIN found or error:', error?.message);
      }
    } catch (err) {
      console.error('Error checking PIN:', err);
    }
  };

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  // Email login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEmailLocked) {
      toast.error(`অ্যাকাউন্ট লক আছে। ${emailLockRemainingMinutes} মিনিট পর চেষ্টা করুন।`);
      return;
    }
    
    setEmailLoading(true);
    setEmailAttemptsRemaining(null);

    try {
      const { data, error } = await supabase.functions.invoke('email-login', {
        body: { email, password: emailPassword }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        // Check for lock status
        if (errorData.locked) {
          setIsEmailLocked(true);
          setEmailLockRemainingMinutes(errorData.remainingMinutes || 15);
          toast.error(errorData.error);
          setEmailLoading(false);
          return;
        }
        
        // Check for attempts remaining
        if (errorData.attemptsRemaining !== undefined) {
          setEmailAttemptsRemaining(errorData.attemptsRemaining);
        }
        
        toast.error(errorData.error);
        setEmailLoading(false);
        return;
      }
      
      // Network/SDK level error (no data and no parseable error)
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      // Successful login - reset states
      setIsEmailLocked(false);
      setEmailAttemptsRemaining(null);

      // Check if password change is required
      if (data?.mustChangePassword && data?.session) {
        setTempSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setShowPasswordChange(true);
        setEmailLoading(false);
        return;
      }

      // Set the session
      if (data?.session) {
        await supabase.auth.setSession(data.session);
        
        // Save session for PIN login (mobile app only)
        if (isMobileApp) {
          localStorage.setItem('medflowx_user_id', data.user.id);
          localStorage.setItem('medflowx_session', JSON.stringify(data.session));
          setUserId(data.user.id);
        }
        
        toast.success(t.login.welcome || 'স্বাগতম!');
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'লগইন ব্যর্থ';
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  // Phone login handler
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 11) {
      toast.error('সঠিক মোবাইল নাম্বার দিন');
      return;
    }

    if (isPhoneLocked) {
      toast.error(`অ্যাকাউন্ট লক আছে। ${phoneLockRemainingMinutes} মিনিট পর চেষ্টা করুন।`);
      return;
    }

    setPhoneLoading(true);
    setPhoneAttemptsRemaining(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('phone-login', {
        body: { phone, password: phonePassword }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        // Check for lock status
        if (errorData.locked) {
          setIsPhoneLocked(true);
          setPhoneLockRemainingMinutes(errorData.remainingMinutes || 15);
          toast.error(errorData.error);
          setPhoneLoading(false);
          return;
        }
        
        // Check for attempts remaining
        if (errorData.attemptsRemaining !== undefined) {
          setPhoneAttemptsRemaining(errorData.attemptsRemaining);
        }
        
        toast.error(errorData.error);
        setPhoneLoading(false);
        return;
      }
      
      // Network/SDK level error (no data and no parseable error)
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      // Successful login - reset states
      setIsPhoneLocked(false);
      setPhoneAttemptsRemaining(null);

      // Check if password change is required
      if (data?.mustChangePassword && data?.session) {
        setTempSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setShowPasswordChange(true);
        setPhoneLoading(false);
        return;
      }

      // Set the session
      if (data?.session) {
        await supabase.auth.setSession(data.session);
        
        // Save user ID and session for PIN login (mobile app only)
        if (isMobileApp) {
          localStorage.setItem('medflowx_user_id', data.user.id);
          localStorage.setItem('medflowx_session', JSON.stringify(data.session));
          setUserId(data.user.id);
          
          // Check if PIN is set up
          if (!data.hasPinSetup) {
            setShowPinSetup(true);
            toast.success(t.login.loginSuccessPinSetup || 'লগইন সফল! এখন পিন সেটআপ করুন।');
            setPhoneLoading(false);
            return;
          }
        }
        
        toast.success(t.login.welcome || 'স্বাগতম!');
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'লগইন ব্যর্থ';
      toast.error(message);
    } finally {
      setPhoneLoading(false);
    }
  };

  // PIN setup handler
  const handlePinSetup = async () => {
    if (pin.length !== 4) {
      toast.error('৪ ডিজিটের পিন দিন');
      return;
    }

    if (pinStep === 'setup') {
      setPinStep('confirm');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('পিন মিলছে না');
      setConfirmPin('');
      setPinStep('setup');
      return;
    }

    setPinLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'setup', pin },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setPinLoading(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      // Refresh and save the session after PIN setup
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession && isMobileApp) {
        localStorage.setItem('medflowx_session', JSON.stringify(currentSession));
      }

      toast.success(t.login.pinSetupSuccess || 'পিন সেটআপ সফল!');
      setShowPinSetup(false);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পিন সেটআপ ব্যর্থ';
      toast.error(message);
    } finally {
      setPinLoading(false);
    }
  };

  // PIN login handler
  const handlePinLogin = async (pinValue?: string) => {
    const pinToVerify = pinValue || loginPin;
    if (pinToVerify.length !== 4) return;
    setPinLoading(true);
    try {
      const savedSession = localStorage.getItem('medflowx_session');
      
      if (!savedSession) {
        toast.error(t.login.sessionExpired || 'সেশন মেয়াদোত্তীর্ণ। পাসওয়ার্ড দিয়ে লগইন করুন।');
        setShowPinLogin(false);
        setPinLoading(false);
        return;
      }

      const storedSession = JSON.parse(savedSession);
      
      // Try to refresh the session first (handles expired access tokens)
      let activeSession = storedSession;
      try {
        const { data: refreshed, error: refreshError } = await supabase.auth.setSession({
          access_token: storedSession.access_token,
          refresh_token: storedSession.refresh_token
        });
        
        if (refreshError || !refreshed.session) {
          throw new Error('Session refresh failed');
        }
        
        activeSession = refreshed.session;
        // Save the refreshed session
        localStorage.setItem('medflowx_session', JSON.stringify(activeSession));
      } catch {
        // If refresh fails, redirect to password login
        toast.error(t.login.sessionExpired || 'সেশন মেয়াদোত্তীর্ণ। পাসওয়ার্ড দিয়ে লগইন করুন।');
        switchToPasswordLogin();
        setPinLoading(false);
        return;
      }
      
      // Verify PIN with refreshed session
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'verify', pin: pinToVerify },
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        // Check for lock status
        if (errorData.locked) {
          setIsPinLocked(true);
          const lockedUntil = errorData.lockedUntil as string;
          const remainingMinutes = Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 60000);
          setPinLockRemainingMinutes(remainingMinutes > 0 ? remainingMinutes : 15);
          toast.error(`পিন লক আছে। ${remainingMinutes} মিনিট পর চেষ্টা করুন।`);
          setLoginPin('');
          setPinLoading(false);
          return;
        }
        
        // Check for attempts remaining
        if (errorData.attemptsRemaining !== undefined) {
          setPinAttemptsRemaining(errorData.attemptsRemaining);
        }
        
        toast.error(errorData.error);
        setLoginPin('');
        setPinLoading(false);
        return;
      }
      
      // Network/SDK level error
      if (error && !data) {
        throw new Error(t.login.connectionError || 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      // Session is already set by setSession above, just navigate
      toast.success(t.login.welcome || 'স্বাগতম!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (t.login.pinVerifyFailed || 'পিন যাচাই ব্যর্থ');
      toast.error(message);
      setLoginPin('');
    } finally {
      setPinLoading(false);
    }
  };

  // Skip PIN for now
  const skipPinSetup = () => {
    setShowPinSetup(false);
    navigate(from, { replace: true });
  };

  // Switch to password login
  const switchToPasswordLogin = () => {
    setShowPinLogin(false);
    localStorage.removeItem('medflowx_user_id');
    localStorage.removeItem('medflowx_session');
  };

  // Password Change Screen (for staff with temp password)
  if (showPasswordChange && tempSession) {
    return (
      <ChangePasswordScreen
        tempSession={tempSession}
        onSuccess={() => {
          setShowPasswordChange(false);
          setTempSession(null);
          toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!');
          navigate(from, { replace: true });
        }}
        onLogout={() => {
          setShowPasswordChange(false);
          setTempSession(null);
          setEmail('');
          setEmailPassword('');
          setPhone('');
          setPhonePassword('');
        }}
      />
    );
  }

  // PIN Setup Screen
  if (showPinSetup && isMobileApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">
                {pinStep === 'setup' ? t.login.pinSetupTitle : t.login.pinConfirmTitle}
              </CardTitle>
              <CardDescription>
                {pinStep === 'setup' 
                  ? t.login.pinSetupDesc
                  : t.login.enterPinAgain
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={4} 
                value={pinStep === 'setup' ? pin : confirmPin}
                onChange={pinStep === 'setup' ? setPin : setConfirmPin}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handlePinSetup} 
              className="w-full" 
              disabled={pinLoading || (pinStep === 'setup' ? pin.length !== 4 : confirmPin.length !== 4)}
            >
              {pinLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pinStep === 'setup' ? (
                t.login.next
              ) : (
                t.login.setPin
              )}
            </Button>

            <Button variant="ghost" onClick={skipPinSetup} className="w-full">
              {t.login.skipForNow}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PIN Login Screen (mobile app only)
  if (showPinLogin && isMobileApp && hasPinSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center justify-center">
              <img 
                src={logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth} 
                alt="MedFlowx" 
                className="h-16 w-auto" 
              />
            </Link>
            <div>
              <CardTitle className="text-2xl font-display">{t.login.loginWithPin}</CardTitle>
              <CardDescription>{t.login.enterYour4DigitPin}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <InputOTP 
                maxLength={4} 
                value={loginPin}
                disabled={pinLoading || isPinLocked}
                onChange={(value) => {
                  setLoginPin(value);
                  if (value.length === 4 && !pinLoading) {
                    handlePinLogin(value);
                  }
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>

              {/* Loading Spinner */}
              {pinLoading && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">যাচাই করা হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* PIN Lock Warning */}
            {isPinLocked && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  পিন লক আছে। {pinLockRemainingMinutes} মিনিট পর চেষ্টা করুন।
                </AlertDescription>
              </Alert>
            )}

            {/* PIN Attempts Warning */}
            {!isPinLocked && pinAttemptsRemaining !== null && pinAttemptsRemaining <= 3 && (
              <Alert variant={pinAttemptsRemaining <= 1 ? "destructive" : "default"} className="border-warning/50 bg-warning/10">
                <ShieldAlert className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  সতর্কতা: আর মাত্র {pinAttemptsRemaining} বার চেষ্টা বাকি। এরপর পিন লক হয়ে যাবে।
                </AlertDescription>
              </Alert>
            )}

            <Button 
              variant="ghost" 
              onClick={switchToPasswordLogin} 
              className="w-full"
              disabled={pinLoading}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              {t.login.loginWithPassword}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center">
            <img 
              src={logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth} 
              alt="MedFlowx" 
              className="h-16 w-auto" 
            />
          </Link>
          <div>
            <CardTitle className="text-2xl font-display">{t.login.welcome}</CardTitle>
            <CardDescription>{t.login.signInToPharmacy}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'phone' | 'email')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t.login.mobile}
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t.login.email}
              </TabsTrigger>
            </TabsList>

            {/* Phone Login */}
            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                {/* Lock Alert */}
                {isPhoneLocked && (
                  <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      {t.login.accountLocked.replace('{minutes}', String(phoneLockRemainingMinutes))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Attempts Warning */}
                {phoneAttemptsRemaining !== null && phoneAttemptsRemaining <= 3 && !isPhoneLocked && (
                  <Alert className="border-warning bg-warning/10 text-warning-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      {t.login.attemptsWarning.replace('{attempts}', String(phoneAttemptsRemaining))}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.login.mobileNumber}</Label>
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
                      required
                      disabled={isPhoneLocked}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonePassword">{t.login.password}</Label>
                  <div className="relative">
                    <Input
                      id="phonePassword"
                      type={showPhonePassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={phonePassword}
                      onChange={(e) => setPhonePassword(e.target.value)}
                      required
                      disabled={isPhoneLocked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPhonePassword(!showPhonePassword)}
                    >
                      {showPhonePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={phoneLoading || isPhoneLocked}>
                  {phoneLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.login.signingIn}
                    </>
                  ) : isPhoneLocked ? (
                    t.login.waitMinutes.replace('{minutes}', String(phoneLockRemainingMinutes))
                  ) : (
                    t.login.signIn
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Email Login */}
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Lock Alert */}
                {isEmailLocked && (
                  <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      {t.login.accountLocked.replace('{minutes}', String(emailLockRemainingMinutes))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Attempts Warning */}
                {emailAttemptsRemaining !== null && emailAttemptsRemaining <= 3 && !isEmailLocked && (
                  <Alert className="border-warning bg-warning/10 text-warning-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      {t.login.attemptsWarning.replace('{attempts}', String(emailAttemptsRemaining))}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t.login.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@pharmacy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isEmailLocked}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPassword">{t.login.password}</Label>
                  <div className="relative">
                    <Input
                      id="emailPassword"
                      type={showEmailPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      disabled={isEmailLocked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                    >
                      {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={emailLoading || isEmailLocked}>
                  {emailLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.login.signingIn}
                    </>
                  ) : isEmailLocked ? (
                    t.login.waitMinutes.replace('{minutes}', String(emailLockRemainingMinutes))
                  ) : (
                    t.login.signIn
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              {t.login.forgotPassword}
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">{t.login.noAccount} </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t.login.startFreeTrial}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
