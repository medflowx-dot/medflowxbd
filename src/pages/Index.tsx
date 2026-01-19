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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Statistics />
      <Manufacturers />
      <Features />
      <WhyChooseUs />
      <SpecialFeatures />
      <HowItWorks />
      <MobileAppComingSoon />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
