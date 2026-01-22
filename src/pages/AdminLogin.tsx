import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import { supabase } from '@/integrations/supabase/client';
import logoAuthFallback from '@/assets/logo-auth.png';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export default function AdminLogin() {
  const { logoAuth } = usePlatformBranding();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingMinutes, setLockRemainingMinutes] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`অ্যাকাউন্ট লক আছে। ${lockRemainingMinutes} মিনিট পর চেষ্টা করুন।`);
      return;
    }
    
    if (!email || !password) {
      toast.error('ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }
    
    setLoading(true);
    setAttemptsRemaining(null);

    try {
      const { data, error } = await supabase.functions.invoke('email-login', {
        body: { email, password }
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        // Check for lock status
        if (errorData.locked) {
          setIsLocked(true);
          setLockRemainingMinutes(errorData.remainingMinutes || 15);
          toast.error(errorData.error);
          setLoading(false);
          return;
        }
        
        // Check for attempts remaining
        if (errorData.attemptsRemaining !== undefined) {
          setAttemptsRemaining(errorData.attemptsRemaining);
        }
        
        toast.error(errorData.error);
        setLoading(false);
        return;
      }
      
      // Network/SDK level error (no data and no parseable error)
      if (error && !data) {
        throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
      }

      // Set the session first
      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        if (sessionError) {
          console.error('Session set error:', sessionError);
          throw new Error('সেশন সেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
        
        // Wait for session to be fully established
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session) {
          throw new Error('সেশন ভেরিফাই করতে সমস্যা হয়েছে।');
        }
        
        // Now check if this user is an owner_admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        
        console.log('Role check:', { roleData, roleError, userId: data.user.id });
        
        if (roleError) {
          console.error('Role fetch error:', roleError);
          // Sign out and show error
          await supabase.auth.signOut();
          toast.error('ভূমিকা যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
          setLoading(false);
          return;
        }
        
        if (roleData?.role !== 'owner_admin') {
          // Not an admin - sign out and show error
          await supabase.auth.signOut();
          toast.error('এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য। সাধারণ লগইন পেজে যান।');
          setLoading(false);
          return;
        }
        
        // Reset states
        setIsLocked(false);
        setAttemptsRemaining(null);
        
        toast.success('অ্যাডমিন প্যানেলে স্বাগতম!');
        navigate('/owner', { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'লগইন ব্যর্থ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center">
            <img 
              src={logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth} 
              alt="MedFlowx Admin" 
              className="h-16 w-auto brightness-0 invert" 
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-white">অ্যাডমিন লগইন</CardTitle>
            <CardDescription className="text-slate-400">Owner Admin প্যানেলে প্রবেশ করুন</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Lock Alert */}
            {isLocked && (
              <Alert variant="destructive" className="bg-destructive/20 border-destructive/50">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  অনেক বার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অ্যাকাউন্ট {lockRemainingMinutes} মিনিটের জন্য লক করা হয়েছে।
                </AlertDescription>
              </Alert>
            )}
            
            {/* Attempts Warning */}
            {attemptsRemaining !== null && attemptsRemaining <= 2 && !isLocked && (
              <Alert variant="destructive" className="bg-amber-500/20 border-amber-500/50">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-400">
                  সতর্কতা: আর মাত্র {attemptsRemaining}টি চেষ্টা বাকি আছে। এরপর অ্যাকাউন্ট লক হয়ে যাবে।
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">অ্যাডমিন ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                  disabled={isLocked}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                  disabled={isLocked}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={loading || isLocked}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  অ্যাডমিন লগইন
                </>
              )}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <Link 
                to="/forgot-password" 
                className="text-sm text-slate-400 hover:text-primary transition-colors"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-slate-700 mt-4">
              <Link 
                to="/login" 
                className="text-sm text-slate-400 hover:text-primary transition-colors"
              >
                ← সাধারণ লগইন পেজে যান
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
