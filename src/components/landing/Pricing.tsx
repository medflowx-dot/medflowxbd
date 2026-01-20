import { useState } from 'react';
import { Check, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { usePricingPlansPublic, PricingPlan } from '@/hooks/usePricingPlansPublic';
import { useAuth } from '@/hooks/useAuth';
import { PaymentRequestDialog } from '@/components/billing/PaymentRequestDialog';

// Map plan names to Bengali display
const planDisplayMap: Record<string, { name: string; description: string; period: string; cta: string }> = {
  trial: {
    name: 'ফ্রি ট্রায়াল',
    description: 'সব ফিচার ফ্রিতে ট্রাই করুন',
    period: '৭ দিন',
    cta: 'ফ্রি ট্রায়াল শুরু করুন',
  },
  monthly: {
    name: 'মাসিক',
    description: 'ছোট ফার্মেসির জন্য পারফেক্ট',
    period: '/মাস',
    cta: 'মাসিক সাবস্ক্রাইব করুন',
  },
  yearly: {
    name: 'বার্ষিক',
    description: 'সেরা মূল্য — ১৭% সাশ্রয় করুন',
    period: '/বছর',
    cta: 'বার্ষিক সাবস্ক্রাইব করুন',
  },
  lifetime: {
    name: 'লাইফটাইম',
    description: 'চিরকালের জন্য আপনার',
    period: 'এককালীন',
    cta: 'লাইফটাইম কিনুন',
  },
};

// Feature display names in Bengali
const featureDisplayNames: Record<string, string> = {
  unlimited_medicines: 'আনলিমিটেড ওষুধ ও ব্যাচ',
  sales_tracking: 'বিক্রয় ও বাকি ট্র্যাকিং',
  supplier_management: 'সাপ্লায়ার ম্যানেজমেন্ট',
  daily_cash: 'দৈনিক ক্যাশ ফ্লো',
  pdf_reports: 'PDF রিপোর্ট',
  staff_accounts: 'স্টাফ অ্যাকাউন্ট',
  role_permissions: 'রোল-ভিত্তিক পারমিশন',
  whatsapp_sharing: 'হোয়াটসঅ্যাপ শেয়ারিং',
  priority_support: 'প্রায়োরিটি সাপোর্ট',
  vip_support: 'VIP সাপোর্ট',
  future_updates: 'ভবিষ্যত সব আপডেট',
  custom_reports: 'কাস্টম রিপোর্ট',
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbPlans, isLoading } = usePricingPlansPublic();
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    planType: string;
  } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handlePlanClick = (plan: PricingPlan) => {
    if (plan.plan_name === 'trial') {
      // For trial, redirect to signup
      navigate('/signup');
      return;
    }

    if (!user) {
      // If not logged in, redirect to signup
      navigate('/signup');
      return;
    }

    // Open payment dialog for logged-in users
    setSelectedPlan({
      id: plan.id,
      name: plan.display_name,
      price: plan.price,
      planType: plan.plan_name,
    });
    setPaymentDialogOpen(true);
  };

  // Convert DB plans to display format
  const plans = dbPlans?.map((plan) => {
    const display = planDisplayMap[plan.plan_name] || {
      name: plan.display_name,
      description: '',
      period: '',
      cta: 'সাবস্ক্রাইব করুন',
    };

    // Get features from plan
    const features: string[] = [];
    if (plan.features) {
      Object.entries(plan.features).forEach(([key, value]) => {
        if (value && featureDisplayNames[key]) {
          features.push(featureDisplayNames[key]);
        }
      });
    }

    // Add staff limit if available
    if (plan.user_limit) {
      features.push(`${plan.user_limit} জন স্টাফ`);
    }

    return {
      ...plan,
      displayName: display.name,
      description: display.description,
      period: display.period,
      cta: display.cta,
      displayFeatures: features,
      popular: plan.plan_name === 'monthly',
      limitations: plan.plan_name === 'trial' ? ['স্টাফ অ্যাকাউন্ট ডিজেবল'] :
                   plan.plan_name === 'lifetime' ? ['বার্ষিক ৳৫০০-৭০০ সার্ভিস চার্জ'] : [],
    };
  }) || [];

  // Format price to Bengali
  const formatPrice = (price: number) => {
    return price.toLocaleString('bn-BD');
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-secondary/15 to-secondary/5 border border-secondary/20 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-secondary-foreground text-sm font-semibold">সহজ প্রাইসিং</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            আপনার জন্য সঠিক প্যাকেজ বেছে নিন
          </h2>
          <p className="text-lg text-muted-foreground">
            বাংলাদেশি টাকায় স্বচ্ছ প্রাইসিং। কোনো লুকানো চার্জ নেই।
          </p>
        </div>

        {/* Pricing Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative ${plan.popular ? 'glass-pricing-popular' : 'glass-pricing-card'} ${plan.popular ? 'scale-[1.02] lg:scale-105' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="popular-badge flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-primary text-xs font-bold shadow-xl shadow-black/25 border border-white/50">
                      <Sparkles className="w-3.5 h-3.5 sparkle-icon" />
                      সবচেয়ে জনপ্রিয়
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`relative z-10 ${plan.popular ? 'text-primary-foreground' : ''}`}>
                  <h3 className="text-xl font-display font-bold mb-2">{plan.displayName}</h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm font-medium">৳</span>
                    <span className="text-4xl font-display font-bold">{formatPrice(plan.price)}</span>
                    <span className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="relative z-10 space-y-3 mb-8">
                  {plan.displayFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-secondary/30' : 'bg-success/20'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          plan.popular ? 'text-secondary' : 'text-success'
                        }`} />
                      </div>
                      <span className={`text-sm ${plan.popular ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limIndex) => (
                    <li key={`lim-${limIndex}`} className="flex items-start gap-2 pl-7">
                      <span className={`text-sm italic ${plan.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        * {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.popular ? 'hero' : 'default'}
                  className={`relative z-10 w-full ${plan.popular ? 'shadow-lg shadow-secondary/30' : ''}`}
                  size="lg"
                  onClick={() => handlePlanClick(plan)}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">নিরাপদ পেমেন্ট মাধ্যম</p>
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            {['bKash', 'Nagad', 'Rocket'].map((method, index) => (
              <div 
                key={index}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-card to-muted/50 border border-border text-foreground font-semibold backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentRequestDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        plan={selectedPlan}
      />
    </section>
  );
};

export default Pricing;
