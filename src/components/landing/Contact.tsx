import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Phone, Mail, MapPin, Send, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Fallback contact methods
const fallbackContactMethods = [
  {
    icon: 'MessageCircle',
    title: 'হোয়াটসঅ্যাপ',
    value: '+880 1XXX-XXXXXX',
    description: 'সবচেয়ে দ্রুত রেসপন্স',
    action: 'https://wa.me/880',
    actionLabel: 'মেসেজ করুন',
    color: 'success',
  },
  {
    icon: 'Phone',
    title: 'ফোন',
    value: '+880 1XXX-XXXXXX',
    description: 'সকাল ১০টা - রাত ১০টা',
    action: 'tel:+880',
    actionLabel: 'কল করুন',
    color: 'primary',
  },
  {
    icon: 'Mail',
    title: 'ইমেইল',
    value: 'support@medflowx.com',
    description: '২৪ ঘন্টার মধ্যে রিপ্লাই',
    action: 'mailto:support@medflowx.com',
    actionLabel: 'ইমেইল করুন',
    color: 'secondary',
  },
];

const Contact = () => {
  const { data: cmsContent } = useCMSContent('contact');
  
  const title = getCMSValue(cmsContent, 'title', 'আমরা সাহায্য করতে প্রস্তুত');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'যেকোনো প্রশ্ন বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় আপনার পাশে আছি।');
  const sectionBadge = getCMSValue(cmsContent, 'sectionBadge', 'যোগাযোগ করুন');
  const contactTitle = getCMSValue(cmsContent, 'contactTitle', 'সরাসরি যোগাযোগ করুন');
  const contactMethods = getCMSValue(cmsContent, 'methods', fallbackContactMethods);
  const office = getCMSValue(cmsContent, 'office', { title: 'অফিস', address: 'ঢাকা, বাংলাদেশ', note: 'অনলাইন সাপোর্ট ২৪/৭' });
  const formConfig = getCMSValue(cmsContent, 'formConfig', {
    title: 'মেসেজ পাঠান',
    subtitle: 'ফর্ম পূরণ করুন, আমরা শীঘ্রই যোগাযোগ করব',
    nameLabel: 'আপনার নাম',
    namePlaceholder: 'নাম লিখুন',
    phoneLabel: 'ফোন নম্বর',
    phonePlaceholder: '০১XXXXXXXXX',
    pharmacyLabel: 'ফার্মেসির নাম',
    pharmacyPlaceholder: 'আপনার ফার্মেসির নাম (ঐচ্ছিক)',
    messageLabel: 'মেসেজ',
    messagePlaceholder: 'আপনার প্রশ্ন বা মেসেজ লিখুন...',
    submitButtonText: 'মেসেজ পাঠান',
    whatsappButtonText: 'হোয়াটসঅ্যাপে পাঠান',
    successTitle: 'ধন্যবাদ!',
    successMessage: 'আমরা আপনার মেসেজ পেয়েছি এবং শীঘ্রই যোগাযোগ করব।',
  });
  const whatsappNumber = getCMSValue(cmsContent, 'whatsappNumber', '880');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pharmacyName: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('নাম এবং ফোন নম্বর দিন');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করব।');
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', pharmacyName: '', message: '' });
    }, 3000);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `হ্যালো MedFlowx টিম,\n\nআমি ${formData.name || 'একজন ফার্মেসি মালিক'}।\n${formData.pharmacyName ? `ফার্মেসি: ${formData.pharmacyName}\n` : ''}${formData.message ? `\n${formData.message}` : '\nআমি MedFlowx সম্পর্কে জানতে চাই।'}`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle': return MessageCircle;
      case 'Phone': return Phone;
      case 'Mail': return Mail;
      default: return Mail;
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">{sectionBadge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground mb-6">
              {contactTitle}
            </h3>

            {contactMethods.map((method: any, index: number) => {
              const IconComponent = getIconComponent(method.icon);
              return (
                <a
                  key={index}
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-5 bg-card rounded-2xl border border-border shadow-card hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    method.color === 'success' 
                      ? 'bg-success/10 text-success group-hover:bg-success/20' 
                      : method.color === 'primary'
                      ? 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      : 'bg-secondary/10 text-secondary group-hover:bg-secondary/20'
                  } transition-colors`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display font-bold text-foreground">{method.title}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        method.color === 'success' 
                          ? 'bg-success/10 text-success' 
                          : method.color === 'primary'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {method.actionLabel}
                      </span>
                    </div>
                    <p className="text-foreground font-medium">{method.value}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {method.description}
                    </p>
                  </div>
                </a>
              );
            })}

            {/* Location */}
            <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-display font-bold text-foreground mb-1">{office.title}</h4>
                <p className="text-foreground">{office.address}</p>
                <p className="text-sm text-muted-foreground mt-1">{office.note}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8">
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {formConfig.title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {formConfig.subtitle}
            </p>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{formConfig.successTitle}</h4>
                <p className="text-muted-foreground">{formConfig.successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {formConfig.nameLabel} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder={formConfig.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {formConfig.phoneLabel} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder={formConfig.phonePlaceholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {formConfig.pharmacyLabel}
                  </label>
                  <Input
                    placeholder={formConfig.pharmacyPlaceholder}
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {formConfig.messageLabel}
                  </label>
                  <Textarea
                    placeholder={formConfig.messagePlaceholder}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {formConfig.submitButtonText}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    onClick={handleWhatsAppShare}
                    className="text-success border-success/30 hover:bg-success/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {formConfig.whatsappButtonText}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
