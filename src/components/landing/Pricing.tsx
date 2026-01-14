import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free Trial',
    price: '0',
    period: '7 days',
    description: 'Try all features risk-free',
    features: [
      'Full access to all features',
      'Unlimited medicines & batches',
      'Sales & due tracking',
      'Supplier management',
      'Daily cash flow',
      'PDF reports',
    ],
    limitations: ['Staff accounts disabled'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Monthly',
    price: '999',
    period: '/month',
    description: 'Perfect for growing pharmacies',
    features: [
      'Everything in Free Trial',
      'Unlimited staff accounts',
      'Role-based permissions',
      'WhatsApp sharing',
      'Priority support',
      'Auto-renewal',
    ],
    limitations: [],
    cta: 'Subscribe Monthly',
    popular: true,
  },
  {
    name: 'Yearly',
    price: '9,999',
    period: '/year',
    description: 'Best value — Save 17%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Dedicated support',
      'Early access to features',
      'Custom reports',
      'Auto-renewal',
    ],
    limitations: [],
    cta: 'Subscribe Yearly',
    popular: false,
  },
  {
    name: 'Lifetime',
    price: '29,999',
    period: 'one-time',
    description: 'Own it forever',
    features: [
      'Permanent license',
      'All current features',
      'All future updates',
      'Unlimited everything',
      'VIP support',
    ],
    limitations: ['৳500-700/year service charge'],
    cta: 'Buy Lifetime',
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
            <span className="text-secondary-foreground text-sm font-semibold">Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparent pricing in Bangladeshi Taka. No hidden fees. 
            Start with a free trial and upgrade when you're ready.
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
                    Most Popular
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
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Secure payments via</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              bKash
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              Nagad
            </div>
            <div className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold">
              SSLCommerz
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
