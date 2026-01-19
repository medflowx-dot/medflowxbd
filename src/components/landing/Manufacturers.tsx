const manufacturers = [
  { name: 'Square', namebn: 'স্কয়ার' },
  { name: 'Incepta', namebn: 'ইনসেপ্টা' },
  { name: 'Beximco', namebn: 'বেক্সিমকো' },
  { name: 'Renata', namebn: 'রেনাটা' },
  { name: 'Acme', namebn: 'একমি' },
  { name: 'Healthcare', namebn: 'হেলথকেয়ার' },
  { name: 'ACI', namebn: 'এসিআই' },
  { name: 'Opsonin', namebn: 'অপসনিন' },
  { name: 'Eskayef', namebn: 'এস্কায়েফ' },
  { name: 'Drug Intl', namebn: 'ড্রাগ ইন্টারন্যাশনাল' },
  { name: 'Aristopharma', namebn: 'এরিস্টোফার্মা' },
  { name: 'Ibn Sina', namebn: 'ইবনে সিনা' },
];

const Manufacturers = () => {
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
          <div className="flex gap-6 md:gap-8 animate-marquee">
            {[...manufacturers, ...manufacturers].map((manufacturer, index) => (
              <div
                key={`${manufacturer.name}-${index}`}
                className="flex-shrink-0 px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  {/* Logo Placeholder */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-primary font-bold text-lg">
                      {manufacturer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground whitespace-nowrap">
                      {manufacturer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {manufacturer.namebn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Reverse Direction */}
        <div className="relative mt-4">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-muted/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-muted/80 to-transparent z-10" />
          
          {/* Scrolling Container - Reverse */}
          <div className="flex gap-6 md:gap-8 animate-marquee-reverse">
            {[...manufacturers.slice(6), ...manufacturers.slice(0, 6), ...manufacturers.slice(6), ...manufacturers.slice(0, 6)].map((manufacturer, index) => (
              <div
                key={`${manufacturer.name}-reverse-${index}`}
                className="flex-shrink-0 px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  {/* Logo Placeholder */}
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <span className="text-secondary font-bold text-lg">
                      {manufacturer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground whitespace-nowrap">
                      {manufacturer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {manufacturer.namebn}
                    </p>
                  </div>
                </div>
              </div>
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
