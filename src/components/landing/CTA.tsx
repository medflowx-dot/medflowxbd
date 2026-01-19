import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Pill, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-light/10 rounded-full blur-3xl" />
      </div>
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Glass Card Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 md:p-12 lg:p-16 rounded-3xl overflow-hidden">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-primary-foreground/5 backdrop-blur-xl border border-primary-foreground/10 rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary-foreground/20 to-primary-foreground/5 border border-primary-foreground/20 flex items-center justify-center shadow-2xl">
                <Pill className="w-10 h-10 text-primary-foreground" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-secondary/40 mb-6">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-secondary font-semibold text-sm">আজই শুরু করুন</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
                আপনার ফার্মেসি ব্যবসা বদলে দিতে প্রস্তুত?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                বাংলাদেশের শত শত ফার্মেসি ইতিমধ্যে MedFlowx দিয়ে সময় বাঁচাচ্ছে, 
                ভুল কমাচ্ছে এবং ব্যবসা বাড়াচ্ছে।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button variant="hero" size="xl" className="group shadow-2xl shadow-secondary/30" asChild>
                  <Link to="/signup">
                    ফ্রি ট্রায়াল শুরু করুন
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="xl" className="group backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                  যোগাযোগ করুন
                </Button>
              </div>

              {/* Trust Line */}
              <div className="flex items-center justify-center gap-6 flex-wrap text-primary-foreground/60 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  কোনো ক্রেডিট কার্ড লাগবে না
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  ৭ দিন ফ্রি
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  যেকোনো সময় বাতিল করুন
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
