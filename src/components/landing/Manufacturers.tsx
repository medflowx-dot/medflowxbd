// Imported logos
import squareLogo from '@/assets/logos/square.png';
import inceptaLogo from '@/assets/logos/incepta.png';
import renataLogo from '@/assets/logos/renata.png';
import opsoninLogo from '@/assets/logos/opsonin.png';

interface Manufacturer {
  name: string;
  namebn: string;
  logo?: string;
  color: string;
}

const manufacturers: Manufacturer[] = [
  { name: 'Square', namebn: 'স্কয়ার', logo: squareLogo, color: '#0066B3' },
  { name: 'Incepta', namebn: 'ইনসেপ্টা', logo: inceptaLogo, color: '#E31837' },
  { name: 'Beximco', namebn: 'বেক্সিমকো', color: '#C41E3A' },
  { name: 'Renata', namebn: 'রেনাটা', logo: renataLogo, color: '#00A651' },
  { name: 'Acme', namebn: 'একমি', color: '#1E3A8A' },
  { name: 'Healthcare', namebn: 'হেলথকেয়ার', color: '#16A34A' },
  { name: 'ACI', namebn: 'এসিআই', color: '#2563EB' },
  { name: 'Opsonin', namebn: 'অপসনিন', logo: opsoninLogo, color: '#1D4ED8' },
  { name: 'Eskayef', namebn: 'এস্কায়েফ', color: '#0284C7' },
  { name: 'Drug Intl', namebn: 'ড্রাগ ইন্টারন্যাশনাল', color: '#0369A1' },
  { name: 'Aristopharma', namebn: 'এরিস্টোফার্মা', color: '#DC2626' },
  { name: 'Ibn Sina', namebn: 'ইবনে সিনা', color: '#059669' },
  { name: 'Popular', namebn: 'পপুলার', color: '#E11D48' },
  { name: 'Radiant', namebn: 'রেডিয়েন্ট', color: '#0EA5E9' },
  { name: 'Nuvista', namebn: 'নুভিস্তা', color: '#7C3AED' },
  { name: 'General', namebn: 'জেনারেল', color: '#0891B2' },
];

const ManufacturerCard = ({ manufacturer, variant = 'primary' }: { manufacturer: Manufacturer; variant?: 'primary' | 'secondary' }) => {
  return (
    <div className="flex-shrink-0 px-5 py-3.5 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-3">
        {manufacturer.logo ? (
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
            <img 
              src={manufacturer.logo} 
              alt={`${manufacturer.name} logo`}
              className="w-8 h-8 object-contain"
            />
          </div>
        ) : (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{ 
              backgroundColor: `${manufacturer.color}15`,
            }}
          >
            <span 
              className="font-bold text-lg"
              style={{ color: manufacturer.color }}
            >
              {manufacturer.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground whitespace-nowrap text-sm">
            {manufacturer.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {manufacturer.namebn}
          </p>
        </div>
      </div>
    </div>
  );
};

const Manufacturers = () => {
  const firstRow = manufacturers.slice(0, 8);
  const secondRow = manufacturers.slice(8, 16);

  return (
    <section className="py-16 md:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground mb-2">আমাদের ডাটাবেসে আছে</p>
          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
            বাংলাদেশের শীর্ষ ২৮+ ফার্মাসিউটিক্যাল কোম্পানি
          </h3>
        </div>

        {/* Logo Marquee - First Row */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-muted/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-muted/80 to-transparent z-10" />
          
          {/* Scrolling Container */}
          <div className="flex gap-5 md:gap-6 animate-marquee">
            {[...firstRow, ...firstRow, ...firstRow].map((manufacturer, index) => (
              <ManufacturerCard 
                key={`${manufacturer.name}-${index}`} 
                manufacturer={manufacturer}
                variant="primary"
              />
            ))}
          </div>
        </div>

        {/* Second Row - Reverse Direction */}
        <div className="relative mt-4">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-muted/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-muted/80 to-transparent z-10" />
          
          {/* Scrolling Container - Reverse */}
          <div className="flex gap-5 md:gap-6 animate-marquee-reverse">
            {[...secondRow, ...secondRow, ...secondRow].map((manufacturer, index) => (
              <ManufacturerCard 
                key={`${manufacturer.name}-reverse-${index}`} 
                manufacturer={manufacturer}
                variant="secondary"
              />
            ))}
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">৪৭০+</span> ওষুধ আগে থেকেই লোড করা — 
            <span className="text-foreground font-medium"> ম্যানুয়াল এন্ট্রি ছাড়াই শুরু করুন</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Manufacturers;
