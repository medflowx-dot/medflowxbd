import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Pill } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Default navigation links
const defaultNavLinks = [
  { href: '#features', label: 'সুবিধাসমূহ' },
  { href: '#how-it-works', label: 'কিভাবে কাজ করে' },
  { href: '#pricing', label: 'প্যাকেজ' },
  { href: '#faq', label: 'জিজ্ঞাসা' },
  { href: '#contact', label: 'যোগাযোগ' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: cmsContent } = useCMSContent('navbar');

  const logoText = getCMSValue(cmsContent, 'logoText', 'MedFlowx');
  const logoHighlight = getCMSValue(cmsContent, 'logoHighlight', 'Flow');
  const loginText = getCMSValue(cmsContent, 'loginText', 'লগইন');
  const signupText = getCMSValue(cmsContent, 'signupText', 'ফ্রি ট্রায়াল শুরু করুন');
  const navLinks = getCMSValue(cmsContent, 'navLinks', defaultNavLinks);

  // Split logo text for styling
  const logoPrefix = logoText.replace(logoHighlight, '');

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const navbarHeight = 80; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    
    setIsOpen(false);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              {logoPrefix}<span className="text-primary">{logoHighlight}</span>x
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="default" asChild>
              <Link to="/login">{loginText}</Link>
            </Button>
            <Button variant="default" size="default" asChild>
              <Link to="/signup">{signupText}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link: any) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-muted-foreground hover:text-primary font-medium py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">{loginText}</Link>
                </Button>
                <Button variant="default" className="w-full" asChild>
                  <Link to="/signup">{signupText}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
