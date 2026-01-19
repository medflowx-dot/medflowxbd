import { Star, Quote, Sparkles } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Fallback testimonials
const fallbackTestimonials = [
  {
    name: 'মোঃ রফিকুল ইসলাম',
    role: 'মালিক, নিউ লাইফ ফার্মেসি',
    location: 'মিরপুর, ঢাকা',
    rating: 5,
    text: 'MedFlowx ব্যবহার করার পর থেকে আমার ফার্মেসিতে এক্সপায়ার্ড ওষুধের লস প্রায় শূন্যে নেমে এসেছে। আগে প্রতি মাসে হাজার হাজার টাকার ওষুধ নষ্ট হতো।',
  },
  {
    name: 'ফাতেমা খাতুন',
    role: 'ম্যানেজার, গ্রিন মেডিকেল হল',
    location: 'চট্টগ্রাম',
    rating: 5,
    text: 'দৈনিক ক্যাশ ফ্লো ফিচারটা অসাধারণ! আগে রাতে ঘন্টা খরচ করে হিসাব মেলাতে হতো, এখন সব অটোমেটিক। সময় বাঁচছে, ভুলও কমেছে।',
  },
  {
    name: 'আব্দুল করিম',
    role: 'মালিক, করিম ফার্মেসি',
    location: 'রাজশাহী',
    rating: 5,
    text: 'সাপ্লায়ার বাকি ট্র্যাক করা এখন অনেক সহজ। কোন সাপ্লায়ারকে কত দিতে হবে, কবে দিয়েছি — সব এক জায়গায় পরিষ্কার দেখতে পাই।',
  },
  {
    name: 'নাজমুল হাসান',
    role: 'মালিক, হাসান মেডিকেল স্টোর',
    location: 'সিলেট',
    rating: 5,
    text: 'স্টাফদের আলাদা আলাদা পারমিশন দিতে পারি, এটা দারুণ। কে কী দেখতে পারবে সেটা আমি কন্ট্রোল করি। ফার্মেসি ম্যানেজমেন্ট এখন অনেক সহজ।',
  },
  {
    name: 'সালমা বেগম',
    role: 'মালিক, সালমা ফার্মেসি',
    location: 'খুলনা',
    rating: 5,
    text: 'মোবাইলে সব কাজ করতে পারি। দোকানে না থাকলেও বিক্রয় রিপোর্ট, স্টক সব দেখতে পাই। সত্যিই জীবন সহজ করে দিয়েছে MedFlowx।',
  },
  {
    name: 'মোঃ আনোয়ার হোসেন',
    role: 'মালিক, আনোয়ার ড্রাগ হাউস',
    location: 'বরিশাল',
    rating: 5,
    text: 'PDF রিপোর্ট জেনারেট করে সরাসরি হোয়াটসঅ্যাপে শেয়ার করি। সাপ্লায়ারদের অর্ডার পাঠানো এখন মাত্র কয়েক ক্লিকে হয়ে যায়।',
  },
];

const Testimonials = () => {
  const { data: cmsContent } = useCMSContent('testimonials');
  
  const title = getCMSValue(cmsContent, 'title', 'তাদের অভিজ্ঞতা, তাদের ভাষায়');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'বাংলাদেশের বিভিন্ন প্রান্তের ফার্মেসি মালিকরা MedFlowx নিয়ে কী বলছেন।');
  const testimonials = getCMSValue(cmsContent, 'items', fallbackTestimonials);
  const trustBadgeText = getCMSValue(cmsContent, 'trust_badge_text', '৫০০+ ফার্মেসি');

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-secondary/15 to-secondary/5 border border-secondary/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-secondary-foreground text-sm font-semibold">গ্রাহকদের কথা</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="group glass-feature-card hover:scale-[1.02]"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <Quote className="w-10 h-10 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground leading-relaxed mb-6 relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-hero-gradient flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl glass-card hover:shadow-lg transition-all duration-300">
            <div className="flex -space-x-3">
              {['ম', 'ফ', 'আ', 'ন'].map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center text-primary-foreground text-sm font-bold border-2 border-card shadow-md"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">{trustBadgeText}</p>
              <p className="text-sm text-muted-foreground">ইতিমধ্যে MedFlowx ব্যবহার করছে</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
