import { Check, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Fallback plans
const fallbackPlans = [
  {
    name: 'ফ্রি ট্রায়াল',
    price: '০',
    period: '৭ দিন',
    description: 'সব ফিচার ফ্রিতে ট্রাই করুন',
    features: [
      'সব ফিচারে পূর্ণ একসেস',
      'আনলিমিটেড ওষুধ ও ব্যাচ',
      'বিক্রয় ও বাকি ট্র্যাকিং',
      'সাপ্লায়ার ম্যানেজমেন্ট',
      'দৈনিক ক্যাশ ফ্লো',
      'PDF রিপোর্ট',
    ],
    limitations: ['স্টাফ অ্যাকাউন্ট ডিজেবল'],
    cta: 'ফ্রি ট্রায়াল শুরু করুন',
    popular: false,
  },
  {
    name: 'মাসিক',
    price: '৯৯৯',
    period: '/মাস',
    description: 'ছোট ফার্মেসির জন্য পারফেক্ট',
    features: [
      'ফ্রি ট্রায়ালের সব কিছু',
      'আনলিমিটেড স্টাফ অ্যাকাউন্ট',
      'রোল-ভিত্তিক পারমিশন',
      'হোয়াটসঅ্যাপ শেয়ারিং',
      'প্রায়োরিটি সাপোর্ট',
      'অটো-রিনিউয়াল',
    ],
    limitations: [],
    cta: 'মাসিক সাবস্ক্রাইব করুন',
    popular: true,
  },
  {
    name: 'বার্ষিক',
    price: '৯,৯৯৯',
    period: '/বছর',
    description: 'সেরা মূল্য — ১৭% সাশ্রয় করুন',
    features: [
      'মাসিকের সব কিছু',
      '২ মাস ফ্রি',
      'ডেডিকেটেড সাপোর্ট',
      'নতুন ফিচার আগে পান',
      'কাস্টম রিপোর্ট',
      'অটো-রিনিউয়াল',
    ],
    limitations: [],
    cta: 'বার্ষিক সাবস্ক্রাইব করুন',
    popular: false,
  },
  {
    name: 'লাইফটাইম',
    price: '২৯,৯৯৯',
    period: 'এককালীন',
    description: 'চিরকালের জন্য আপনার',
    features: [
      'স্থায়ী লাইসেন্স',
      'সব বর্তমান ফিচার',
      'ভবিষ্যত সব আপডেট',
      'আনলিমিটেড সবকিছু',
      'VIP সাপোর্ট',
    ],
    limitations: ['বার্ষিক ৳৫০০-৭০০ সার্ভিস চার্জ'],
    cta: 'লাইফটাইম কিনুন',
    popular: false,
  },
];

const Pricing = () => {
  const { data: cmsContent } = useCMSContent('pricing');
  
  const title = getCMSValue(cmsContent, 'title', 'আপনার জন্য সঠিক প্যাকেজ বেছে নিন');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'বাংলাদেশি টাকায় স্বচ্ছ প্রাইসিং। কোনো লুকানো চার্জ নেই।');
  const plans = getCMSValue(cmsContent, 'plans', fallbackPlans);
  const paymentMethods = getCMSValue(cmsContent, 'payment_methods', ['বিকাশ', 'নগদ', 'এসএসএল কমার্স']);

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
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan: any, index: number) => (
            <div
              key={plan.name || index}
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
                <h3 className="text-xl font-display font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-medium">৳</span>
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="relative z-10 space-y-3 mb-8">
                {(plan.features || []).map((feature: string, featureIndex: number) => (
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
                {(plan.limitations || []).map((limitation: string, limIndex: number) => (
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
                asChild
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">নিরাপদ পেমেন্ট মাধ্যম</p>
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            {paymentMethods.map((method: string, index: number) => (
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
    </section>
  );
};

export default Pricing;
