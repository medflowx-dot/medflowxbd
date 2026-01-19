import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Check, ArrowRight, Sparkles } from 'lucide-react';

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
