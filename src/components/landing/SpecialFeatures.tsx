import { 
  Database, 
  Smartphone, 
  Users, 
  FileOutput, 
  MessageSquare, 
  Cloud,
  LucideIcon
} from 'lucide-react';
import { useCMSContent, getCMSValue } from '@/hooks/useCMSContent';

// Icon mapping for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
  Database,
  Smartphone,
  Users,
  FileOutput,
  MessageSquare,
  Cloud,
};

// Default features data
const defaultFeatures = [
  {
    icon: 'Database',
    title: '৪৭০+ ওষুধের ডাটাবেস',
    description: 'স্কয়ার, ইনসেপ্টা, বেক্সিমকো সহ ২৮টি কোম্পানির ওষুধ আগে থেকে লোড করা',
  },
  {
    icon: 'Smartphone',
    title: 'মোবাইলে চলে',
    description: 'যেকোনো ফোন বা ট্যাবলেটে সহজে ব্যবহার করুন',
  },
  {
    icon: 'Users',
    title: 'আনলিমিটেড স্টাফ',
    description: 'একাধিক কর্মী যোগ করুন, আলাদা আলাদা পারমিশন দিন',
  },
  {
    icon: 'FileOutput',
    title: 'PDF রিপোর্ট',
    description: 'বিক্রয়, বাকি, ক্যাশ ফ্লো — সব রিপোর্ট PDF এ ডাউনলোড করুন',
  },
  {
    icon: 'MessageSquare',
    title: 'হোয়াটসঅ্যাপ শেয়ারিং',
    description: 'অর্ডার লিস্ট সরাসরি সাপ্লায়ারকে হোয়াটসঅ্যাপে পাঠান',
  },
  {
    icon: 'Cloud',
    title: 'ক্লাউড সিঙ্ক',
    description: 'ডাটা নিরাপদ ক্লাউডে, যেকোনো জায়গা থেকে একসেস করুন',
  },
];

const SpecialFeatures = () => {
  const { data: cmsContent } = useCMSContent('special_features');

  const badge = getCMSValue(cmsContent, 'badge', 'বিশেষ সুবিধা');
  const title = getCMSValue(cmsContent, 'title', 'যা আমাদের আলাদা করে');
  const subtitle = getCMSValue(cmsContent, 'subtitle', 'শুধু ফিচার নয়, আপনার ফার্মেসির প্রতিটি দিক সহজ করতে আমরা এক্সট্রা মাইল যাই।');
  const features = getCMSValue(cmsContent, 'features', defaultFeatures);

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-primary text-sm font-semibold">{badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Database;
            return (
              <div
                key={feature.title || index}
                className="group text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-hero-gradient flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialFeatures;
