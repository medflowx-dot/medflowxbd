import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients, useUpdateClientSubscription, useExtendSubscription, useConvertToLifetime, useSuspendAccount, useActivateAccount, Client } from '@/hooks/useOwnerData';
import { Loader2, Search, MoreHorizontal, UserCheck, UserX, Clock, Crown, ArrowUpCircle, ArrowDownCircle, Eye, Calendar, Users, Package, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { AddClientDialog } from '@/components/owner/AddClientDialog';

export default function ClientManagement() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dialogType, setDialogType] = useState<'extend' | 'upgrade' | 'suspend' | 'view' | null>(null);
  const [extendDays, setExtendDays] = useState('30');
  const [newPlan, setNewPlan] = useState('monthly');
  const [suspendReason, setSuspendReason] = useState('');

  const { data: clients, isLoading } = useClients();
  const updateSubscription = useUpdateClientSubscription();
  const extendSubscription = useExtendSubscription();
  const convertToLifetime = useConvertToLifetime();
  const suspendAccount = useSuspendAccount();
  const activateAccount = useActivateAccount();

  const filteredClients = clients?.filter(client =>
    client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search)
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Trial</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Expired</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspended</Badge>;
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

  const handleExtend = async () => {
    if (!selectedClient?.subscription?.id) return;
    await extendSubscription.mutateAsync({
      subscriptionId: selectedClient.subscription.id,
      days: parseInt(extendDays),
    });
    setDialogType(null);
  };

  const handleUpgrade = async () => {
    if (!selectedClient?.subscription?.id) return;
    
    if (newPlan === 'lifetime') {
      await convertToLifetime.mutateAsync({
        subscriptionId: selectedClient.subscription.id,
        waiveServiceCharge: false,
      });
    } else {
      await updateSubscription.mutateAsync({
        subscriptionId: selectedClient.subscription.id,
        updates: { plan_type: newPlan, status: 'active' },
      });
    }
    setDialogType(null);
  };

  const handleSuspend = async () => {
    if (!selectedClient?.subscription?.id) return;
    await suspendAccount.mutateAsync({
      subscriptionId: selectedClient.subscription.id,
      reason: suspendReason,
    });
    setDialogType(null);
    setSuspendReason('');
  };

  const handleActivate = async (client: Client) => {
    if (!client.subscription?.id) return;
    await activateAccount.mutateAsync({ subscriptionId: client.subscription.id });
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
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Manage all registered clients and their subscriptions</p>
        </div>
      </div>

      {/* Client List */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Clients</CardTitle>
              <CardDescription>
                {filteredClients?.length || 0} clients found
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, pharmacy, phone..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <AddClientDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pharmacy / Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients?.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.pharmacy_name || 'No Name'}</p>
                        <p className="text-sm text-muted-foreground">{client.full_name || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{client.phone || '-'}</p>
                    </TableCell>
                    <TableCell>{getPlanBadge(client.subscription?.plan_type)}</TableCell>
                    <TableCell>{getStatusBadge(client.subscription?.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {client.subscription?.current_period_end
                          ? format(new Date(client.subscription.current_period_end), 'dd MMM yyyy')
                          : client.subscription?.plan_type === 'lifetime'
                          ? 'Lifetime'
                          : '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {client.total_medicines || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {client.total_sales || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setDialogType('view'); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setDialogType('extend'); }}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Extend Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setDialogType('upgrade'); }}>
                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                            Change Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {client.subscription?.status === 'suspended' ? (
                            <DropdownMenuItem onClick={() => handleActivate(client)} className="text-green-600">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => { setSelectedClient(client); setDialogType('suspend'); }} className="text-red-600">
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredClients?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={dialogType === 'view'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>Complete information about this client</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Pharmacy Name</Label>
                  <p className="font-medium">{selectedClient.pharmacy_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Owner Name</Label>
                  <p className="font-medium">{selectedClient.full_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium">{selectedClient.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Joined</Label>
                  <p className="font-medium">{format(new Date(selectedClient.created_at), 'dd MMM yyyy')}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Plan</Label>
                    <p>{getPlanBadge(selectedClient.subscription?.plan_type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <p>{getStatusBadge(selectedClient.subscription?.status)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Amount</Label>
                    <p className="font-medium">৳{selectedClient.subscription?.amount || 0}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Expiry</Label>
                    <p className="font-medium">
                      {selectedClient.subscription?.current_period_end
                        ? format(new Date(selectedClient.subscription.current_period_end), 'dd MMM yyyy')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Usage Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Total Medicines</Label>
                    <p className="font-medium">{selectedClient.total_medicines || 0}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Total Sales</Label>
                    <p className="font-medium">{selectedClient.total_sales || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={dialogType === 'extend'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Extend subscription for {selectedClient?.pharmacy_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Extend by (days)</Label>
              <Select value={extendDays} onValueChange={setExtendDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="15">15 Days</SelectItem>
                  <SelectItem value="30">30 Days (1 Month)</SelectItem>
                  <SelectItem value="90">90 Days (3 Months)</SelectItem>
                  <SelectItem value="180">180 Days (6 Months)</SelectItem>
                  <SelectItem value="365">365 Days (1 Year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={extendSubscription.isPending}>
              {extendSubscription.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={dialogType === 'upgrade'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Update subscription plan for {selectedClient?.pharmacy_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Free Trial</SelectItem>
                  <SelectItem value="monthly">Monthly Plan</SelectItem>
                  <SelectItem value="yearly">Yearly Plan</SelectItem>
                  <SelectItem value="lifetime">Lifetime Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button onClick={handleUpgrade} disabled={updateSubscription.isPending || convertToLifetime.isPending}>
              {(updateSubscription.isPending || convertToLifetime.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Account Dialog */}
      <Dialog open={dialogType === 'suspend'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
            <DialogDescription>
              This will suspend {selectedClient?.pharmacy_name}'s account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={suspendAccount.isPending}>
              {suspendAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
