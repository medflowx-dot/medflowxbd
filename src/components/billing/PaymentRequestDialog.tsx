import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

interface PaymentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    id: string;
    name: string;
    price: number;
    planType: string;
  } | null;
}

export function PaymentRequestDialog({ open, onOpenChange, plan }: PaymentRequestDialogProps) {
  const { user } = useAuth();
  const [loadingUddoktapay, setLoadingUddoktapay] = useState(false);
  const [uddoktapayEnabled, setUddoktapayEnabled] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(true);

  // Check if UddoktaPay is enabled
  useEffect(() => {
    const checkUddoktapay = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'uddoktapay_enabled')
          .single();
        
        if (error) {
          console.error('Error fetching UddoktaPay settings:', error);
          setUddoktapayEnabled(false);
        } else {
          // Handle various JSONB formats: boolean true, string "true", parsed JSON
          const value = data?.setting_value;
          let isEnabled = false;
          
          if (typeof value === 'boolean') {
            isEnabled = value;
          } else if (typeof value === 'string') {
            isEnabled = value === 'true' || value === '"true"';
          } else if (value !== null && value !== undefined) {
            // JSONB might return as-is or need parsing
            isEnabled = Boolean(value);
          }
          
          console.log('UddoktaPay enabled check:', { value, valueType: typeof value, isEnabled });
          setUddoktapayEnabled(isEnabled);
        }
      } catch (error) {
        console.error('Error checking UddoktaPay settings:', error);
        setUddoktapayEnabled(false);
      } finally {
        setCheckingSettings(false);
      }
    };

    if (open) {
      setCheckingSettings(true);
      checkUddoktapay();
    }
  }, [open]);

  const handleUddoktapayPayment = async () => {
    if (!plan || !user) return;

    setLoadingUddoktapay(true);
    try {
      const { data, error } = await supabase.functions.invoke('uddoktapay-create-charge', {
        body: {
          user_id: user.id,
          plan_id: plan.id,
          amount: plan.price,
          plan_type: plan.planType,
          full_name: user.email?.split('@')[0] || 'Customer',
          email: user.email,
          redirect_url: `${window.location.origin}/billing?status=success`,
          cancel_url: `${window.location.origin}/billing?status=cancelled`,
        },
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setLoadingUddoktapay(false);
        return;
      }

      if (data?.success && data?.payment_url) {
        // Redirect to UddoktaPay checkout
        window.location.href = data.payment_url;
      } else {
        throw new Error(data?.error || 'পেমেন্ট তৈরি করতে ব্যর্থ');
      }
    } catch (error: unknown) {
      console.error('UddoktaPay error:', error);
      const message = error instanceof Error ? error.message : 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে';
      toast.error(message);
    } finally {
      setLoadingUddoktapay(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            পেমেন্ট করুন
          </DialogTitle>
          <DialogDescription>
            {plan.name} প্ল্যান - ৳{plan.price.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {checkingSettings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : uddoktapayEnabled ? (
          <div className="space-y-4">
            {/* Payment Info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">সুরক্ষিত পেমেন্ট গেটওয়ে</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    bKash, Nagad, Rocket, Upay, VISA, MasterCard ও Bank Transfer সাপোর্ট করে
                  </p>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handleUddoktapayPayment}
              disabled={loadingUddoktapay}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              size="lg"
            >
              {loadingUddoktapay ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>পেমেন্ট তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium text-lg">৳{plan.price.toLocaleString()} পে করুন</span>
                  </div>
                  <span className="text-xs opacity-80">UddoktaPay দিয়ে নিরাপদে পেমেন্ট করুন</span>
                </>
              )}
            </Button>

            {/* Cancel Button */}
            <Button variant="outline" onClick={handleClose} className="w-full">
              বাতিল করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                পেমেন্ট সিস্টেম বর্তমানে বন্ধ আছে। অনুগ্রহ করে পরে চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={handleClose} className="w-full">
              বন্ধ করুন
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
