import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreatePaymentRequest } from '@/hooks/usePaymentRequests';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Smartphone, CreditCard, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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

const PAYMENT_METHODS = [
  {
    id: 'bkash',
    name: 'bKash',
    number: '01XXXXXXXXX', // Replace with actual number
    icon: '🔴',
    color: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
  },
  {
    id: 'nagad',
    name: 'Nagad',
    number: '01XXXXXXXXX', // Replace with actual number
    icon: '🟠',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    number: '01XXXXXXXXX', // Replace with actual number
    icon: '🟣',
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  },
];

export function PaymentRequestDialog({ open, onOpenChange, plan }: PaymentRequestDialogProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('uddoktapay');
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'choose' | 'instructions' | 'submit'>('choose');
  const [uddoktapayEnabled, setUddoktapayEnabled] = useState(false);
  const [loadingUddoktapay, setLoadingUddoktapay] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(true);

  const createPaymentRequest = useCreatePaymentRequest();

  // Check if UddoktaPay is enabled
  useEffect(() => {
    const checkUddoktapay = async () => {
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'uddoktapay_enabled')
          .single();
        
        setUddoktapayEnabled(data?.setting_value === true || data?.setting_value === 'true');
      } catch (error) {
        console.error('Error checking UddoktaPay settings:', error);
      } finally {
        setCheckingSettings(false);
      }
    };

    if (open) {
      checkUddoktapay();
    }
  }, [open]);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  const handleCopyNumber = () => {
    if (selectedMethod) {
      navigator.clipboard.writeText(selectedMethod.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUddoktapayPayment = async () => {
    if (!plan || !user) return;

    setLoadingUddoktapay(true);
    try {
      const { data, error } = await supabase.functions.invoke('uddoktapay-create-charge', {
        body: {
          user_id: user.id,
          plan_id: plan.id,
          amount: plan.price,
          full_name: user.email?.split('@')[0] || 'Customer',
          email: user.email,
          redirect_url: `${window.location.origin}/billing?status=success`,
          cancel_url: `${window.location.origin}/billing?status=cancelled`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.payment_url) {
        // Redirect to UddoktaPay checkout
        window.location.href = data.payment_url;
      } else {
        throw new Error(data?.error || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('UddoktaPay error:', error);
      toast.error(error.message || 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setLoadingUddoktapay(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!plan || !transactionId.trim()) return;

    await createPaymentRequest.mutateAsync({
      plan_id: plan.id,
      plan_type: plan.planType,
      amount: plan.price,
      payment_method: paymentMethod,
      transaction_id: transactionId.trim(),
      phone_number: phoneNumber.trim() || undefined,
    });

    // Reset and close
    setTransactionId('');
    setPhoneNumber('');
    setStep('choose');
    onOpenChange(false);
  };

  const handleClose = () => {
    setTransactionId('');
    setPhoneNumber('');
    setStep('choose');
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
        ) : step === 'choose' ? (
          <div className="space-y-4">
            {/* UddoktaPay Option (if enabled) */}
            {uddoktapayEnabled && (
              <>
                <Button
                  onClick={handleUddoktapayPayment}
                  disabled={loadingUddoktapay}
                  className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  variant="default"
                >
                  {loadingUddoktapay ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        <span className="font-medium">UddoktaPay দিয়ে পেমেন্ট করুন</span>
                      </div>
                      <span className="text-xs opacity-80">bKash, Nagad, Rocket, Upay, Bank সাপোর্ট</span>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">অথবা</span>
                  </div>
                </div>
              </>
            )}

            {/* Manual Payment Option */}
            <Button
              onClick={() => {
                setStep('instructions');
                setPaymentMethod('bkash');
              }}
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">ম্যানুয়ালি পেমেন্ট করুন</span>
              </div>
              <span className="text-xs text-muted-foreground">সরাসরি মোবাইল ব্যাংকিং এ Send Money করুন</span>
            </Button>
          </div>
        ) : step === 'instructions' ? (
          <div className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>পেমেন্ট মেথড নির্বাচন করুন</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.id}
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                          hover:bg-muted ${method.color}`}
                      >
                        <span className="text-xl mb-1">{method.icon}</span>
                        <span className="text-xs font-medium">{method.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Payment Instructions */}
            <Alert className="bg-primary/5 border-primary/20">
              <Smartphone className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-medium">{selectedMethod?.name} এ পেমেন্ট করুন:</p>
                <div className="flex items-center gap-2 bg-background rounded-md p-2">
                  <span className="font-mono text-lg flex-1">{selectedMethod?.number}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyNumber}
                    className="h-8 px-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm space-y-1 mt-2">
                  <p>১. উপরের নম্বরে <strong>৳{plan.price.toLocaleString()}</strong> Send Money করুন</p>
                  <p>২. Transaction ID নোট করুন</p>
                  <p>৩. "পরবর্তী" বাটনে ক্লিক করুন</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('choose')}
                className="flex-1"
              >
                পেছনে
              </Button>
              <Button 
                onClick={() => setStep('submit')} 
                className="flex-1"
              >
                পরবর্তী: Transaction ID দিন
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Transaction ID Input */}
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                placeholder="যেমন: TXN123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {selectedMethod?.name} থেকে প্রাপ্ত Transaction ID লিখুন
              </p>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">আপনার মোবাইল নম্বর (ঐচ্ছিক)</Label>
              <Input
                id="phoneNumber"
                placeholder="01XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                যে নম্বর থেকে পেমেন্ট করেছেন
              </p>
            </div>

            <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                ভুল Transaction ID দিলে পেমেন্ট ভেরিফাই করা যাবে না এবং সাবস্ক্রিপশন অ্যাক্টিভ হবে না।
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('instructions')}
                className="flex-1"
              >
                পেছনে
              </Button>
              <Button
                onClick={handleManualSubmit}
                disabled={!transactionId.trim() || createPaymentRequest.isPending}
                className="flex-1"
              >
                {createPaymentRequest.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    সাবমিট হচ্ছে...
                  </>
                ) : (
                  'সাবমিট করুন'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
