import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Zap, BarChart3, Package, TrendingUp, Wallet, AlertTriangle, Users, ShoppingCart } from 'lucide-react';

const DashboardMockup = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-8 md:mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-secondary/10 blur-3xl -z-10" />
      
      {/* Main Dashboard Card - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
        {/* Glass Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80 shadow-lg shadow-destructive/30" />
            <div className="w-3 h-3 rounded-full bg-secondary/80 shadow-lg shadow-secondary/30" />
            <div className="w-3 h-3 rounded-full bg-success/80 shadow-lg shadow-success/30" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-xs text-white/70 border border-white/10">
              medflowx.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          {/* Stat Card 1 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-float hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20" style={{ animationDelay: '0s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-success font-medium bg-success/20 px-2 py-0.5 rounded-full">+১২%</span>
            </div>
            <p className="text-xs text-white/60">আজকের বিক্রয়</p>
            <p className="text-lg font-bold text-white">৳ ২৫,৪৫০</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-float hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/20" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">ক্যাশ</span>
            </div>
            <p className="text-xs text-white/60">ক্লোজিং ব্যালেন্স</p>
            <p className="text-lg font-bold text-white">৳ ৪৮,২৩০</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-float hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-destructive/20" style={{ animationDelay: '1s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-destructive font-medium bg-destructive/20 px-2 py-0.5 rounded-full">সতর্কতা</span>
            </div>
            <p className="text-xs text-white/60">এক্সপায়ারি এলার্ট</p>
            <p className="text-lg font-bold text-white">১২ টি</p>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 animate-float hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-success/20" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-success font-medium bg-success/20 px-2 py-0.5 rounded-full">স্টক</span>
            </div>
            <p className="text-xs text-white/60">মোট ওষুধ</p>
            <p className="text-lg font-bold text-white">৪৭৮ টি</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-4 md:px-6 pb-4 md:pb-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative z-10">
          {/* Recent Sales */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">সাম্প্রতিক বিক্রয়</h4>
              <span className="text-xs text-secondary cursor-pointer hover:text-secondary/80 transition-colors">সব দেখুন</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'নাপা এক্সট্রা', qty: '২ পাতা', price: '৳ ৪০' },
                { name: 'সেকলো ২০', qty: '১ বক্স', price: '৳ ২৮০' },
                { name: 'মেট্রিক ৫০০', qty: '৫ পিস', price: '৳ ৭৫' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-white/50">{item.qty}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <h4 className="text-sm font-semibold text-white mb-3">দ্রুত কাজ</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-primary/40 transition-all duration-300 border border-primary/30 hover:scale-[1.02]">
                <ShoppingCart className="w-4 h-4" />
                নতুন বিক্রয়
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-secondary/40 transition-all duration-300 border border-secondary/30 hover:scale-[1.02]">
                <Package className="w-4 h-4" />
                ওষুধ যোগ করুন
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-[1.02]">
                <TrendingUp className="w-4 h-4" />
                রিপোর্ট দেখুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements - Glassmorphism */}
      <div className="hidden md:block absolute -right-4 top-20 bg-white/15 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white/20 animate-float hover:scale-110 transition-transform" style={{ animationDelay: '0.3s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl pointer-events-none" />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-success/30 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/60">মাসিক লাভ</p>
            <p className="text-sm font-bold text-success">+২৩% ↑</p>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute -left-4 top-40 bg-white/15 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white/20 animate-float hover:scale-110 transition-transform" style={{ animationDelay: '0.8s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl pointer-events-none" />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/60">অ্যাক্টিভ স্টাফ</p>
            <p className="text-sm font-bold text-white">৩ জন</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-hero-overlay" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl animate-pulse-slow" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Glassmorphism */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8 animate-fade-in shadow-lg shadow-primary/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" />
            <span className="text-white/90 text-sm font-medium">
              বাংলাদেশের ৫০০+ ফার্মেসির বিশ্বস্ত সফটওয়্যার
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight animate-fade-in drop-shadow-2xl" style={{ animationDelay: '0.1s' }}>
            আপনার ফার্মেসি ব্যবসা
            <br />
            <span className="relative">
              এখন আরও সহজ
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 100 2 150 4C200 6 250 8 298 4" stroke="hsl(38 92% 50%)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
            {' '}ও লাভজনক
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            মেয়াদ উত্তীর্ণের আগেই এলার্ট পান, দৈনিক হিসাব স্বয়ংক্রিয়ভাবে দেখুন, 
            সাপ্লায়ার ও কাস্টমার বাকি ট্র্যাক করুন — সব এক জায়গায়।
          </p>

          {/* CTA Buttons - Glassmorphism */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="group shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 transition-all duration-300" asChild>
              <Link to="/signup">
                ৭ দিন ফ্রি ট্রায়াল শুরু করুন
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" className="group bg-white/10 backdrop-blur-xl border-white/30 hover:bg-white/20 shadow-xl transition-all duration-300">
              <Play className="w-5 h-5" />
              ডেমো দেখুন
            </Button>
          </div>

          {/* Trust Indicators - Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">ব্যাংক-লেভেল সিকিউরিটি</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">৫ মিনিটে সেটআপ</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">রিয়েল-টাইম রিপোর্ট</span>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <DashboardMockup />
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
