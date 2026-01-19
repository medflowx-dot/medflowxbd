import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'মোঃ রফিকুল ইসলাম',
    role: 'মালিক, নিউ লাইফ ফার্মেসি',
    location: 'মিরপুর, ঢাকা',
    image: null,
    rating: 5,
    text: 'MedFlowx ব্যবহার করার পর থেকে আমার ফার্মেসিতে এক্সপায়ার্ড ওষুধের লস প্রায় শূন্যে নেমে এসেছে। আগে প্রতি মাসে হাজার হাজার টাকার ওষুধ নষ্ট হতো।',
  },
  {
    name: 'ফাতেমা খাতুন',
    role: 'ম্যানেজার, গ্রিন মেডিকেল হল',
    location: 'চট্টগ্রাম',
    image: null,
    rating: 5,
    text: 'দৈনিক ক্যাশ ফ্লো ফিচারটা অসাধারণ! আগে রাতে ঘন্টা খরচ করে হিসাব মেলাতে হতো, এখন সব অটোমেটিক। সময় বাঁচছে, ভুলও কমেছে।',
  },
  {
    name: 'আব্দুল করিম',
    role: 'মালিক, করিম ফার্মেসি',
    location: 'রাজশাহী',
    image: null,
    rating: 5,
    text: 'সাপ্লায়ার বাকি ট্র্যাক করা এখন অনেক সহজ। কোন সাপ্লায়ারকে কত দিতে হবে, কবে দিয়েছি — সব এক জায়গায় পরিষ্কার দেখতে পাই।',
  },
  {
    name: 'নাজমুল হাসান',
    role: 'মালিক, হাসান মেডিকেল স্টোর',
    location: 'সিলেট',
    image: null,
    rating: 5,
    text: 'স্টাফদের আলাদা আলাদা পারমিশন দিতে পারি, এটা দারুণ। কে কী দেখতে পারবে সেটা আমি কন্ট্রোল করি। ফার্মেসি ম্যানেজমেন্ট এখন অনেক সহজ।',
  },
  {
    name: 'সালমা বেগম',
    role: 'মালিক, সালমা ফার্মেসি',
    location: 'খুলনা',
    image: null,
    rating: 5,
    text: 'মোবাইলে সব কাজ করতে পারি। দোকানে না থাকলেও বিক্রয় রিপোর্ট, স্টক সব দেখতে পাই। সত্যিই জীবন সহজ করে দিয়েছে MedFlowx।',
  },
  {
    name: 'মোঃ আনোয়ার হোসেন',
    role: 'মালিক, আনোয়ার ড্রাগ হাউস',
    location: 'বরিশাল',
    image: null,
    rating: 5,
    text: 'PDF রিপোর্ট জেনারেট করে সরাসরি হোয়াটসঅ্যাপে শেয়ার করি। সাপ্লায়ারদের অর্ডার পাঠানো এখন মাত্র কয়েক ক্লিকে হয়ে যায়।',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
            <span className="text-secondary-foreground text-sm font-semibold">গ্রাহকদের কথা</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            তাদের অভিজ্ঞতা, তাদের ভাষায়
          </h2>
          <p className="text-lg text-muted-foreground">
            বাংলাদেশের বিভিন্ন প্রান্তের ফার্মেসি মালিকরা MedFlowx নিয়ে কী বলছেন।
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-8 h-8 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border shadow-card">
            <div className="flex -space-x-2">
              {['ম', 'ফ', 'আ', 'ন'].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-card"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">৫০০+ ফার্মেসি</p>
              <p className="text-xs text-muted-foreground">ইতিমধ্যে MedFlowx ব্যবহার করছে</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
