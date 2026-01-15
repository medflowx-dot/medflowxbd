import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAllSubscriptions, useAllProfiles, useUpdateSubscription } from '@/hooks/useAdminData';
import { Loader2, Search, CreditCard, Edit } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function AdminSubscriptionManagement() {
  const [search, setSearch] = useState('');
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  
  const { data: subscriptions, isLoading: subsLoading } = useAllSubscriptions();
  const { data: profiles, isLoading: profilesLoading } = useAllProfiles();
  const updateSubscription = useUpdateSubscription();

  const isLoading = subsLoading || profilesLoading;

  // Combine subscriptions with profiles
  const subscriptionsWithProfiles = subscriptions?.map(sub => {
    const profile = profiles?.find(p => p.user_id === sub.user_id);
    return {
      ...sub,
      pharmacy_name: profile?.pharmacy_name,
      full_name: profile?.full_name,
    };
  }) || [];

  // Filter by search
  const filteredSubscriptions = subscriptionsWithProfiles.filter(sub => 
    sub.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    sub.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    sub.plan_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
    setEditPlan(subscription.plan_type);
    setEditStatus(subscription.status);
  };

  const handleSaveEdit = () => {
    if (!editingSubscription) return;
    
    updateSubscription.mutate({
      subscriptionId: editingSubscription.id,
      updates: {
        plan_type: editPlan,
        status: editStatus,
      },
    }, {
      onSuccess: () => {
        setEditingSubscription(null);
      },
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'lifetime':
        return 'default';
      case 'yearly':
        return 'secondary';
      case 'monthly':
        return 'outline';
      case 'trial':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage subscription plans and status for all pharmacies
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pharmacy or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.pharmacy_name || 'Unnamed Pharmacy'}
                    </TableCell>
                    <TableCell>{sub.full_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(sub.plan_type)}>
                        {sub.plan_type?.charAt(0).toUpperCase() + sub.plan_type?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(sub.status)}>
                        {sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.current_period_end ? (
                        <span title={format(new Date(sub.current_period_end), 'PPP')}>
                          {formatDistanceToNow(new Date(sub.current_period_end), { addSuffix: true })}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      ৳{Number(sub.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sub)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Total: {filteredSubscriptions.length} subscription(s)
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update subscription details for {editingSubscription?.pharmacy_name || 'this pharmacy'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={editPlan} onValueChange={setEditPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSubscription(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={updateSubscription.isPending}
              >
                {updateSubscription.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
