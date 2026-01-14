import { UserPlus, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up in Seconds',
    description: 'Create your account with just an email and phone number. No credit card required for the 7-day free trial.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configure Your Pharmacy',
    description: 'Add your medicines, set up batches, configure suppliers, and customize settings to match your workflow.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Start Managing & Growing',
    description: 'Track sales, monitor cash flow, generate reports, and watch your pharmacy business thrive.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Get Started in 3 Easy Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            From signup to fully operational in just minutes. 
            We've made it incredibly simple to get your pharmacy online.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-primary-light to-primary" />
            
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {/* Step Card */}
                <div className="relative z-10 bg-card p-8 rounded-2xl shadow-card border border-border">
                  {/* Number Badge */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-hero-gradient flex items-center justify-center shadow-glow">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  {/* Step Number */}
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                    Step {step.number}
                  </span>
                  
                  <h3 className="text-xl font-display font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
