import { UserPlus, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    number: '০১',
    icon: UserPlus,
    title: 'অ্যাকাউন্ট তৈরি করুন',
    description: 'শুধু ইমেইল ও ফোন নম্বর দিন। কোনো ক্রেডিট কার্ড লাগবে না।',
  },
  {
    number: '০২',
    icon: Settings,
    title: 'ফার্মেসি সেটআপ করুন',
    description: 'ওষুধ, সাপ্লায়ার যোগ করুন। আপনার কাজের ধরন অনুযায়ী কাস্টমাইজ করুন।',
  },
  {
    number: '০৩',
    icon: Rocket,
    title: 'ব্যবসা শুরু করুন',
    description: 'বিক্রয় ট্র্যাক করুন, রিপোর্ট দেখুন, ব্যবসা বাড়ান।',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">সহজ প্রক্রিয়া</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            মাত্র ৩টি ধাপে শুরু করুন
          </h2>
          <p className="text-lg text-muted-foreground">
            সাইনআপ থেকে পূর্ণ কার্যক্ষম — মাত্র কয়েক মিনিটে।
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
                    ধাপ {step.number}
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
