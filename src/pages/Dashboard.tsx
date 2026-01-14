import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pill, 
  LogOut, 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  ClipboardList, 
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const modules = [
    { icon: Package, title: 'Medicines', description: 'Manage inventory & batches', color: 'bg-blue-500' },
    { icon: ShoppingCart, title: 'Sales', description: 'Daily sales & customer dues', color: 'bg-green-500' },
    { icon: Truck, title: 'Suppliers', description: 'Manage suppliers & payments', color: 'bg-purple-500' },
    { icon: Wallet, title: 'Daily Cash', description: 'Track cash flow', color: 'bg-amber-500' },
    { icon: ClipboardList, title: 'Stock Short', description: 'Order management', color: 'bg-red-500' },
    { icon: FileText, title: 'Reports', description: 'Analytics & exports', color: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-display font-bold text-primary">MedFlowx</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Welcome to your Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your pharmacy operations efficiently
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Sales</CardDescription>
              <CardTitle className="text-2xl">৳0.00</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Dues</CardDescription>
              <CardTitle className="text-2xl">৳0.00</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Low Stock Items</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expiring Soon</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Modules Grid */}
        <h2 className="text-xl font-display font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card 
              key={module.title} 
              className="cursor-pointer hover:shadow-md transition-shadow group"
            >
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
          ))}
        </div>

        {/* Trial Banner */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
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
      </main>
    </div>
  );
}
