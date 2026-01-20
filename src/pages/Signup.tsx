import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Plan display configuration
const planConfig: Record<string, { title: string; subtitle: string; buttonText: string }> = {
  trial: {
    title: 'Start your free trial',
    subtitle: '7 days free, no credit card required',
    buttonText: 'Start Free Trial',
  },
  monthly: {
    title: 'Start Monthly Plan',
    subtitle: 'Get full access with monthly billing',
    buttonText: 'Start Monthly Plan',
  },
  yearly: {
    title: 'Start Yearly Plan',
    subtitle: 'Save 17% with annual billing',
    buttonText: 'Start Yearly Plan',
  },
  lifetime: {
    title: 'Get Lifetime Access',
    subtitle: 'One-time payment, forever yours',
    buttonText: 'Get Lifetime Access',
  },
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'trial';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const currentPlanConfig = useMemo(() => {
    return planConfig[plan] || planConfig.trial;
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, pharmacyName);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
        <Card className="w-full max-w-md shadow-elegant text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto p-3 rounded-full bg-green-100 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">Check your email</CardTitle>
              <CardDescription className="mt-2">
                We've sent a verification link to <strong>{email}</strong>. 
                Click the link to verify your account and start your 7-day free trial.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
              Back to Login
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
          <Link to="/" className="inline-flex items-center justify-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Pill className="h-6 w-6" />
            </div>
            <span className="text-2xl font-display font-bold text-primary">MedFlowx</span>
          </Link>
          <div>
            <CardTitle className="text-2xl font-display">{currentPlanConfig.title}</CardTitle>
            <CardDescription>{currentPlanConfig.subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacyName">Pharmacy Name</Label>
              <Input
                id="pharmacyName"
                type="text"
                placeholder="City Pharmacy"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                currentPlanConfig.buttonText
              )}
            </Button>
          </form>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
