import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClients, useConvertToLifetime, Client } from '@/hooks/useOwnerData';
import { Loader2, Search, CreditCard, Crown, Clock, AlertTriangle, Filter, CheckCircle2, XCircle, Timer, RefreshCw } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

// Real-time subscription status calculator
interface RealTimeStatus {
  status: 'active' | 'expired' | 'expiring_soon' | 'suspended' | 'trial' | 'lifetime';
  label: string;
  daysRemaining: number | null;
  color: string;
  icon: React.ReactNode;
}

function calculateRealTimeStatus(subscription: Client['subscription']): RealTimeStatus {
  if (!subscription) {
    return {
      status: 'expired',
      label: 'No Subscription',
      daysRemaining: null,
      color: 'text-destructive',
      icon: <XCircle className="h-4 w-4" />,
    };
  }

  const now = new Date();
  const planType = subscription.plan_type;
  const dbStatus = subscription.status;

  // Suspended overrides everything
  if (dbStatus === 'suspended') {
    return {
      status: 'suspended',
      label: 'Suspended',
      daysRemaining: null,
      color: 'text-destructive',
      icon: <XCircle className="h-4 w-4" />,
    };
  }

  // Lifetime plans
  if (planType === 'lifetime') {
    const serviceDue = subscription.lifetime_service_due_date 
      ? new Date(subscription.lifetime_service_due_date) 
      : null;
    
    if (serviceDue && isPast(serviceDue)) {
      return {
        status: 'expired',
        label: 'Service Due Overdue',
        daysRemaining: differenceInDays(now, serviceDue) * -1,
        color: 'text-destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    }

    const daysUntilService = serviceDue ? differenceInDays(serviceDue, now) : null;
    if (daysUntilService !== null && daysUntilService <= 30) {
      return {
        status: 'expiring_soon',
        label: `Service Due in ${daysUntilService}d`,
        daysRemaining: daysUntilService,
        color: 'text-warning',
        icon: <Timer className="h-4 w-4" />,
      };
    }

    return {
      status: 'lifetime',
      label: 'Lifetime Active',
      daysRemaining: daysUntilService,
      color: 'text-warning',
      icon: <Crown className="h-4 w-4" />,
    };
  }

  // Trial plans
  if (planType === 'trial') {
    const trialEnd = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    
    if (!trialEnd || isPast(trialEnd)) {
      return {
        status: 'expired',
        label: 'Trial Expired',
        daysRemaining: trialEnd ? differenceInDays(now, trialEnd) * -1 : null,
        color: 'text-destructive',
        icon: <XCircle className="h-4 w-4" />,
      };
    }

    const daysRemaining = differenceInDays(trialEnd, now);
    if (daysRemaining <= 2) {
      return {
        status: 'expiring_soon',
        label: `Trial ends in ${daysRemaining}d`,
        daysRemaining,
        color: 'text-warning',
        icon: <Timer className="h-4 w-4" />,
      };
    }

    return {
      status: 'trial',
      label: `Trial (${daysRemaining}d left)`,
      daysRemaining,
      color: 'text-info',
      icon: <Clock className="h-4 w-4" />,
    };
  }

  // Monthly/Yearly plans
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
  
  if (!periodEnd || isPast(periodEnd)) {
    return {
      status: 'expired',
      label: 'Expired',
      daysRemaining: periodEnd ? differenceInDays(now, periodEnd) * -1 : null,
      color: 'text-destructive',
      icon: <XCircle className="h-4 w-4" />,
    };
  }

  const daysRemaining = differenceInDays(periodEnd, now);
  
  if (daysRemaining <= 7) {
    return {
      status: 'expiring_soon',
      label: `Expires in ${daysRemaining}d`,
      daysRemaining,
      color: 'text-warning',
      icon: <Timer className="h-4 w-4" />,
    };
  }

  return {
    status: 'active',
    label: `Active (${daysRemaining}d)`,
    daysRemaining,
    color: 'text-success',
    icon: <CheckCircle2 className="h-4 w-4" />,
  };
}

// Real-time status badge component
function RealTimeStatusBadge({ subscription }: { subscription: Client['subscription'] }) {
  const status = calculateRealTimeStatus(subscription);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${status.color} border-current gap-1 cursor-help`}
          >
            {status.icon}
            {status.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {status.daysRemaining !== null && (
              <p>
                {status.daysRemaining > 0 
                  ? `${status.daysRemaining} days remaining`
                  : `${Math.abs(status.daysRemaining)} days overdue`
                }
              </p>
            )}
            <p className="text-muted-foreground">
              DB Status: {subscription?.status || 'none'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getPlanBadge(plan?: string) {
  switch (plan) {
    case 'trial':
      return <Badge variant="outline" className="border-info text-info">Trial</Badge>;
    case 'monthly':
      return <Badge variant="outline" className="border-success text-success">Monthly</Badge>;
    case 'yearly':
      return <Badge variant="outline" className="border-purple text-purple">Yearly</Badge>;
    case 'lifetime':
      return <Badge variant="outline" className="border-warning text-warning"><Crown className="h-3 w-3 mr-1" />Lifetime</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
}

// Subscription Table Component
function SubscriptionTable({ 
  clients, 
  onConvertToLifetime,
  isLifetime = false,
}: { 
  clients: Client[];
  onConvertToLifetime: (client: Client) => void;
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
              <TableHead>Real-time Status</TableHead>
              <TableHead>{isLifetime ? 'Service Due' : 'Expiry Date'}</TableHead>
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
                <TableCell>
                  <RealTimeStatusBadge subscription={client.subscription} />
                </TableCell>
                <TableCell>
                  {isLifetime 
                    ? (client.subscription?.lifetime_service_due_date 
                        ? format(new Date(client.subscription.lifetime_service_due_date), 'dd MMM yyyy')
                        : 'Waived')
                    : (client.subscription?.current_period_end 
                        ? format(new Date(client.subscription.current_period_end), 'dd MMM yyyy')
                        : client.subscription?.trial_ends_at
                          ? format(new Date(client.subscription.trial_ends_at), 'dd MMM yyyy')
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

// Main Component
export default function SubscriptionManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dialogType, setDialogType] = useState<'lifetime' | null>(null);
  const [waiveServiceCharge, setWaiveServiceCharge] = useState(false);

  const queryClient = useQueryClient();
  const { data: clients, isLoading, refetch, isFetching } = useClients();
  const convertToLifetime = useConvertToLifetime();

  // Real-time categorization using calculated status
  const categorizedClients = useMemo(() => {
    if (!clients) return { trial: [], active: [], expired: [], expiringSoon: [], lifetime: [] };
    
    return clients.reduce((acc, client) => {
      const status = calculateRealTimeStatus(client.subscription);
      
      if (client.subscription?.plan_type === 'lifetime') {
        acc.lifetime.push(client);
      } else if (status.status === 'trial') {
        acc.trial.push(client);
      } else if (status.status === 'active') {
        acc.active.push(client);
      } else if (status.status === 'expiring_soon') {
        acc.expiringSoon.push(client);
      } else {
        acc.expired.push(client);
      }
      
      return acc;
    }, {
      trial: [] as Client[],
      active: [] as Client[],
      expired: [] as Client[],
      expiringSoon: [] as Client[],
      lifetime: [] as Client[],
    });
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients?.filter(client => {
      const matchesSearch = 
        client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
        client.full_name?.toLowerCase().includes(search.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      
      const realTimeStatus = calculateRealTimeStatus(client.subscription);
      if (statusFilter === 'active') return matchesSearch && realTimeStatus.status === 'active';
      if (statusFilter === 'expired') return matchesSearch && realTimeStatus.status === 'expired';
      if (statusFilter === 'expiring_soon') return matchesSearch && realTimeStatus.status === 'expiring_soon';
      if (statusFilter === 'suspended') return matchesSearch && realTimeStatus.status === 'suspended';
      
      return matchesSearch;
    }) || [];
  }, [clients, search, statusFilter]);

  const handleConvertToLifetime = async () => {
    if (!selectedClient?.subscription?.id) return;
    await convertToLifetime.mutateAsync({
      subscriptionId: selectedClient.subscription.id,
      waiveServiceCharge,
    });
    setDialogType(null);
    setWaiveServiceCharge(false);
  };

  const handleRefresh = () => {
    refetch();
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
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">Real-time subscription status monitoring</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats with Real-time Data */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold">{categorizedClients.trial.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{categorizedClients.active.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-warning">{categorizedClients.expiringSoon.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{categorizedClients.expired.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lifetime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{categorizedClients.lifetime.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">All ({clients?.length || 0})</TabsTrigger>
            <TabsTrigger value="trial">Trials ({categorizedClients.trial.length})</TabsTrigger>
            <TabsTrigger value="expiring">Expiring ({categorizedClients.expiringSoon.length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({categorizedClients.expired.length})</TabsTrigger>
            <TabsTrigger value="lifetime">Lifetime ({categorizedClients.lifetime.length})</TabsTrigger>
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
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <SubscriptionTable 
            clients={filteredClients} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
          />
        </TabsContent>

        <TabsContent value="trial">
          <SubscriptionTable 
            clients={categorizedClients.trial.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
          />
        </TabsContent>

        <TabsContent value="expiring">
          <SubscriptionTable 
            clients={categorizedClients.expiringSoon.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
          />
        </TabsContent>

        <TabsContent value="expired">
          <SubscriptionTable 
            clients={categorizedClients.expired.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
          />
        </TabsContent>

        <TabsContent value="lifetime">
          <SubscriptionTable 
            clients={categorizedClients.lifetime.filter(c => 
              c.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
              c.full_name?.toLowerCase().includes(search.toLowerCase())
            )} 
            onConvertToLifetime={(client) => { setSelectedClient(client); setDialogType('lifetime'); }}
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
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
              <p className="text-sm text-warning">
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
