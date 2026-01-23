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
import { Loader2, Search, MoreHorizontal, UserCheck, UserX, Clock, Crown, ArrowUpCircle, ArrowDownCircle, Eye, Calendar, Users, Package, ShoppingCart, Trash2, Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { AddClientDialog } from '@/components/owner/AddClientDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export default function ClientManagement() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dialogType, setDialogType] = useState<'extend' | 'upgrade' | 'suspend' | 'view' | 'delete' | 'notify' | null>(null);
  const [extendDays, setExtendDays] = useState('30');
  const [newPlan, setNewPlan] = useState('monthly');
  const [suspendReason, setSuspendReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<'both' | 'email' | 'sms'>('both');
  const [showBulkNotifyDialog, setShowBulkNotifyDialog] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkChannel, setBulkChannel] = useState<'both' | 'email' | 'sms'>('both');
  const [bulkPlanFilter, setBulkPlanFilter] = useState<'all' | 'trial' | 'monthly' | 'yearly' | 'lifetime'>('all');
  const [bulkStatusFilter, setBulkStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired' | 'suspended'>('all');
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  const { data: clients, isLoading } = useClients();
  const updateSubscription = useUpdateClientSubscription();
  const extendSubscription = useExtendSubscription();
  const convertToLifetime = useConvertToLifetime();
  const suspendAccount = useSuspendAccount();
  const activateAccount = useActivateAccount();
  const queryClient = useQueryClient();

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-client', {
        body: { userId: selectedClient.user_id },
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setIsDeleting(false);
        return;
      }

      toast.success('Client deleted successfully');
      setDialogType(null);
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
    } catch (error: unknown) {
      console.error('Error deleting client:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete client';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedClient) return;
    
    setIsSendingNotification(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-client-notification', {
        body: { userId: selectedClient.user_id, channel: notifyChannel },
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setIsSendingNotification(false);
        return;
      }

      const results = data?.results || {};
      if (results.emailSent && results.smsSent) {
        toast.success('Email ও SMS উভয়ই পাঠানো হয়েছে');
      } else if (results.emailSent) {
        toast.success('Email পাঠানো হয়েছে');
      } else if (results.smsSent) {
        toast.success('SMS পাঠানো হয়েছে');
      } else {
        toast.warning('নোটিফিকেশন পাঠানো যায়নি - সেটিংস চেক করুন');
      }
      setDialogType(null);
    } catch (error: unknown) {
      console.error('Error sending notification:', error);
      const message = error instanceof Error ? error.message : 'নোটিফিকেশন পাঠাতে সমস্যা হয়েছে';
      toast.error(message);
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Filter clients for bulk notification
  const bulkFilteredClients = clients?.filter(client => {
    const planMatch = bulkPlanFilter === 'all' || client.subscription?.plan_type === bulkPlanFilter;
    const statusMatch = bulkStatusFilter === 'all' || client.subscription?.status === bulkStatusFilter;
    return planMatch && statusMatch;
  }) || [];

  const handleBulkNotification = async () => {
    if (bulkFilteredClients.length === 0) {
      toast.error('ফিল্টার অনুযায়ী কোনো ক্লায়েন্ট নেই');
      return;
    }

    setIsSendingBulk(true);
    setBulkProgress({ current: 0, total: bulkFilteredClients.length, success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < bulkFilteredClients.length; i++) {
      const client = bulkFilteredClients[i];
      setBulkProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const { data, error } = await supabase.functions.invoke('send-client-notification', {
          body: { userId: client.user_id, channel: bulkChannel },
        });

        if (error || data?.error) {
          failed++;
        } else {
          const results = data.results || {};
          if (results.emailSent || results.smsSent) {
            success++;
          } else {
            failed++;
          }
        }
      } catch (err) {
        failed++;
      }

      setBulkProgress(prev => ({ ...prev, success, failed }));
    }

    toast.success(`বাল্ক নোটিফিকেশন সম্পন্ন: ${success} সফল, ${failed} ব্যর্থ`);
    setShowBulkNotifyDialog(false);
    setIsSendingBulk(false);
    // Reset filters
    setBulkPlanFilter('all');
    setBulkStatusFilter('all');
  };

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
      // Calculate proper dates and amounts based on plan
      const now = new Date();
      let currentPeriodEnd: Date;
      let amount: number;

      switch (newPlan) {
        case 'monthly':
          currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          amount = 299;
          break;
        case 'yearly':
          currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          amount = 2499;
          break;
        case 'trial':
          currentPeriodEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          amount = 0;
          break;
        default:
          currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          amount = 299;
      }

      await updateSubscription.mutateAsync({
        subscriptionId: selectedClient.subscription.id,
        updates: { 
          plan_type: newPlan, 
          status: 'active',
          amount,
          current_period_end: currentPeriodEnd.toISOString(),
          trial_ends_at: newPlan === 'trial' ? currentPeriodEnd.toISOString() : undefined,
        },
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
              <Button 
                variant="outline" 
                onClick={() => setShowBulkNotifyDialog(true)}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Bulk Notify
              </Button>
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
                      <DropdownMenu modal={false}>
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
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setDialogType('notify'); }}>
                            <Bell className="h-4 w-4 mr-2" />
                            Send Notification
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
                          <DropdownMenuItem 
                            onClick={() => { setSelectedClient(client); setDialogType('delete'); }} 
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Client
                          </DropdownMenuItem>
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

      {/* Delete Client Dialog */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <span className="font-semibold">{selectedClient?.pharmacy_name || selectedClient?.full_name || 'this client'}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
            <p className="text-destructive font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-muted-foreground">
              This will permanently delete the client account and all associated data including:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
              <li>All medicines and batches</li>
              <li>All sales records</li>
              <li>All customers and dues</li>
              <li>All suppliers and purchases</li>
              <li>Subscription and payment history</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClient} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={dialogType === 'notify'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              নোটিফিকেশন পাঠান
            </DialogTitle>
            <DialogDescription>
              {selectedClient?.pharmacy_name || selectedClient?.full_name} কে সাবস্ক্রিপশন রিমাইন্ডার পাঠান
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>নোটিফিকেশন চ্যানেল</Label>
              <Select value={notifyChannel} onValueChange={(v: 'both' | 'email' | 'sms') => setNotifyChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <MessageSquare className="h-4 w-4" />
                      Email ও SMS উভয়ই
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      শুধু Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      শুধু SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">ক্লায়েন্ট তথ্য:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium truncate">{selectedClient?.user_id ? '✓ আছে' : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{selectedClient?.phone || 'নেই'}</p>
                </div>
              </div>
            </div>

            {!selectedClient?.phone && notifyChannel !== 'email' && (
              <p className="text-sm text-destructive">⚠️ ফোন নম্বর নেই - SMS পাঠানো যাবে না</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>বাতিল</Button>
            <Button onClick={handleSendNotification} disabled={isSendingNotification}>
              {isSendingNotification && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Bell className="h-4 w-4 mr-2" />
              পাঠান
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Notification Dialog */}
      <Dialog open={showBulkNotifyDialog} onOpenChange={setShowBulkNotifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              বাল্ক নোটিফিকেশন
            </DialogTitle>
            <DialogDescription>
              সব ক্লায়েন্টকে একসাথে সাবস্ক্রিপশন রিমাইন্ডার পাঠান
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>প্ল্যান ফিল্টার</Label>
                <Select 
                  value={bulkPlanFilter} 
                  onValueChange={(v: 'all' | 'trial' | 'monthly' | 'yearly' | 'lifetime') => setBulkPlanFilter(v)}
                  disabled={isSendingBulk}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব প্ল্যান</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>স্ট্যাটাস ফিল্টার</Label>
                <Select 
                  value={bulkStatusFilter} 
                  onValueChange={(v: 'all' | 'active' | 'trial' | 'expired' | 'suspended') => setBulkStatusFilter(v)}
                  disabled={isSendingBulk}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtered count */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ফিল্টার অনুযায়ী ক্লায়েন্ট:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg font-bold">{bulkFilteredClients.length}</Badge>
                  <span className="text-xs text-muted-foreground">/ {clients?.length || 0}</span>
                </div>
              </div>
              {(bulkPlanFilter !== 'all' || bulkStatusFilter !== 'all') && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {bulkPlanFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      প্ল্যান: {bulkPlanFilter}
                    </Badge>
                  )}
                  {bulkStatusFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      স্ট্যাটাস: {bulkStatusFilter}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>নোটিফিকেশন চ্যানেল</Label>
              <Select value={bulkChannel} onValueChange={(v: 'both' | 'email' | 'sms') => setBulkChannel(v)} disabled={isSendingBulk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <MessageSquare className="h-4 w-4" />
                      Email ও SMS উভয়ই
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      শুধু Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      শুধু SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSendingBulk && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>প্রগ্রেস:</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-success">সফল: {bulkProgress.success}</span>
                  <span className="text-destructive">ব্যর্থ: {bulkProgress.failed}</span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning-foreground">
                ⚠️ এই অ্যাকশন {bulkFilteredClients.length} জন ক্লায়েন্টকে নোটিফিকেশন পাঠাবে। এটি কিছুটা সময় নিতে পারে।
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkNotifyDialog(false)} disabled={isSendingBulk}>
              বাতিল
            </Button>
            <Button onClick={handleBulkNotification} disabled={isSendingBulk || bulkFilteredClients.length === 0}>
              {isSendingBulk ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSendingBulk ? `পাঠানো হচ্ছে...` : `${bulkFilteredClients.length} জনকে পাঠান`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
