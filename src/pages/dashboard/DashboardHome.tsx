import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  ClipboardList, 
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const quickStats = [
    { label: "Today's Sales", value: '৳0.00', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Pending Dues', value: '৳0.00', icon: Wallet, color: 'text-amber-600' },
    { label: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Expiring Soon', value: '0', icon: Clock, color: 'text-orange-600' },
  ];

  const modules = [
    { icon: Package, title: 'Medicines', description: 'Manage inventory & batches', href: '/dashboard/medicines', color: 'bg-blue-500' },
    { icon: ShoppingCart, title: 'Sales', description: 'Daily sales & customer dues', href: '/dashboard/sales', color: 'bg-green-500' },
    { icon: Truck, title: 'Suppliers', description: 'Manage suppliers & payments', href: '/dashboard/suppliers', color: 'bg-purple-500' },
    { icon: Wallet, title: 'Daily Cash', description: 'Track cash flow', href: '/dashboard/daily-cash', color: 'bg-amber-500' },
    { icon: ClipboardList, title: 'Stock Short', description: 'Order management', href: '/dashboard/stock-short', color: 'bg-red-500' },
    { icon: FileText, title: 'Reports', description: 'Analytics & exports', href: '/dashboard/reports', color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your pharmacy overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${module.color} text-white group-hover:scale-110 transition-transform`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trial Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-lg">🎉 You're on the Free Trial</h3>
              <p className="text-muted-foreground text-sm">
                Explore all features for 7 days. Upgrade anytime to continue.
              </p>
            </div>
            <Button>Upgrade Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
