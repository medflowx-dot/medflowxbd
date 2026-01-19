// Imported logos
import squareLogo from '@/assets/logos/square.png';
import inceptaLogo from '@/assets/logos/incepta.png';
import renataLogo from '@/assets/logos/renata.png';
import opsoninLogo from '@/assets/logos/opsonin.png';
import beximcoLogo from '@/assets/logos/beximco.png';
import acmeLogo from '@/assets/logos/acme.png';
import healthcareLogo from '@/assets/logos/healthcare.png';
import aciLogo from '@/assets/logos/aci.png';
import eskayefLogo from '@/assets/logos/eskayef.png';
import drugintlLogo from '@/assets/logos/drugintl.png';
import aristopharmaLogo from '@/assets/logos/aristopharma.png';
import ibnsinaLogo from '@/assets/logos/ibnsina.png';
import popularLogo from '@/assets/logos/popular.png';
import radiantLogo from '@/assets/logos/radiant.png';
import nuvistaLogo from '@/assets/logos/nuvista.png';
import generalLogo from '@/assets/logos/general.png';

interface Manufacturer {
  name: string;
  namebn: string;
  logo: string;
}

const manufacturers: Manufacturer[] = [
  { name: 'Square', namebn: 'স্কয়ার', logo: squareLogo },
  { name: 'Incepta', namebn: 'ইনসেপ্টা', logo: inceptaLogo },
  { name: 'Beximco', namebn: 'বেক্সিমকো', logo: beximcoLogo },
  { name: 'Renata', namebn: 'রেনাটা', logo: renataLogo },
  { name: 'Acme', namebn: 'একমি', logo: acmeLogo },
  { name: 'Healthcare', namebn: 'হেলথকেয়ার', logo: healthcareLogo },
  { name: 'ACI', namebn: 'এসিআই', logo: aciLogo },
  { name: 'Opsonin', namebn: 'অপসনিন', logo: opsoninLogo },
  { name: 'Eskayef', namebn: 'এস্কায়েফ', logo: eskayefLogo },
  { name: 'Drug Intl', namebn: 'ড্রাগ ইন্টারন্যাশনাল', logo: drugintlLogo },
  { name: 'Aristopharma', namebn: 'এরিস্টোফার্মা', logo: aristopharmaLogo },
  { name: 'Ibn Sina', namebn: 'ইবনে সিনা', logo: ibnsinaLogo },
  { name: 'Popular', namebn: 'পপুলার', logo: popularLogo },
  { name: 'Radiant', namebn: 'রেডিয়েন্ট', logo: radiantLogo },
  { name: 'Nuvista', namebn: 'নুভিস্তা', logo: nuvistaLogo },
  { name: 'General', namebn: 'জেনারেল', logo: generalLogo },
];

const ManufacturerCard = ({ manufacturer }: { manufacturer: Manufacturer }) => {
  return (
    <div className="flex-shrink-0 px-4 py-3 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors p-1">
          <img 
            src={manufacturer.logo} 
            alt={`${manufacturer.name} logo`}
            className="w-full h-full object-contain"
          />
        </div>
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
