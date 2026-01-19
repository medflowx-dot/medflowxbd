import { XCircle, CheckCircle2, AlertTriangle, Calculator, Users, Truck } from 'lucide-react';

const problems = [
  {
    icon: AlertTriangle,
    problem: 'ওষুধ এক্সপায়ার হয়ে যায়, টাকা নষ্ট হয়',
    solution: '৩০/৬০/৯০ দিন আগে এলার্ট পান, সময় মতো বিক্রি করুন',
    color: 'destructive',
    solutionColor: 'success',
  },
  {
    icon: Calculator,
    problem: 'দৈনিক হিসাব মেলানো কঠিন',
    solution: 'স্বয়ংক্রিয় ক্যাশ ফ্লো — ওপেনিং থেকে ক্লোজিং পর্যন্ত',
    color: 'destructive',
    solutionColor: 'success',
  },
  {
    icon: Users,
    problem: 'কাস্টমার বাকি মনে রাখা যায় না',
    solution: 'সব বাকি এক জায়গায়, পেমেন্ট হিস্ট্রি সহ',
    color: 'destructive',
    solutionColor: 'success',
  },
  {
    icon: Truck,
    problem: 'সাপ্লায়ার পেমেন্ট গোলমাল হয়',
    solution: 'সাপ্লায়ার ড্যাশবোর্ড — কত দিলাম, কত বাকি সব পরিষ্কার',
    color: 'destructive',
    solutionColor: 'success',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
            <span className="text-secondary-foreground text-sm font-semibold">কেন MedFlowx?</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            আপনার সমস্যার সমাধান আমাদের কাছে
          </h2>
          <p className="text-lg text-muted-foreground">
            ফার্মেসি চালাতে গিয়ে যে সমস্যাগুলোর মুখে পড়েন, তার সবকিছুর সমাধান এক জায়গায়।
          </p>
        </div>

        {/* Problem-Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {problems.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            >
              {/* Problem */}
              <div className="p-6 bg-destructive/5 border-b border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-destructive uppercase tracking-wide">সমস্যা</span>
                    <p className="text-foreground font-medium mt-1">{item.problem}</p>
                  </div>
                </div>
              </div>
              
              {/* Solution */}
              <div className="p-6 bg-success/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-success uppercase tracking-wide">MedFlowx সমাধান</span>
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
