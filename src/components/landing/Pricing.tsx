import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
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
  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-hero-gradient border-transparent shadow-glow scale-[1.02]'
                  : 'bg-card border-border hover:border-primary/30 shadow-card hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    সবচেয়ে জনপ্রিয়
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className={plan.popular ? 'text-primary-foreground' : ''}>
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
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      plan.popular ? 'text-secondary' : 'text-success'
                    }`} />
                    <span className={`text-sm ${plan.popular ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2">
                    <span className={`text-sm italic ${plan.popular ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      * {limitation}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? 'hero' : 'default'}
                className="w-full"
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
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              বিকাশ
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              নগদ
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              এসএসএল কমার্স
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
