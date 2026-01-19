import { XCircle, CheckCircle2, AlertTriangle, Calculator, Users, Truck, ArrowRight, LucideIcon } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  Calculator,
  Users,
  Truck,
};

// Fallback data
const fallbackProblems = [
  {
    icon: 'AlertTriangle',
    problem: 'ওষুধ এক্সপায়ার হয়ে যায়, টাকা নষ্ট হয়',
    solution: '৩০/৬০/৯০ দিন আগে এলার্ট পান, সময় মতো বিক্রি করুন',
  },
  {
    icon: 'Calculator',
    problem: 'দৈনিক হিসাব মেলানো কঠিন',
    solution: 'স্বয়ংক্রিয় ক্যাশ ফ্লো — ওপেনিং থেকে ক্লোজিং পর্যন্ত',
  },
  {
    icon: 'Users',
    problem: 'কাস্টমার বাকি মনে রাখা যায় না',
    solution: 'সব বাকি এক জায়গায়, পেমেন্ট হিস্ট্রি সহ',
  },
  {
    icon: 'Truck',
    problem: 'সাপ্লায়ার পেমেন্ট গোলমাল হয়',
    solution: 'সাপ্লায়ার ড্যাশবোর্ড — কত দিলাম, কত বাকি সব পরিষ্কার',
  },
];

const WhyChooseUs = () => {
  const { data: cmsContent } = useCMSContent('why_choose_us');
  
  const title = getCMSValue(cmsContent, 'title', 'আপনার সমস্যার সমাধান আমাদের কাছে');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'ফার্মেসি চালাতে গিয়ে যে সমস্যাগুলোর মুখে পড়েন, তার সবকিছুর সমাধান এক জায়গায়।');
  const problems = getCMSValue(cmsContent, 'items', fallbackProblems);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-destructive/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-success/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-secondary/15 to-secondary/5 border border-secondary/20 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary-foreground text-sm font-semibold">কেন MedFlowx?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Problem-Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((item: any, index: number) => (
            <div
              key={index}
              className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Problem Section */}
              <div className="p-6 bg-gradient-to-r from-destructive/10 to-destructive/5 border-b border-destructive/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-destructive/10">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-destructive uppercase tracking-wider">সমস্যা</span>
                    <p className="text-foreground font-medium mt-1">{item.problem}</p>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-md group-hover:border-success/50 transition-colors">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-success transition-colors" />
                </div>
              </div>
              
              {/* Solution Section */}
              <div className="p-6 bg-gradient-to-r from-success/10 to-success/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-success/10 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-success uppercase tracking-wider">MedFlowx সমাধান</span>
                    <p className="text-foreground font-medium mt-1">{item.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
