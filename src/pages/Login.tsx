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

export default function Login() {
  const { logoAuth } = usePlatformBranding();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
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

  // Check for saved user and PIN on mount (mobile app only)
  useEffect(() => {
    if (isMobileApp) {
      const savedUserId = localStorage.getItem('medflowx_user_id');
      if (savedUserId) {
        setUserId(savedUserId);
        // Check if user has PIN
        checkUserHasPin(savedUserId);
      }
    }
  }, [isMobileApp]);

  const checkUserHasPin = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('user_pins')
        .select('id, is_active')
        .eq('user_id', uid)
        .eq('is_active', true)
        .single();
      
      if (data) {
        setHasPinSetup(true);
        setShowPinLogin(true);
      }
    } catch {
      // No PIN set up
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

      if (error) throw error;
      
      // Check for lock status
      if (data.locked) {
        setIsEmailLocked(true);
        setEmailLockRemainingMinutes(data.remainingMinutes || 15);
        toast.error(data.error);
        setEmailLoading(false);
        return;
      }
      
      // Check for attempts remaining
      if (data.attemptsRemaining !== undefined) {
        setEmailAttemptsRemaining(data.attemptsRemaining);
      }
      
      if (data.error) throw new Error(data.error);

      // Successful login - reset states
      setIsEmailLocked(false);
      setEmailAttemptsRemaining(null);

      // Set the session
      if (data.session) {
        await supabase.auth.setSession(data.session);
        toast.success('স্বাগতম!');
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

      if (error) throw error;
      
      // Check for lock status
      if (data.locked) {
        setIsPhoneLocked(true);
        setPhoneLockRemainingMinutes(data.remainingMinutes || 15);
        toast.error(data.error);
        setPhoneLoading(false);
        return;
      }
      
      // Check for attempts remaining
      if (data.attemptsRemaining !== undefined) {
        setPhoneAttemptsRemaining(data.attemptsRemaining);
      }
      
      if (data.error) throw new Error(data.error);

      // Successful login - reset states
      setIsPhoneLocked(false);
      setPhoneAttemptsRemaining(null);

      // Set the session
      if (data.session) {
        await supabase.auth.setSession(data.session);
        
        // Save user ID for PIN login (mobile app only)
        if (isMobileApp) {
          localStorage.setItem('medflowx_user_id', data.user.id);
          setUserId(data.user.id);
          
          // Check if PIN is set up
          if (!data.hasPinSetup) {
            setShowPinSetup(true);
            toast.success('লগইন সফল! এখন পিন সেটআপ করুন।');
            setPhoneLoading(false);
            return;
          }
        }
        
        toast.success('স্বাগতম!');
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

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('পিন সেটআপ সফল!');
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
  const handlePinLogin = async () => {
    if (loginPin.length !== 4) return;

    setPinLoading(true);
    try {
      // First, we need to get a session using stored credentials
      // This is a simplified flow - in production you'd want to store encrypted session
      const savedSession = localStorage.getItem('medflowx_session');
      
      if (!savedSession) {
        toast.error('সেশন মেয়াদোত্তীর্ণ। পাসওয়ার্ড দিয়ে লগইন করুন।');
        setShowPinLogin(false);
        setPinLoading(false);
        return;
      }

      const session = JSON.parse(savedSession);
      
      // Verify PIN
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'verify', pin: loginPin },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Set session and navigate
      await supabase.auth.setSession(session);
      toast.success('স্বাগতম!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পিন যাচাই ব্যর্থ';
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
                {pinStep === 'setup' ? '৪-ডিজিট পিন সেটআপ করুন' : 'পিন নিশ্চিত করুন'}
              </CardTitle>
              <CardDescription>
                {pinStep === 'setup' 
                  ? 'দ্রুত লগইনের জন্য একটি পিন সেট করুন'
                  : 'আবার আপনার পিন লিখুন'
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
                'পরবর্তী'
              ) : (
                'পিন সেট করুন'
              )}
            </Button>

            <Button variant="ghost" onClick={skipPinSetup} className="w-full">
              পরে করব
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
              <CardTitle className="text-2xl font-display">পিন দিয়ে লগইন করুন</CardTitle>
              <CardDescription>আপনার ৪-ডিজিট পিন লিখুন</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={4} 
                value={loginPin}
                onChange={(value) => {
                  setLoginPin(value);
                  if (value.length === 4) {
                    handlePinLogin();
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
            </div>

            {pinLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            <Button 
              variant="ghost" 
              onClick={switchToPasswordLogin} 
              className="w-full"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              পাসওয়ার্ড দিয়ে লগইন করুন
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
            <CardTitle className="text-2xl font-display">স্বাগতম</CardTitle>
            <CardDescription>আপনার ফার্মেসি ড্যাশবোর্ডে সাইন ইন করুন</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'phone' | 'email')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                মোবাইল
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ইমেইল
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
                      অনেক বার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অ্যাকাউন্ট {phoneLockRemainingMinutes} মিনিটের জন্য লক করা হয়েছে।
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Attempts Warning */}
                {phoneAttemptsRemaining !== null && phoneAttemptsRemaining <= 3 && !isPhoneLocked && (
                  <Alert className="border-warning bg-warning/10 text-warning-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      সতর্কতা: আর {phoneAttemptsRemaining} বার ভুল চেষ্টায় অ্যাকাউন্ট লক হবে।
                    </AlertDescription>
                  </Alert>
                )}
                
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
                      required
                      disabled={isPhoneLocked}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonePassword">পাসওয়ার্ড</Label>
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
                      সাইন ইন হচ্ছে...
                    </>
                  ) : isPhoneLocked ? (
                    `${phoneLockRemainingMinutes} মিনিট অপেক্ষা করুন`
                  ) : (
                    'সাইন ইন করুন'
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
                      অনেক বার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অ্যাকাউন্ট {emailLockRemainingMinutes} মিনিটের জন্য লক করা হয়েছে।
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Attempts Warning */}
                {emailAttemptsRemaining !== null && emailAttemptsRemaining <= 3 && !isEmailLocked && (
                  <Alert className="border-warning bg-warning/10 text-warning-foreground">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                      সতর্কতা: আর {emailAttemptsRemaining} বার ভুল চেষ্টায় অ্যাকাউন্ট লক হবে।
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
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
                  <Label htmlFor="emailPassword">পাসওয়ার্ড</Label>
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
                      সাইন ইন হচ্ছে...
                    </>
                  ) : isEmailLocked ? (
                    `${emailLockRemainingMinutes} মিনিট অপেক্ষা করুন`
                  ) : (
                    'সাইন ইন করুন'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">অ্যাকাউন্ট নেই? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              ফ্রি ট্রায়াল শুরু করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
