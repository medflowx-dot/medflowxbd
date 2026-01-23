import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import logoAuthFallback from '@/assets/logo-auth.png';
import { parseEdgeFunctionError, EdgeFunctionErrorData } from '@/lib/edgeFunctionError';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingMinutes, setLockRemainingMinutes] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Check if already logged in as admin team member
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user is admin team member
        const { data: teamMember } = await supabase
          .from('admin_team_members')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (teamMember) {
          navigate('/owner', { replace: true });
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(language === 'bn' ? 'Email এবং password দিন' : 'Please enter email and password');
      return;
    }

    if (isLocked) {
      toast.error(language === 'bn' 
        ? `অ্যাকাউন্ট লক আছে। ${lockRemainingMinutes} মিনিট পর চেষ্টা করুন।`
        : `Account is locked. Try again in ${lockRemainingMinutes} minutes.`);
      return;
    }

    setLoading(true);
    setAttemptsRemaining(null);

    try {
      const response = await supabase.functions.invoke('admin-team-login', {
        body: { email: email.toLowerCase().trim(), password },
      });

      const errorData = await parseEdgeFunctionError(response.error, response.data as EdgeFunctionErrorData);

      if (errorData?.error) {
        if (errorData?.locked) {
          setIsLocked(true);
          setLockRemainingMinutes(errorData.remainingMinutes || 30);
        } else if (errorData?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(errorData.attemptsRemaining);
        }
        toast.error(errorData.error);
        return;
      }

      const data = response.data;

      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        toast.success(language === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Login successful!');
        navigate('/owner', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(language === 'bn' ? 'লগইন করতে সমস্যা হয়েছে' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Lock countdown effect
  useEffect(() => {
    if (!isLocked || lockRemainingMinutes <= 0) return;

    const timer = setInterval(() => {
      setLockRemainingMinutes(prev => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [isLocked, lockRemainingMinutes]);

  const { logoAuth } = usePlatformBranding();
  const logoUrl = logoAuth || logoAuthFallback;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <Card className="w-full max-w-md relative bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {language === 'bn' ? 'স্টাফ লগইন' : 'Staff Login'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {language === 'bn' ? 'Owner Panel Admin Team' : 'Owner Panel Admin Team'}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {isLocked && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {language === 'bn' 
                    ? `অ্যাকাউন্ট ${lockRemainingMinutes} মিনিটের জন্য লক করা হয়েছে।`
                    : `Account locked for ${lockRemainingMinutes} minutes.`}
                </AlertDescription>
              </Alert>
            )}

            {attemptsRemaining !== null && attemptsRemaining <= 3 && !isLocked && (
              <Alert variant="destructive" className="bg-yellow-900/50 border-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {language === 'bn'
                    ? `সতর্কতা: আর ${attemptsRemaining}টি চেষ্টা বাকি আছে।`
                    : `Warning: ${attemptsRemaining} attempts remaining.`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                {language === 'bn' ? 'ইমেইল' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isLocked}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || isLocked}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={loading || isLocked}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...'}
                </>
              ) : (
                language === 'bn' ? 'লগইন করুন' : 'Login'
              )}
            </Button>

            <div className="text-center space-y-2 text-sm">
              <Link 
                to="/forgot-password" 
                className="text-primary hover:underline block"
              >
                {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Link>
              <Link 
                to="/login" 
                className="text-slate-400 hover:text-white block"
              >
                {language === 'bn' ? 'ফার্মেসী লগইন এ ফিরে যান' : 'Back to Pharmacy Login'}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
