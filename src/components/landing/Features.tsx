import { 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Wallet, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'মেয়াদ ও ব্যাচ ট্র্যাকিং',
    description: '৩০/৬০/৯০ দিন আগে এক্সপায়ারি এলার্ট পান। ব্যাচ নম্বর সহ প্রতিটি ওষুধ ট্র্যাক করুন।',
    color: 'primary',
    gradient: 'from-teal-500/20 to-cyan-500/10',
  },
  {
    icon: ShoppingCart,
    title: 'বিক্রয় ও বাকি হিসাব',
    description: 'ক্যাশ ও বাকি বিক্রয় রেকর্ড করুন। কাস্টমার বাকি আংশিক পেমেন্ট সহ ট্র্যাক করুন।',
    color: 'secondary',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: Truck,
    title: 'সাপ্লায়ার ম্যানেজমেন্ট',
    description: 'সাপ্লায়ার পেমেন্ট, বাকি হিসাব এবং বিস্তারিত রিপোর্ট এক জায়গায়।',
    color: 'primary',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    icon: Wallet,
    title: 'দৈনিক ক্যাশ ফ্লো',
    description: 'স্বয়ংক্রিয় হিসাব — ওপেনিং, আয়, খরচ এবং ক্লোজিং ব্যালেন্স দেখুন।',
    color: 'secondary',
    gradient: 'from-yellow-500/20 to-amber-500/10',
  },
  {
    icon: FileText,
    title: 'স্টক শর্ট লিস্ট',
    description: 'ম্যানুফ্যাকচারার ভিত্তিক অর্ডার লিস্ট তৈরি করুন। হোয়াটসঅ্যাপে শেয়ার করুন।',
    color: 'primary',
    gradient: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'রিপোর্ট ও বিশ্লেষণ',
    description: 'PDF রিপোর্ট — বিক্রয়, সাপ্লায়ার, ক্যাশ ফ্লো সবকিছু বাংলাদেশি টাকায় (৳)।',
    color: 'secondary',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-semibold">শক্তিশালী ফিচার</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            সম্পূর্ণ মেয়াদ ও আর্থিক ট্র্যাকিং
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            বাংলাদেশি ফার্মেসির জন্য বিশেষভাবে তৈরি সম্পূর্ণ সমাধান। 
            মেয়াদ ট্র্যাক করুন, আয় ম্যানেজ করুন, এক ড্যাশবোর্ড থেকে সব নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-feature-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                  feature.color === 'primary' 
                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/10' 
                    : 'bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary shadow-lg shadow-secondary/10'
                }`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: AlertTriangle, title: 'এক্সপায়ারি এলার্ট', desc: 'স্টক নষ্ট হওয়ার আগেই জানুন', color: 'warning' },
            { icon: Users, title: 'স্টাফ রোল', desc: 'কে কী দেখতে পারবে সেটা নিয়ন্ত্রণ করুন', color: 'primary' },
            { icon: Clock, title: 'রিয়েল-টাইম সিঙ্ক', desc: 'সব ডিভাইসে তাৎক্ষণিক আপডেট', color: 'success' },
          ].map((item) => (
            <div 
              key={item.title}
              className="group flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-accent/80 to-accent/40 border border-accent backdrop-blur-sm hover:from-accent hover:to-accent/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                item.color === 'warning' ? 'bg-warning/20 text-warning' :
                item.color === 'primary' ? 'bg-primary/20 text-primary' :
                'bg-success/20 text-success'
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
