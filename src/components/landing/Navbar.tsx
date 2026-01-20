import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';
import { useTheme } from 'next-themes';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import logoLightFallback from '@/assets/logo-light.png';
import logoDarkFallback from '@/assets/logo-dark.png';

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
  const { resolvedTheme, setTheme } = useTheme();
  const { logoLight, logoDark } = usePlatformBranding();

  const loginText = getCMSValue(cmsContent, 'loginText', 'লগইন');
  const signupText = getCMSValue(cmsContent, 'signupText', 'ফ্রি ট্রায়াল শুরু করুন');
  const navLinks = getCMSValue(cmsContent, 'navLinks', defaultNavLinks);

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

  // Choose logo based on theme (with fallbacks for static imports)
  const lightLogo = logoLight.startsWith('/src') ? logoLightFallback : logoLight;
  const darkLogo = logoDark.startsWith('/src') ? logoDarkFallback : logoDark;
  const logo = resolvedTheme === 'dark' ? darkLogo : lightLogo;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img 
              src={logo} 
              alt="MedFlowx" 
              className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform"
            />
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
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="relative h-10 w-10 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 text-warning rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 text-primary rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </button>
            
            <Button variant="ghost" size="default" asChild>
              <Link to="/login">{loginText}</Link>
            </Button>
            <Button variant="default" size="default" className="shadow-lg shadow-primary/20" asChild>
              <Link to="/signup">{signupText}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="relative h-9 w-9 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 text-warning rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 text-primary rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </button>
            
            <button
              className="h-9 w-9 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary/10 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
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
