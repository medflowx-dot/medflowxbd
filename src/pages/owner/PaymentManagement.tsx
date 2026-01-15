import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients, Client } from '@/hooks/useOwnerData';
import { Loader2, Search, DollarSign, CreditCard, Wallet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PaymentManagement() {
  const [search, setSearch] = useState('');

  const { data: clients, isLoading } = useClients();

  // Calculate payment stats
  const paidClients = clients?.filter(c => c.subscription?.status === 'active' && c.subscription?.plan_type !== 'trial') || [];
  const pendingPayments = clients?.filter(c => c.subscription?.status === 'expired') || [];
  const trialClients = clients?.filter(c => c.subscription?.plan_type === 'trial') || [];

  const totalRevenue = paidClients.reduce((sum, c) => sum + (c.subscription?.amount || 0), 0);

  const filteredClients = clients?.filter(client =>
    client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkAsPaid = (client: Client) => {
    // In real implementation, this would update the subscription status
    toast.success(`Marked ${client.pharmacy_name} as paid`);
  };

  const handleExportReport = () => {
    toast.info('Export feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground">Track payments and manage billing</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                ৳{totalRevenue.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{paidClients.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{pendingPayments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{trialClients.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
          <PaymentTable 
            clients={filteredClients?.filter(c => c.subscription?.plan_type !== 'trial') || []}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PaymentTable 
            clients={pendingPayments.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )}
            onMarkAsPaid={handleMarkAsPaid}
            showMarkPaid
          />
        </TabsContent>

        <TabsContent value="paid">
          <PaymentTable 
            clients={paidClients.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentTable({ 
  clients, 
  onMarkAsPaid,
  showMarkPaid = false,
}: { 
  clients: Client[];
  onMarkAsPaid: (client: Client) => void;
  showMarkPaid?: boolean;
}) {
  const getPaymentStatus = (client: Client) => {
    if (client.subscription?.status === 'active') {
      return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
    }
    if (client.subscription?.status === 'expired') {
      return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <Card className="border-0 shadow-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              {showMarkPaid && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.pharmacy_name || '-'}</TableCell>
                <TableCell>{client.full_name || '-'}</TableCell>
                <TableCell className="capitalize">{client.subscription?.plan_type || '-'}</TableCell>
                <TableCell>৳{client.subscription?.amount || 0}</TableCell>
                <TableCell>{getPaymentStatus(client)}</TableCell>
                <TableCell>
                  {client.subscription?.current_period_end 
                    ? format(new Date(client.subscription.current_period_end), 'dd MMM yyyy')
                    : '-'}
                </TableCell>
                {showMarkPaid && (
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => onMarkAsPaid(client)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Paid
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={showMarkPaid ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
