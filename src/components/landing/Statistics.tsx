import { Store, Package, TrendingUp, Users } from 'lucide-react';

const stats = [
  {
    icon: Store,
    value: '৫০০+',
    label: 'ফার্মেসি',
    description: 'সারা বাংলাদেশে',
    color: 'primary',
  },
  {
    icon: Package,
    value: '১ লাখ+',
    label: 'ওষুধ ট্র্যাক',
    description: 'প্রতিদিন',
    color: 'secondary',
  },
  {
    icon: TrendingUp,
    value: '৫ কোটি+',
    label: 'টাকার বিক্রয়',
    description: 'প্রতি মাসে রেকর্ড',
    color: 'success',
  },
  {
    icon: Users,
    value: '১,২০০+',
    label: 'একটিভ ইউজার',
    description: 'প্রতিদিন',
    color: 'primary',
  },
];

const Statistics = () => {
  return (
    <section className="py-16 md:py-24 bg-hero-gradient relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
            সংখ্যায় আমাদের সাফল্য
          </h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            বাংলাদেশের ফার্মেসি মালিকরা প্রতিদিন MedFlowx দিয়ে তাদের ব্যবসা পরিচালনা করছেন
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group"
            >
              <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 md:p-8 text-center hover:bg-primary-foreground/15 transition-all duration-300 hover:scale-105">
                {/* Icon */}
                <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  stat.color === 'primary' 
                    ? 'bg-primary-foreground/20' 
                    : stat.color === 'secondary'
                    ? 'bg-secondary/30'
                    : 'bg-success/30'
                }`}>
                  <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${
                    stat.color === 'primary' 
                      ? 'text-primary-foreground' 
                      : stat.color === 'secondary'
                      ? 'text-secondary'
                      : 'text-success'
                  }`} />
                </div>

                {/* Value */}
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2">
                  {stat.value}
                </h3>

                {/* Label */}
                <p className="text-base md:text-lg font-semibold text-primary-foreground/90 mb-1">
                  {stat.label}
                </p>

                {/* Description */}
                <p className="text-xs md:text-sm text-primary-foreground/60">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-primary-foreground/80 text-lg">
            আপনিও এই পরিবারের অংশ হতে পারেন — 
            <a href="/signup" className="text-secondary font-semibold hover:underline ml-1">
              আজই শুরু করুন
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
