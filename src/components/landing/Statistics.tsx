import { Store, Package, TrendingUp, Users, LucideIcon } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
  Store,
  Package,
  TrendingUp,
  Users,
};

// Fallback data
const fallbackStats = [
  {
    icon: 'Store',
    value: '৫০০+',
    label: 'ফার্মেসি',
    description: 'সারা বাংলাদেশে',
    color: 'primary',
  },
  {
    icon: 'Package',
    value: '১ লাখ+',
    label: 'ওষুধ ট্র্যাক',
    description: 'প্রতিদিন',
    color: 'secondary',
  },
  {
    icon: 'TrendingUp',
    value: '৫ কোটি+',
    label: 'টাকার বিক্রয়',
    description: 'প্রতি মাসে রেকর্ড',
    color: 'success',
  },
  {
    icon: 'Users',
    value: '১,২০০+',
    label: 'একটিভ ইউজার',
    description: 'প্রতিদিন',
    color: 'primary',
  },
];

const Statistics = () => {
  const { data: cmsContent } = useCMSContent('statistics');
  
  const title = getCMSValue(cmsContent, 'title', 'সংখ্যায় আমাদের সাফল্য');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'বাংলাদেশের ফার্মেসি মালিকরা প্রতিদিন MedFlowx দিয়ে তাদের ব্যবসা পরিচালনা করছেন');
  const stats = getCMSValue(cmsContent, 'items', fallbackStats);
  const ctaText = getCMSValue(cmsContent, 'cta_text', 'আপনিও এই পরিবারের অংশ হতে পারেন —');
  const ctaLinkText = getCMSValue(cmsContent, 'cta_link_text', 'আজই শুরু করুন');
  const ctaLink = getCMSValue(cmsContent, 'cta_link', '/signup');

  return (
    <section className="py-16 md:py-24 bg-hero-gradient relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-light/5 rounded-full blur-3xl" />
      
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
            {title}
          </h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto items-stretch">
          {stats.map((stat: any, index: number) => {
            const IconComponent = iconMap[stat.icon] || Store;
            return (
              <div
                key={stat.label || index}
                className="relative group h-full"
              >
                <div className="glass-stats-card rounded-2xl p-6 md:p-8 text-center transition-all duration-500 h-full flex flex-col justify-between">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/10 to-transparent" />
                  
                  <div>
                    {/* Icon */}
                    <div className={`relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${
                      stat.color === 'primary' 
                        ? 'bg-gradient-to-br from-primary-foreground/25 to-primary-foreground/10' 
                        : stat.color === 'secondary'
                        ? 'bg-gradient-to-br from-secondary/40 to-secondary/20'
                        : 'bg-gradient-to-br from-success/40 to-success/20'
                    }`}>
                      <IconComponent className={`w-7 h-7 md:w-8 md:h-8 ${
                        stat.color === 'primary' 
                          ? 'text-primary-foreground' 
                          : stat.color === 'secondary'
                          ? 'text-secondary'
                          : 'text-success'
                      }`} />
                    </div>

                    {/* Value */}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-2 transition-transform duration-300 group-hover:scale-105">
                      {stat.value}
                    </h3>

                    {/* Label */}
                    <p className="text-base md:text-lg font-semibold text-primary-foreground/90 mb-1">
                      {stat.label}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-primary-foreground/60 mt-auto">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-primary-foreground/80 text-lg">
            {ctaText}
            <a href={ctaLink} className="text-secondary font-semibold hover:underline ml-1 transition-all hover:text-secondary-light">
              {ctaLinkText}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
