import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Lock, KeyRound, Trash2, RefreshCw, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export function PinManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  // PIN setup states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'current' | 'new' | 'confirm'>('new');
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user has PIN on mount
  useEffect(() => {
    checkPinStatus();
  }, [user]);

  const checkPinStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_pins')
        .select('id, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      setHasPin(!!data);
    } catch {
      setHasPin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length !== 4) {
      toast.error('৪ ডিজিটের পিন দিন');
      return;
    }

    if (pinStep === 'new') {
      setPinStep('confirm');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('পিন মিলছে না');
      setConfirmPin('');
      setPinStep('new');
      return;
    }

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'setup', pin: newPin },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('পিন সেটআপ সফল!');
      setHasPin(true);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পিন সেটআপ ব্যর্থ';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePin = async () => {
    // First verify current PIN
    if (pinStep === 'current') {
      if (currentPin.length !== 4) {
        toast.error('বর্তমান পিন দিন');
        return;
      }

      setActionLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase.functions.invoke('pin-auth', {
          body: { action: 'verify', pin: currentPin },
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setPinStep('new');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'পিন যাচাই ব্যর্থ';
        toast.error(message);
        setCurrentPin('');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (pinStep === 'new') {
      if (newPin.length !== 4) {
        toast.error('নতুন পিন দিন');
        return;
      }
      setPinStep('confirm');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('পিন মিলছে না');
      setConfirmPin('');
      setPinStep('new');
      return;
    }

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'setup', pin: newPin },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('পিন পরিবর্তন সফল!');
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পিন পরিবর্তন ব্যর্থ';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePin = async () => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { action: 'remove' },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('পিন মুছে ফেলা হয়েছে');
      setHasPin(false);
      setShowRemoveConfirm(false);
      
      // Clear saved session from localStorage
      localStorage.removeItem('medflowx_session');
      localStorage.removeItem('medflowx_user_id');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'পিন মুছতে ব্যর্থ';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setShowSetup(false);
    setShowChange(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinStep('new');
  };

  const getStepTitle = () => {
    if (showChange) {
      if (pinStep === 'current') return 'বর্তমান পিন দিন';
      if (pinStep === 'new') return 'নতুন পিন দিন';
      return 'পিন নিশ্চিত করুন';
    }
    if (pinStep === 'new') return '৪-ডিজিট পিন দিন';
    return 'পিন নিশ্চিত করুন';
  };

  const getCurrentValue = () => {
    if (showChange && pinStep === 'current') return currentPin;
    if (pinStep === 'confirm') return confirmPin;
    return newPin;
  };

  const setCurrentValue = (value: string) => {
    if (showChange && pinStep === 'current') {
      setCurrentPin(value);
    } else if (pinStep === 'confirm') {
      setConfirmPin(value);
    } else {
      setNewPin(value);
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>পিন সেটিংস</CardTitle>
              <CardDescription>দ্রুত লগইনের জন্য পিন ম্যানেজ করুন</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>পিন সেটিংস</CardTitle>
              <CardDescription>মোবাইল অ্যাপে দ্রুত লগইনের জন্য পিন ম্যানেজ করুন</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* PIN Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <Label className="text-base font-medium">
                  {hasPin ? 'পিন সক্রিয়' : 'পিন নিষ্ক্রিয়'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {hasPin 
                    ? 'মোবাইল অ্যাপে পিন দিয়ে দ্রুত লগইন করতে পারবেন' 
                    : 'পিন সেটআপ করে মোবাইল অ্যাপে দ্রুত লগইন করুন'
                  }
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              hasPin 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {hasPin ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </div>
          </div>

          {/* Setup/Change PIN Form */}
          {(showSetup || showChange) && (
            <div className="p-4 rounded-lg border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{getStepTitle()}</h3>
              </div>
              
              <div className="flex justify-center py-4">
                <InputOTP 
                  maxLength={4} 
                  value={getCurrentValue()}
                  onChange={setCurrentValue}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  বাতিল
                </Button>
                <Button 
                  onClick={showChange ? handleChangePin : handleSetupPin}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  disabled={actionLoading || getCurrentValue().length !== 4}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : pinStep === 'confirm' ? (
                    'সংরক্ষণ করুন'
                  ) : (
                    'পরবর্তী'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showSetup && !showChange && (
            <div className="flex flex-wrap gap-2">
              {!hasPin ? (
                <Button 
                  onClick={() => { setShowSetup(true); setPinStep('new'); }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  পিন সেটআপ করুন
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => { setShowChange(true); setPinStep('current'); }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    পিন পরিবর্তন করুন
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowRemoveConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    পিন মুছুন
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove PIN Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>পিন মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              পিন মুছে ফেলার পর মোবাইল অ্যাপে পিন দিয়ে লগইন করতে পারবেন না। 
              প্রতিবার মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে লগইন করতে হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePin}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              পিন মুছুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
