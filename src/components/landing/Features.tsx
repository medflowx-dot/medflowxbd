import { 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Wallet, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Expiry & Batch Tracking',
    description: 'Track medicines with batch numbers, expiry dates, and get alerts 30/60/90 days before expiration.',
    color: 'primary',
  },
  {
    icon: ShoppingCart,
    title: 'Sales & Due Management',
    description: 'Record daily cash and credit sales. Track customer dues with partial payments and send reminders.',
    color: 'secondary',
  },
  {
    icon: Truck,
    title: 'Supplier Management',
    description: 'Manage supplier payments, track dues, and generate comprehensive supplier reports.',
    color: 'primary',
  },
  {
    icon: Wallet,
    title: 'Daily Cash Flow',
    description: 'Auto-calculated daily cash tracking. See opening balance, inflows, outflows, and closing balance.',
    color: 'secondary',
  },
  {
    icon: FileText,
    title: 'Stock Short Lists',
    description: 'Create manufacturer-based order lists. Track order status and share via WhatsApp.',
    color: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'Reports & Analytics',
    description: 'Generate PDF reports for sales, suppliers, and cash flow with beautiful Bangladeshi Taka formatting.',
    color: 'secondary',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent mb-6">
            <span className="text-accent-foreground text-sm font-semibold">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Complete Expiry & Financial Tracking
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete solution designed specifically for Bangladesh pharmacies. 
            Track expiry, manage earnings, and control your finances from one dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                feature.color === 'primary' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-secondary/10 text-secondary'
              }`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <div>
              <h4 className="font-semibold text-foreground">Expiry Alerts</h4>
              <p className="text-sm text-muted-foreground">Never lose stock to expiration</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Staff Roles</h4>
              <p className="text-sm text-muted-foreground">Granular permission control</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-accent">
            <Clock className="w-8 h-8 text-success" />
            <div>
              <h4 className="font-semibold text-foreground">Real-time Sync</h4>
              <p className="text-sm text-muted-foreground">Data updates instantly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
