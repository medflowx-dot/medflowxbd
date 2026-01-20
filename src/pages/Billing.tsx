import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';
import { usePricingPlansPublic } from '@/hooks/usePricingPlansPublic';
import { useUserPaymentRequests } from '@/hooks/usePaymentRequests';
import { PaymentRequestDialog } from '@/components/billing/PaymentRequestDialog';
import { Loader2, CreditCard, AlertTriangle, Clock, Crown, Check, Phone, Mail, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Billing() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isActive, isTrial, isExpired, isSuspended, planType, daysRemaining, isLoading } = useSubscriptionStatus();
  const { data: plans, isLoading: plansLoading } = usePricingPlansPublic();
  const { data: paymentRequests } = useUserPaymentRequests();
  
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    planType: string;
  } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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

  // Check for pending payment request
  const pendingRequest = paymentRequests?.find(r => r.status === 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If subscription is active, redirect to dashboard
  if (isActive && !isExpired && !isSuspended) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Required</h1>
          <p className="text-muted-foreground">
            Your subscription needs attention to continue using MedFlowX
          </p>
        </div>

        {/* Pending Payment Request Alert */}
        {pendingRequest && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <Clock className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">
              পেমেন্ট ভেরিফিকেশন চলছে
            </AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              আপনার পেমেন্ট রিকোয়েস্ট (TrxID: {pendingRequest.transaction_id}) ভেরিফিকেশনের জন্য অপেক্ষায় আছে। 
              সাধারণত ২-৪ ঘন্টার মধ্যে সম্পন্ন হয়।
            </AlertDescription>
          </Alert>
        )}

        {/* Status Alert */}
        {isExpired && !pendingRequest && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-800 dark:text-orange-200">
              {isTrial ? 'Free Trial Expired' : 'Subscription Expired'}
            </AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              {isTrial 
                ? 'Your 7-day free trial has ended. Please choose a plan to continue.'
                : 'Your subscription has expired. Renew now to regain access to your pharmacy data.'}
            </AlertDescription>
          </Alert>
        )}

        {isSuspended && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">Account Suspended</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              Your account has been suspended. Please contact support to resolve this issue.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Plan Info */}
        <Card className="mb-8 border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium capitalize">{planType || 'None'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={isExpired ? 'destructive' : isSuspended ? 'destructive' : 'default'}>
                  {isSuspended ? 'Suspended' : isExpired ? 'Expired' : 'Active'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="font-medium text-sm truncate">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-medium">{daysRemaining ?? 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Payment Requests */}
        {paymentRequests && paymentRequests.length > 0 && (
          <Card className="mb-8 border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-base">আপনার পেমেন্ট রিকোয়েস্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {req.status === 'pending' && <Clock className="h-4 w-4 text-amber-500" />}
                      {req.status === 'verified' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {req.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
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
                        {req.status === 'pending' ? 'অপেক্ষায়' : 
                         req.status === 'verified' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
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
        <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {plansLoading ? (
            <div className="col-span-3 flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            plans?.filter(p => p.is_active && p.plan_name !== 'trial').map((plan) => (
              <Card 
                key={plan.id} 
                className={`border-2 transition-all hover:shadow-lg ${
                  plan.plan_name === 'yearly' ? 'border-primary shadow-md' : 'border-border'
                }`}
              >
                {plan.plan_name === 'yearly' && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.plan_name === 'lifetime' && <Crown className="h-5 w-5 text-amber-500" />}
                    {plan.display_name}
                  </CardTitle>
                  <CardDescription>
                    {plan.plan_name === 'monthly' && 'Pay monthly, cancel anytime'}
                    {plan.plan_name === 'yearly' && 'Save 17% with annual billing'}
                    {plan.plan_name === 'lifetime' && 'One-time payment, lifetime access'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold">৳{plan.price.toLocaleString()}</span>
                    {plan.plan_name !== 'lifetime' && (
                      <span className="text-muted-foreground">
                        /{plan.plan_name === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features && Object.entries(plan.features).map(([key, value]) => (
                      value && (
                        <li key={key} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        </li>
                      )
                    ))}
                    {plan.user_limit && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Up to {plan.user_limit} staff members</span>
                      </li>
                    )}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.plan_name === 'yearly' ? 'default' : 'outline'}
                    onClick={() => handleChoosePlan(plan)}
                    disabled={!!pendingRequest}
                  >
                    {pendingRequest ? 'ভেরিফিকেশন চলছে...' : `Choose ${plan.display_name}`}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our support team for assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                +880 1XXX-XXXXXX
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                support@medflowx.com
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Option */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={handleLogout}>
            Sign out and use a different account
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
