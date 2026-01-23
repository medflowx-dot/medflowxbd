import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';
import { usePricingPlansPublic } from '@/hooks/usePricingPlansPublic';
import { useUserPaymentRequests } from '@/hooks/usePaymentRequests';
import { PaymentRequestDialog } from '@/components/billing/PaymentRequestDialog';
import { Loader2, CreditCard, AlertTriangle, Clock, Crown, Check, Phone, Mail, MessageCircle, CheckCircle, XCircle, RefreshCw, ArrowLeft, LogOut, PartyPopper, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoAuth from '@/assets/logo-auth.png';

// Hook to fetch support contact settings
function useSupportContact() {
  return useQuery({
    queryKey: ['support-contact-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['support_phone', 'support_email', 'support_whatsapp']);
      
      if (error) {
        console.error('Error fetching support contact:', error);
        return { phone: '', email: '', whatsapp: '' };
      }
      
      const settings: Record<string, string> = {};
      data?.forEach(s => {
        if (s.setting_value) {
          settings[s.setting_key] = String(s.setting_value).replace(/"/g, '');
        }
      });
      
      return {
        phone: settings.support_phone || '',
        email: settings.support_email || '',
        whatsapp: settings.support_whatsapp || '',
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function Billing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isActive, isTrial, isExpired, isSuspended, planType, daysRemaining, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { data: plans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = usePricingPlansPublic();
  const { data: paymentRequests, refetch: refetchPaymentRequests } = useUserPaymentRequests();
  const { data: supportContact } = useSupportContact();
  
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    planType: string;
  } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'processing' | null>(null);

  // Handle payment redirect status from UddoktaPay
  useEffect(() => {
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoice_id');
    
    if (status === 'success') {
      setPaymentStatus('processing');
      // Clear the URL params
      setSearchParams({});
      
      // Poll for payment verification (webhook might take a moment)
      const pollInterval = setInterval(async () => {
        await refetchPaymentRequests();
        await queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      }, 2000);

      // Show success after brief delay for webhook processing
      setTimeout(() => {
        setPaymentStatus('success');
        toast.success(t.billing?.paymentSuccess || 'পেমেন্ট সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাচ্ছি...');
        clearInterval(pollInterval);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }, 3000);

      return () => clearInterval(pollInterval);
    } else if (status === 'cancelled') {
      setPaymentStatus('cancelled');
      setSearchParams({});
      toast.error(t.billing?.paymentCancelled || 'পেমেন্ট বাতিল করা হয়েছে।');
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success(t.billing?.logoutSuccess || 'Successfully logged out');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t.billing?.logoutError || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChoosePlan = (plan: { id: string; display_name: string; price: number; plan_name: string }) => {
    setSelectedPlan({
      id: plan.id,
      name: plan.display_name,
      price: plan.price,
      planType: plan.plan_name,
    });
    setPaymentDialogOpen(true);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  // Check for pending payment request (only with valid transaction_id)
  const pendingRequest = paymentRequests?.find(r => r.status === 'pending' && r.transaction_id && r.transaction_id.trim() !== '');

  // Find current plan from plans list
  const currentPlan = plans?.find(p => p.plan_name === planType);

  // Combined loading state
  const isPageLoading = subscriptionLoading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">{t.billing?.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Check if this is a subscription management visit (active user coming to renew/manage)
  const isManagementMode = isActive && !isExpired && !isSuspended;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl py-8 px-4">
        {/* Header with back button for active users */}
        <div className="text-center mb-8">
          {isManagementMode && (
            <Button variant="ghost" onClick={handleGoBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.billing.backToDashboard}
            </Button>
          )}
          <div className="mx-auto w-16 h-16 rounded-xl overflow-hidden mb-4 shadow-md">
            <img src={logoAuth} alt="MedFlowx" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isManagementMode ? t.billing.subscriptionManagement : t.billing.subscriptionRequired}
          </h1>
          <p className="text-muted-foreground">
            {isManagementMode 
              ? t.billing.manageYourSubscription
              : t.billing.subscriptionNeedsAttention}
          </p>
        </div>

        {/* Payment Status Alerts */}
        {paymentStatus === 'processing' && (
          <Alert className="mb-6 border-primary/30 bg-primary/10 animate-pulse">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <AlertTitle className="text-primary">{t.billing.paymentProcessing}</AlertTitle>
            <AlertDescription className="text-primary/80">
              অনুগ্রহ করে অপেক্ষা করুন...
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'success' && (
          <Alert className="mb-6 border-success/30 bg-success/10">
            <PartyPopper className="h-5 w-5 text-success" />
            <AlertTitle className="text-success">{t.billing.paymentSuccessTitle}</AlertTitle>
            <AlertDescription className="text-success/80">
              {t.billing.paymentSuccessDesc}
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'cancelled' && (
          <Alert className="mb-6 border-warning/30 bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
            <AlertTitle className="text-warning">{t.billing.paymentCancelledTitle}</AlertTitle>
            <AlertDescription className="text-warning/80">
              {t.billing.paymentCancelledDesc}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Payment Request Alert */}
        {pendingRequest && !paymentStatus && (
          <Alert className="mb-6 border-info/30 bg-info/10">
            <Clock className="h-5 w-5 text-info" />
            <AlertTitle className="text-info">
              {t.billing.paymentVerificationPending}
            </AlertTitle>
            <AlertDescription className="text-info/80">
              {t.billing.paymentVerificationDesc.replace('{trxId}', pendingRequest.transaction_id)}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Alert - only show for expired/suspended */}
        {isExpired && !pendingRequest && (
          <Alert className="mb-6 border-warning/30 bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertTitle className="text-warning">
              {isTrial ? t.billing.trialExpired : t.billing.subscriptionExpired}
            </AlertTitle>
            <AlertDescription className="text-warning/80">
              {isTrial 
                ? t.billing.trialExpiredDesc
                : t.billing.subscriptionExpiredDesc}
            </AlertDescription>
          </Alert>
        )}

        {isSuspended && (
          <Alert className="mb-6 border-destructive/30 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive">{t.billing.accountSuspended}</AlertTitle>
            <AlertDescription className="text-destructive/80">
              {t.billing.accountSuspendedDesc}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Plan Info with Renew Option */}
        <Card className="mb-8 border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t.billing.currentStatus}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.billing.plan}</p>
                <p className="font-medium capitalize">{planType || t.billing.none}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.billing.status}</p>
                <Badge variant={isExpired ? 'destructive' : isSuspended ? 'destructive' : 'default'}>
                  {isSuspended ? t.billing.suspended : isExpired ? t.billing.expired : t.billing.active}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.billing.account}</p>
                <p className="font-medium text-sm truncate">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.billing.daysRemaining}</p>
                <p className="font-medium">{daysRemaining ?? 0} {t.billing.days}</p>
              </div>
            </div>

            {/* Renew button for active subscriptions */}
            {isManagementMode && planType && planType !== 'trial' && planType !== 'lifetime' && currentPlan && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.billing.renewCurrentPlan}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.billing.extendSubscription.replace('{plan}', currentPlan.display_name)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleChoosePlan(currentPlan)}
                    disabled={!!pendingRequest}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {pendingRequest ? t.billing.verificationPending : t.billing.renewNow}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous Payment Requests */}
        {paymentRequests && paymentRequests.length > 0 && (
          <Card className="mb-8 border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{t.billing.yourPaymentRequests}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {req.status === 'pending' && <Clock className="h-4 w-4 text-warning" />}
                      {req.status === 'verified' && <CheckCircle className="h-4 w-4 text-success" />}
                      {req.status === 'rejected' && <XCircle className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium capitalize">{req.plan_type} - ৳{Number(req.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">TrxID: {req.transaction_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        req.status === 'pending' ? 'outline' : 
                        req.status === 'verified' ? 'default' : 'destructive'
                      }>
                        {req.status === 'pending' ? t.billing.waiting : 
                         req.status === 'verified' ? t.billing.approved : t.billing.rejected}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(req.submitted_at), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <h2 className="text-xl font-bold mb-4">{t.billing.choosePlan}</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {plansLoading ? (
            <div className="col-span-3 flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : plansError ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground mb-4">{t.billing.plansLoadError}</p>
              <Button onClick={() => refetchPlans()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.billing.retry}
              </Button>
            </div>
          ) : !plans || plans.filter(p => p.is_active && p.plan_name !== 'trial').length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground mb-4">{t.billing.noPlansAvailable}</p>
              <Button onClick={() => refetchPlans()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.billing.refresh}
              </Button>
            </div>
          ) : (
            plans?.filter(p => p.is_active && p.plan_name !== 'trial').map((plan) => {
              const isCurrentPlan = plan.plan_name === planType;
              return (
                <Card 
                  key={plan.id} 
                  className={`border-2 transition-all hover:shadow-lg ${
                    isCurrentPlan ? 'border-success ring-2 ring-success/20' :
                    plan.plan_name === 'yearly' ? 'border-primary shadow-md' : 'border-border'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="bg-success text-success-foreground text-center py-1 text-sm font-medium">
                      {t.billing.currentPlan}
                    </div>
                  )}
                  {!isCurrentPlan && plan.plan_name === 'yearly' && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      {t.billing.mostPopular}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {plan.plan_name === 'lifetime' && <Crown className="h-5 w-5 text-warning" />}
                      {plan.display_name}
                    </CardTitle>
                    <CardDescription>
                      {plan.plan_name === 'monthly' && t.billing.payMonthly}
                      {plan.plan_name === 'yearly' && t.billing.saveYearly}
                      {plan.plan_name === 'lifetime' && t.billing.oneTimePayment}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">৳{plan.price.toLocaleString()}</span>
                      {plan.plan_name !== 'lifetime' && (
                        <span className="text-muted-foreground">
                          /{plan.plan_name === 'monthly' ? t.billing.month : t.billing.year}
                        </span>
                      )}
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features && Object.entries(plan.features).map(([key, value]) => (
                        value && (
                          <li key={key} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" />
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          </li>
                        )
                      ))}
                      {plan.user_limit && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" />
                          <span>{t.billing.upToStaff.replace('{count}', String(plan.user_limit))}</span>
                        </li>
                      )}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? 'outline' : plan.plan_name === 'yearly' ? 'default' : 'outline'}
                      onClick={() => handleChoosePlan(plan)}
                      disabled={!!pendingRequest}
                    >
                      {pendingRequest ? t.billing.verificationPending : 
                       isCurrentPlan ? t.billing.renewPlan : 
                       t.billing.choosePlanButton.replace('{plan}', plan.display_name)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Contact Support */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>{t.billing.needHelp}</CardTitle>
            <CardDescription>{t.billing.contactSupport}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {supportContact?.phone && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(`tel:${supportContact.phone.replace(/\s/g, '')}`, '_blank')}
                >
                  <Phone className="h-4 w-4" />
                  {supportContact.phone}
                </Button>
              )}
              {supportContact?.email && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(`mailto:${supportContact.email}`, '_blank')}
                >
                  <Mail className="h-4 w-4" />
                  {supportContact.email}
                </Button>
              )}
              {supportContact?.whatsapp && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = `https://wa.me/${supportContact.whatsapp.replace(/[^0-9]/g, '')}`;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Support
                </Button>
              )}
              {!supportContact?.phone && !supportContact?.email && !supportContact?.whatsapp && (
                <p className="text-muted-foreground text-sm">সাপোর্ট কন্টাক্ট সেট করা হয়নি</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logout Option */}
        <div className="text-center mt-8">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.billing.loggingOut}
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                {t.billing.signOutDifferent}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Payment Request Dialog */}
      <PaymentRequestDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
