import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, CheckCircle2, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import logoAuthFallback from '@/assets/logo-auth.png';

// Plan display configuration
const planConfig: Record<string, { title: string; subtitle: string; buttonText: string }> = {
  trial: {
    title: 'ফ্রি ট্রায়াল শুরু করুন',
    subtitle: '৭ দিন ফ্রি, কোনো পেমেন্ট নেই',
    buttonText: 'ফ্রি ট্রায়াল শুরু করুন',
  },
  monthly: {
    title: 'মাসিক প্ল্যান শুরু করুন',
    subtitle: 'মাসিক বিলিং সহ সম্পূর্ণ অ্যাক্সেস',
    buttonText: 'মাসিক প্ল্যান শুরু করুন',
  },
  yearly: {
    title: 'বার্ষিক প্ল্যান শুরু করুন',
    subtitle: 'বার্ষিক বিলিং-এ ১৭% সাশ্রয়',
    buttonText: 'বার্ষিক প্ল্যান শুরু করুন',
  },
  lifetime: {
    title: 'লাইফটাইম অ্যাক্সেস নিন',
    subtitle: 'একবার পেমেন্ট, চিরকালের জন্য',
    buttonText: 'লাইফটাইম অ্যাক্সেস নিন',
  },
};

type SignupStep = 'phone' | 'otp' | 'details' | 'success';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'trial';
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState<SignupStep>('phone');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const currentPlanConfig = useMemo(() => {
    return planConfig[plan] || planConfig.trial;
  }, [plan]);

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 11 digits (01XXXXXXXXX)
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
        body: { phone, purpose: 'signup' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('OTP পাঠানো হয়েছে!');
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
    if (otp.length !== 6) {
      toast.error('৬ ডিজিটের OTP দিন');
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, otp, purpose: 'signup' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setVerificationToken(data.verificationToken);
      toast.success('OTP যাচাই সফল!');
      setStep('details');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OTP যাচাই ব্যর্থ';
      toast.error(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setCreatingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-signup', {
        body: { 
          phone, 
          verificationToken, 
          email: email || undefined,
          password, 
          fullName, 
          pharmacyName 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // If we got a session, set it
      if (data.session) {
        await supabase.auth.setSession(data.session);
        toast.success('অ্যাকাউন্ট তৈরি সফল!');
        navigate('/dashboard');
      } else {
        setStep('success');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'অ্যাকাউন্ট তৈরি ব্যর্থ';
      toast.error(message);
    } finally {
      setCreatingAccount(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, purpose: 'signup' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('নতুন OTP পাঠানো হয়েছে!');
      setOtp('');
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
            <div className="mx-auto p-3 rounded-full bg-green-100 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">অ্যাকাউন্ট তৈরি সফল!</CardTitle>
              <CardDescription className="mt-2">
                আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন লগইন করুন।
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
            <CardTitle className="text-2xl font-display">{currentPlanConfig.title}</CardTitle>
            <CardDescription>{currentPlanConfig.subtitle}</CardDescription>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${step === 'phone' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`w-8 h-0.5 ${step !== 'phone' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-primary' : step === 'details' ? 'bg-primary/30' : 'bg-muted'}`} />
            <div className={`w-8 h-0.5 ${step === 'details' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-muted'}`} />
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
                  এই নাম্বারে OTP পাঠানো হবে
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
              
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp}
                  onChange={setOtp}
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
                  disabled={verifyingOtp || otp.length !== 6}
                >
                  {verifyingOtp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'যাচাই করুন'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="text-sm"
                >
                  {sendingOtp ? 'পাঠানো হচ্ছে...' : 'আবার OTP পাঠান'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Account Details */}
          {step === 'details' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">পুরো নাম</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="আপনার নাম"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">ফার্মেসির নাম</Label>
                <Input
                  id="pharmacyName"
                  type="text"
                  placeholder="আপনার ফার্মেসির নাম"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  পাসওয়ার্ড রিসেট ও নোটিফিকেশনের জন্য
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  disabled={creatingAccount}
                >
                  {creatingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    currentPlanConfig.buttonText
                  )}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-4 text-xs text-center text-muted-foreground">
            সাইন আপ করে আপনি আমাদের Terms of Service এবং Privacy Policy মেনে নিচ্ছেন
          </p>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              সাইন ইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
