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
  },
  {
    icon: ShoppingCart,
    title: 'বিক্রয় ও বাকি হিসাব',
    description: 'ক্যাশ ও বাকি বিক্রয় রেকর্ড করুন। কাস্টমার বাকি আংশিক পেমেন্ট সহ ট্র্যাক করুন।',
    color: 'secondary',
  },
  {
    icon: Truck,
    title: 'সাপ্লায়ার ম্যানেজমেন্ট',
    description: 'সাপ্লায়ার পেমেন্ট, বাকি হিসাব এবং বিস্তারিত রিপোর্ট এক জায়গায়।',
    color: 'primary',
  },
  {
    icon: Wallet,
    title: 'দৈনিক ক্যাশ ফ্লো',
    description: 'স্বয়ংক্রিয় হিসাব — ওপেনিং, আয়, খরচ এবং ক্লোজিং ব্যালেন্স দেখুন।',
    color: 'secondary',
  },
  {
    icon: FileText,
    title: 'স্টক শর্ট লিস্ট',
    description: 'ম্যানুফ্যাকচারার ভিত্তিক অর্ডার লিস্ট তৈরি করুন। হোয়াটসঅ্যাপে শেয়ার করুন।',
    color: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'রিপোর্ট ও বিশ্লেষণ',
    description: 'PDF রিপোর্ট — বিক্রয়, সাপ্লায়ার, ক্যাশ ফ্লো সবকিছু বাংলাদেশি টাকায় (৳)।',
    color: 'secondary',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent mb-6">
            <span className="text-accent-foreground text-sm font-semibold">শক্তিশালী ফিচার</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            সম্পূর্ণ মেয়াদ ও আর্থিক ট্র্যাকিং
          </h2>
          <p className="text-lg text-muted-foreground">
            বাংলাদেশি ফার্মেসির জন্য বিশেষভাবে তৈরি সম্পূর্ণ সমাধান। 
            মেয়াদ ট্র্যাক করুন, আয় ম্যানেজ করুন, এক ড্যাশবোর্ড থেকে সব নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                feature.color === 'primary' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-secondary/10 text-secondary'
              }`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <div>
              <h4 className="font-semibold text-foreground">এক্সপায়ারি এলার্ট</h4>
              <p className="text-sm text-muted-foreground">স্টক নষ্ট হওয়ার আগেই জানুন</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">স্টাফ রোল</h4>
              <p className="text-sm text-muted-foreground">কে কী দেখতে পারবে সেটা নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <Clock className="w-8 h-8 text-success" />
            <div>
              <h4 className="font-semibold text-foreground">রিয়েল-টাইম সিঙ্ক</h4>
              <p className="text-sm text-muted-foreground">সব ডিভাইসে তাৎক্ষণিক আপডেট</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
