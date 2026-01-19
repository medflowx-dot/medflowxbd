import { Pill, Mail, Phone, MapPin, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'সুবিধাসমূহ', href: '#features' },
      { label: 'প্যাকেজ', href: '#pricing' },
      { label: 'কিভাবে কাজ করে', href: '#how-it-works' },
      { label: 'জিজ্ঞাসা', href: '#faq' },
    ],
    company: [
      { label: 'আমাদের সম্পর্কে', href: '#' },
      { label: 'যোগাযোগ', href: '#' },
      { label: 'ক্যারিয়ার', href: '#' },
      { label: 'ব্লগ', href: '#' },
    ],
    legal: [
      { label: 'প্রাইভেসি পলিসি', href: '#' },
      { label: 'সেবার শর্তাবলী', href: '#' },
      { label: 'রিফান্ড পলিসি', href: '#' },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">
                Med<span className="text-primary">Flow</span>x
              </span>
            </a>
            <p className="text-background/70 mb-6 max-w-sm leading-relaxed">
              বাংলাদেশের ফার্মেসির জন্য তৈরি মেয়াদ ট্র্যাকিং ও আর্থিক হিসাব সফটওয়্যার। 
              এক্সপায়ারি ট্র্যাক করুন, আয় ম্যানেজ করুন, সাপ্লায়ার বাকি নিয়ন্ত্রণ করুন।
            </p>
            <div className="space-y-3">
              <a href="mailto:support@medflowx.com" className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                support@medflowx.com
              </a>
              <a href="tel:+8801XXXXXXXXX" className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Phone className="w-5 h-5" />
                +৮৮০ ১XXX-XXXXXX
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5" />
                ঢাকা, বাংলাদেশ
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-bold mb-6">প্রোডাক্ট</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold mb-6">কোম্পানি</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold mb-6">আইনি</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} MedFlowx। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
