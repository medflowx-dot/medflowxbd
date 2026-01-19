import { Smartphone, Bell, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileAppComingSoon = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary-foreground text-sm font-semibold">শীঘ্রই আসছে</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              মোবাইল অ্যাপ <br className="hidden md:block" />
              <span className="text-primary">আসছে শীঘ্রই!</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              আপনার পকেটে থাকবে আপনার পুরো ফার্মেসি। বিক্রয়, স্টক, রিপোর্ট — 
              সব কিছু এক ট্যাপেই। Android ও iOS উভয় প্ল্যাটফর্মে।
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">পুশ নোটিফিকেশন</p>
                  <p className="text-xs text-muted-foreground">এক্সপায়ারি এলার্ট সাথে সাথে</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">অফলাইন মোড</p>
                  <p className="text-xs text-muted-foreground">ইন্টারনেট ছাড়াও কাজ করুন</p>
                </div>
              </div>
            </div>

            {/* Notify Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group">
                <Bell className="w-4 h-4 mr-2" />
                লঞ্চে জানতে চাই
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['ম', 'ফ', 'আ'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-background"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">+২৩০ জন অপেক্ষায়</span>
              </div>
            </div>
          </div>

          {/* Right - Phone Mockup */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/20 blur-3xl -z-10 scale-90" />
              
              {/* Phone Frame */}
              <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[640px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground rounded-b-2xl z-20" />
                
                {/* Screen */}
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-12 bg-primary flex items-end justify-between px-6 pb-2">
                    <span className="text-primary-foreground text-xs">৯:৪১</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-primary-foreground rounded-sm">
                        <div className="w-3/4 h-full bg-primary-foreground rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="bg-primary px-4 pb-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-foreground/70 text-xs">স্বাগতম</p>
                        <p className="text-primary-foreground font-bold">নিউ লাইফ ফার্মেসি</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-4 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-card rounded-xl p-3 border border-border">
                        <p className="text-xs text-muted-foreground">আজকের বিক্রয়</p>
                        <p className="text-lg font-bold text-foreground">৳ ২৫,৪৫০</p>
                        <span className="text-xs text-success">+১২%</span>
                      </div>
                      <div className="bg-card rounded-xl p-3 border border-border">
                        <p className="text-xs text-muted-foreground">ক্লোজিং</p>
                        <p className="text-lg font-bold text-foreground">৳ ৪৮,২৩০</p>
                        <span className="text-xs text-muted-foreground">ক্যাশ</span>
                      </div>
                    </div>

                    {/* Alert Card */}
                    <div className="bg-destructive/10 rounded-xl p-3 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                          <Bell className="w-3 h-3 text-destructive" />
                        </div>
                        <p className="text-sm font-semibold text-destructive">৩টি ওষুধ এক্সপায়ার হচ্ছে</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-8">আগামী ৩০ দিনে</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: '💊', label: 'ওষুধ' },
                        { icon: '🛒', label: 'বিক্রয়' },
                        { icon: '📊', label: 'রিপোর্ট' },
                        { icon: '💰', label: 'ক্যাশ' },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-xl">
                            {item.icon}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-card rounded-xl p-3 border border-border">
                      <p className="text-xs font-semibold text-foreground mb-2">সাম্প্রতিক বিক্রয়</p>
                      <div className="space-y-2">
                        {[
                          { name: 'নাপা এক্সট্রা', price: '৳ ৪০' },
                          { name: 'সেকলো ২০', price: '৳ ২৮০' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                            <span className="text-xs text-foreground">{item.name}</span>
                            <span className="text-xs font-semibold text-foreground">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4">
                    {['🏠', '💊', '➕', '📊', '⚙️'].map((icon, i) => (
                      <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 2 ? 'bg-primary text-xl' : 'text-lg'}`}>
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-4 top-20 bg-card rounded-xl p-3 shadow-lg border border-border animate-float">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Play Store</p>
                    <p className="text-[10px] text-muted-foreground">শীঘ্রই</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 bottom-32 bg-card rounded-xl p-3 shadow-lg border border-border animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-foreground" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">App Store</p>
                    <p className="text-[10px] text-muted-foreground">শীঘ্রই</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppComingSoon;
