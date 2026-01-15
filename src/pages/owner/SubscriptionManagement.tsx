import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useClients, useConvertToLifetime, useExtendSubscription, Client } from '@/hooks/useOwnerData';
import { Loader2, Search, CreditCard, Crown, Clock, AlertTriangle, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dialogType, setDialogType] = useState<'lifetime' | null>(null);
  const [waiveServiceCharge, setWaiveServiceCharge] = useState(false);

  const { data: clients, isLoading } = useClients();
  const convertToLifetime = useConvertToLifetime();
  const extendSubscription = useExtendSubscription();

  const filteredClients = clients?.filter(client => {
    const matchesSearch = 
      client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
      client.full_name?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && client.subscription?.status === statusFilter;
  });

  const trialClients = clients?.filter(c => c.subscription?.plan_type === 'trial') || [];
  const activeClients = clients?.filter(c => c.subscription?.status === 'active') || [];
  const expiredClients = clients?.filter(c => c.subscription?.status === 'expired') || [];

  const handleConvertToLifetime = async () => {
    if (!selectedClient?.subscription?.id) return;
    await convertToLifetime.mutateAsync({
      subscriptionId: selectedClient.subscription.id,
      waiveServiceCharge,
    });
    setDialogType(null);
    setWaiveServiceCharge(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-700">Expired</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'trial':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Trial</Badge>;
      case 'monthly':
        return <Badge variant="outline" className="border-green-500 text-green-600">Monthly</Badge>;
      case 'yearly':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Yearly</Badge>;
      case 'lifetime':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Crown className="h-3 w-3 mr-1" />Lifetime</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manual subscription controls and overrides</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{trialClients.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{activeClients.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{expiredClients.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">
                {clients?.filter(c => c.subscription?.plan_type === 'lifetime').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Subscriptions</TabsTrigger>
            <TabsTrigger value="trial">Trials</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <SubscriptionTable 
            clients={filteredClients || []} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="trial">
          <SubscriptionTable 
            clients={trialClients.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="expired">
          <SubscriptionTable 
            clients={expiredClients.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="lifetime">
          <SubscriptionTable 
            clients={(clients?.filter(c => c.subscription?.plan_type === 'lifetime') || []).filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
            isLifetime
          />
        </TabsContent>
      </Tabs>

      {/* Convert to Lifetime Dialog */}
      <Dialog open={dialogType === 'lifetime'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Lifetime Plan</DialogTitle>
            <DialogDescription>
              Assign lifetime plan to {selectedClient?.pharmacy_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Lifetime plans include a yearly service charge of ৳999. You can waive this if needed.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="waive" 
                checked={waiveServiceCharge}
                onCheckedChange={(checked) => setWaiveServiceCharge(!!checked)}
              />
              <Label htmlFor="waive">Waive yearly service charge</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button onClick={handleConvertToLifetime} disabled={convertToLifetime.isPending}>
              {convertToLifetime.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Crown className="h-4 w-4 mr-2" />
              Convert to Lifetime
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubscriptionTable({ 
  clients, 
  onConvertToLifetime,
  getPlanBadge,
  getStatusBadge,
  isLifetime = false,
}: { 
  clients: Client[];
  onConvertToLifetime: (client: Client) => void;
  getPlanBadge: (plan?: string) => React.ReactNode;
  getStatusBadge: (status?: string) => React.ReactNode;
  isLifetime?: boolean;
}) {
  return (
    <Card className="border-0 shadow-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{isLifetime ? 'Service Due' : 'Expiry'}</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.pharmacy_name || '-'}</TableCell>
                <TableCell>{client.full_name || '-'}</TableCell>
                <TableCell>{getPlanBadge(client.subscription?.plan_type)}</TableCell>
                <TableCell>{getStatusBadge(client.subscription?.status)}</TableCell>
                <TableCell>
                  {isLifetime 
                    ? (client.subscription?.lifetime_service_due_date 
                        ? format(new Date(client.subscription.lifetime_service_due_date), 'dd MMM yyyy')
                        : 'Waived')
                    : (client.subscription?.current_period_end 
                        ? format(new Date(client.subscription.current_period_end), 'dd MMM yyyy')
                        : '-')}
                </TableCell>
                <TableCell>৳{client.subscription?.amount || 0}</TableCell>
                <TableCell className="text-right">
                  {client.subscription?.plan_type !== 'lifetime' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onConvertToLifetime(client)}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Lifetime
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
