import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Statistics from '@/components/landing/Statistics';
import Manufacturers from '@/components/landing/Manufacturers';
import Features from '@/components/landing/Features';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SpecialFeatures from '@/components/landing/SpecialFeatures';
import HowItWorks from '@/components/landing/HowItWorks';
import MobileAppComingSoon from '@/components/landing/MobileAppComingSoon';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Contact from '@/components/landing/Contact';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { ScrollAnimationWrapper } from '@/hooks/useScrollAnimation';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      <ScrollAnimationWrapper>
        <Statistics />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={100}>
        <Manufacturers />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <section id="features">
          <Features />
        </section>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={50}>
        <WhyChooseUs />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <SpecialFeatures />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <section id="how-it-works">
          <HowItWorks />
        </section>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper delay={100}>
        <MobileAppComingSoon />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <Testimonials />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <section id="pricing">
          <Pricing />
        </section>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <section id="faq">
          <FAQ />
        </section>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <section id="contact">
          <Contact />
        </section>
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <CTA />
      </ScrollAnimationWrapper>
      
      <Footer />
    </div>
  );
};

export default Index;
