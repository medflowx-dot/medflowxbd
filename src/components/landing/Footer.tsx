import { Pill, Mail, Phone, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Fallback footer data
const fallbackFooterLinks = {
  product: [
    { text: 'সুবিধাসমূহ', link: '#features' },
    { text: 'প্যাকেজ', link: '#pricing' },
    { text: 'কিভাবে কাজ করে', link: '#how-it-works' },
    { text: 'জিজ্ঞাসা', link: '#faq' },
  ],
  company: [
    { text: 'আমাদের সম্পর্কে', link: '#' },
    { text: 'যোগাযোগ', link: '#' },
    { text: 'ক্যারিয়ার', link: '#' },
    { text: 'ব্লগ', link: '#' },
  ],
  legal: [
    { text: 'প্রাইভেসি পলিসি', link: '#' },
    { text: 'সেবার শর্তাবলী', link: '#' },
    { text: 'রিফান্ড পলিসি', link: '#' },
  ],
};

const Footer = () => {
  const { data: cmsContent } = useCMSContent('footer');
  const currentYear = new Date().getFullYear();
  
  const brand = getCMSValue(cmsContent, 'brand', {
    name: 'MedFlowx',
    description: 'বাংলাদেশের ফার্মেসির জন্য তৈরি মেয়াদ ট্র্যাকিং ও আর্থিক হিসাব সফটওয়্যার। এক্সপায়ারি ট্র্যাক করুন, আয় ম্যানেজ করুন, সাপ্লায়ার বাকি নিয়ন্ত্রণ করুন।'
  });
  const contact = getCMSValue(cmsContent, 'contact', {
    email: 'support@medflowx.com',
    phone: '+৮৮০ ১XXX-XXXXXX',
    address: 'ঢাকা, বাংলাদেশ'
  });
  const links = getCMSValue(cmsContent, 'links', fallbackFooterLinks);
  const social = getCMSValue(cmsContent, 'social', {
    facebook: '#',
    whatsapp: '#'
  });
  const copyrightText = getCMSValue(cmsContent, 'copyright', '© {year} MedFlowx। সর্বস্বত্ব সংরক্ষিত।');

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
              {brand.description}
            </p>
            <div className="space-y-3">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                {contact.email}
              </a>
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Phone className="w-5 h-5" />
                {contact.phone}
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5" />
                {contact.address}
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-bold mb-6">প্রোডাক্ট</h4>
            <ul className="space-y-3">
              {(links.product || []).map((link: any, index: number) => (
                <li key={index}>
                  <a href={link.link} className="text-background/70 hover:text-primary transition-colors">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold mb-6">কোম্পানি</h4>
            <ul className="space-y-3">
              {(links.company || []).map((link: any, index: number) => (
                <li key={index}>
                  <a href={link.link} className="text-background/70 hover:text-primary transition-colors">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold mb-6">আইনি</h4>
            <ul className="space-y-3">
              {(links.legal || []).map((link: any, index: number) => (
                <li key={index}>
                  <a href={link.link} className="text-background/70 hover:text-primary transition-colors">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            {copyrightText.replace('{year}', currentYear.toString())}
          </p>
          <div className="flex items-center gap-4">
            <a href={social.facebook} className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href={social.whatsapp} className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
