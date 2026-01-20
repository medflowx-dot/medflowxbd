import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Share, 
  MoreVertical, 
  Plus, 
  CheckCircle2, 
  ArrowLeft,
  Apple,
  Chrome
} from 'lucide-react';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import logoAuthFallback from '@/assets/logo-auth.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const iosSteps = [
    { icon: Share, text: 'Safari ব্রাউজারে এই পেজ খুলুন', subtext: 'Chrome বা অন্য ব্রাউজার কাজ করবে না' },
    { icon: Share, text: 'নিচে Share বাটনে ট্যাপ করুন', subtext: 'স্ক্রিনের নিচের মাঝখানে থাকবে' },
    { icon: Plus, text: '"Add to Home Screen" সিলেক্ট করুন', subtext: 'স্ক্রল করে খুঁজুন' },
    { icon: CheckCircle2, text: '"Add" বাটনে ট্যাপ করুন', subtext: 'আপনার হোম স্ক্রিনে অ্যাপ যোগ হবে' },
  ];

  const androidSteps = [
    { icon: Chrome, text: 'Chrome ব্রাউজারে এই পেজ খুলুন', subtext: 'সবচেয়ে ভালো অভিজ্ঞতার জন্য' },
    { icon: MoreVertical, text: 'উপরে ডানে তিন ডট মেনুতে ট্যাপ করুন', subtext: 'অথবা "Install app" ব্যানার দেখুন' },
    { icon: Download, text: '"Install app" বা "Add to Home Screen" সিলেক্ট করুন', subtext: 'পপআপ আসবে' },
    { icon: CheckCircle2, text: '"Install" বাটনে ট্যাপ করুন', subtext: 'আপনার হোম স্ক্রিনে অ্যাপ যোগ হবে' },
  ];

  const steps = isIOS ? iosSteps : androidSteps;

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">অ্যাপ ইনস্টল করা হয়েছে! 🎉</CardTitle>
            <CardDescription>
              MedFlowx এখন আপনার ডিভাইসে ইনস্টল করা আছে। হোম স্ক্রিন থেকে অ্যাপটি চালু করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              লগইন করুন
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              হোম পেজে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">অ্যাপ ইনস্টল করুন</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-lg">
            <img src={platformLogo} alt="MedFlowx" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">MedFlowx অ্যাপ ইনস্টল করুন</h2>
          <p className="text-muted-foreground">
            আপনার ফোনে অ্যাপ ইনস্টল করে দ্রুত এক্সেস পান
          </p>
        </div>

        {/* Device Detection */}
        <div className="flex justify-center gap-2 mb-6">
          {isIOS && (
            <Badge variant="secondary" className="gap-1">
              <Apple className="h-3 w-3" />
              iPhone/iPad সনাক্ত হয়েছে
            </Badge>
          )}
          {isAndroid && (
            <Badge variant="secondary" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Android সনাক্ত হয়েছে
            </Badge>
          )}
          {!isIOS && !isAndroid && (
            <Badge variant="outline">
              Desktop ব্রাউজার
            </Badge>
          )}
        </div>

        {/* Direct Install Button (if available) */}
        {deferredPrompt && (
          <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-primary to-primary/80 h-12 text-lg gap-2"
              >
                <Download className="h-5 w-5" />
                এখনই ইনস্টল করুন
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                এক ক্লিকে ইনস্টল হবে
              </p>
            </CardContent>
          </Card>
        )}

        {/* Installation Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isIOS ? <Apple className="h-5 w-5" /> : <Chrome className="h-5 w-5" />}
              {isIOS ? 'iPhone/iPad এ ইনস্টল করুন' : 'Android এ ইনস্টল করুন'}
            </CardTitle>
            <CardDescription>
              নিচের ধাপগুলো অনুসরণ করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{step.text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.subtext}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">অ্যাপ ইনস্টল করলে যা পাবেন</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'দ্রুত লোড হবে - ওয়েবসাইটের চেয়ে ফাস্ট',
                'অফলাইনে কাজ করবে - ইন্টারনেট ছাড়াও',
                'ফুল স্ক্রিন অভিজ্ঞতা - নেটিভ অ্যাপের মতো',
                'হোম স্ক্রিনে শর্টকাট - এক ট্যাপে অ্যাক্সেস',
                'Push নোটিফিকেশন - গুরুত্বপূর্ণ আপডেট পান',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="mt-8 space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/login')}
          >
            এখন না, ব্রাউজারে চালিয়ে যাই
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            আপনি যেকোনো সময় পরে ইনস্টল করতে পারবেন
          </p>
        </div>
      </main>
    </div>
  );
}
