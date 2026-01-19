import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, ArrowRight, Sparkles, MessageCircle, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

interface SectionPreviewProps {
  sectionKey: string;
  content: any;
}

export default function SectionPreview({ sectionKey, content }: SectionPreviewProps) {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No content to preview</p>
      </div>
    );
  }

  switch (sectionKey) {
    case 'hero':
      return <HeroPreview content={content} />;
    case 'statistics':
      return <StatisticsPreview content={content} />;
    case 'pricing':
      return <PricingPreview content={content} />;
    case 'faq':
      return <FAQPreview content={content} />;
    case 'testimonials':
      return <TestimonialsPreview content={content} />;
    case 'contact':
      return <ContactPreview content={content} />;
    default:
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Raw JSON Preview:</p>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
  }
}

function HeroPreview({ content }: { content: any }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
      <div className="text-center space-y-4">
        {content.badge_text && (
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {content.badge_text}
          </Badge>
        )}
        
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {content.title || 'Hero Title'}
        </h1>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {content.subtitle || 'Hero subtitle goes here'}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {content.primary_cta && (
            <Button size="sm">
              {content.primary_cta}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
          {content.secondary_cta && (
            <Button size="sm" variant="outline">
              {content.secondary_cta}
            </Button>
          )}
        </div>
        
        {content.trust_items?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
            {content.trust_items.map((item: string, i: number) => (
              <span key={i} className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        )}

        {content.hero_image && (
          <div className="mt-4">
            <img 
              src={content.hero_image} 
              alt="Hero" 
              className="max-h-32 mx-auto rounded-lg shadow-md object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatisticsPreview({ content }: { content: any }) {
  return (
    <div className="rounded-lg bg-muted/30 p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{content.title || 'Statistics'}</h2>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {content.stats?.map((stat: any, i: number) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {content.cta_text && (
        <div className="text-center pt-2">
          <Button size="sm" variant="outline">
            {content.cta_text}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PricingPreview({ content }: { content: any }) {
  return (
    <div className="rounded-lg bg-muted/30 p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{content.title || 'Pricing'}</h2>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {content.plans?.map((plan: any, i: number) => (
          <Card key={i} className={plan.is_popular ? 'ring-2 ring-primary' : ''}>
            <CardContent className="pt-4 space-y-3">
              {plan.is_popular && (
                <Badge className="w-full justify-center">Popular</Badge>
              )}
              <div className="text-center">
                <h3 className="font-bold">{plan.name}</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              </div>
              
              <ul className="space-y-1 text-xs">
                {plan.features?.slice(0, 4).map((feature: string, j: number) => (
                  <li key={j} className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="truncate">{feature}</span>
                  </li>
                ))}
                {plan.features?.length > 4 && (
                  <li className="text-muted-foreground">+{plan.features.length - 4} more</li>
                )}
              </ul>
              
              <Button size="sm" className="w-full" variant={plan.is_popular ? 'default' : 'outline'}>
                {plan.cta_text || 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FAQPreview({ content }: { content: any }) {
  return (
    <div className="rounded-lg bg-muted/30 p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{content.title || 'FAQ'}</h2>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-auto">
        {content.faqs?.map((faq: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <p className="font-medium text-sm">{faq.question}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
        {(!content.faqs || content.faqs.length === 0) && (
          <p className="text-center text-sm text-muted-foreground py-4">No FAQs added</p>
        )}
      </div>
    </div>
  );
}

function TestimonialsPreview({ content }: { content: any }) {
  return (
    <div className="rounded-lg bg-muted/30 p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{content.title || 'Testimonials'}</h2>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.testimonials?.slice(0, 4).map((testimonial: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                {testimonial.avatar ? (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {testimonial.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">"{testimonial.quote}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {content.testimonials?.length > 4 && (
        <p className="text-center text-xs text-muted-foreground">
          +{content.testimonials.length - 4} more testimonials
        </p>
      )}
    </div>
  );
}

function ContactPreview({ content }: { content: any }) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle': return MessageCircle;
      case 'Phone': return Phone;
      case 'Mail': return Mail;
      default: return Mail;
    }
  };

  const formConfig = content.formConfig || {};

  return (
    <div className="rounded-lg bg-muted/30 p-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-2">
          {content.sectionBadge || 'যোগাযোগ করুন'}
        </Badge>
        <h2 className="text-xl font-bold">{content.title || 'Contact'}</h2>
        <p className="text-sm text-muted-foreground">{content.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Methods */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">{content.contactTitle || 'সরাসরি যোগাযোগ করুন'}</h3>
          
          {content.methods?.slice(0, 3).map((method: any, i: number) => {
            const IconComponent = getIconComponent(method.icon);
            return (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 bg-card rounded-lg border text-sm"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  method.color === 'success' 
                    ? 'bg-green-500/10 text-green-500' 
                    : method.color === 'primary'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary/10 text-secondary'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{method.title}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {method.actionLabel}
                    </Badge>
                  </div>
                  <p className="text-xs">{method.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {method.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Office */}
          {content.office && (
            <div className="flex items-start gap-3 p-3 bg-card rounded-lg border text-sm">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{content.office.title}</p>
                <p className="text-xs">{content.office.address}</p>
                <p className="text-xs text-muted-foreground">{content.office.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form Preview */}
        <div className="p-4 bg-card rounded-lg border space-y-3">
          <div>
            <h3 className="font-semibold text-sm">{formConfig.title || 'মেসেজ পাঠান'}</h3>
            <p className="text-xs text-muted-foreground">{formConfig.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">{formConfig.nameLabel || 'আপনার নাম'} *</label>
              <Input placeholder={formConfig.namePlaceholder} className="h-8 text-xs" disabled />
            </div>
            <div>
              <label className="text-xs font-medium">{formConfig.phoneLabel || 'ফোন নম্বর'} *</label>
              <Input placeholder={formConfig.phonePlaceholder} className="h-8 text-xs" disabled />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">{formConfig.pharmacyLabel || 'ফার্মেসির নাম'}</label>
            <Input placeholder={formConfig.pharmacyPlaceholder} className="h-8 text-xs" disabled />
          </div>

          <div>
            <label className="text-xs font-medium">{formConfig.messageLabel || 'মেসেজ'}</label>
            <Textarea placeholder={formConfig.messagePlaceholder} className="text-xs min-h-[60px]" disabled />
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 text-xs">
              <Send className="w-3 h-3 mr-1" />
              {formConfig.submitButtonText || 'মেসেজ পাঠান'}
            </Button>
            <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-200">
              <MessageCircle className="w-3 h-3 mr-1" />
              {formConfig.whatsappButtonText || 'হোয়াটসঅ্যাপ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
