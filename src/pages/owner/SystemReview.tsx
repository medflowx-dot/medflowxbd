import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClients, Client } from '@/hooks/useOwnerData';
import { Loader2, Search, Activity, Eye, ExternalLink, Package, ShoppingCart, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SystemReview() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: clients, isLoading } = useClients();

  const filteredClients = clients?.filter(client =>
    client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoginAsClient = (client: Client) => {
    setSelectedClient(client);
    setShowLoginDialog(true);
  };

  const confirmLoginAsClient = () => {
    // In a real implementation, this would create an impersonation session
    // and redirect to the client's dashboard with temporary elevated access
    toast.info('One-click login feature will be implemented with server-side session management');
    setShowLoginDialog(false);
  };

  const getSystemStatus = (client: Client) => {
    // Determine system status based on activity
    if (client.subscription?.status === 'suspended') {
      return { status: 'offline', icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: 'Suspended' };
    }
    if (client.total_sales && client.total_sales > 0) {
      return { status: 'online', icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: 'Active' };
    }
    return { status: 'idle', icon: <Clock className="h-4 w-4 text-yellow-500" />, label: 'Idle' };
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
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">System Review</h1>
          <p className="text-muted-foreground">Monitor client systems and perform one-click reviews</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="py-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>One-Click Login:</strong> Login as any client admin to review their system, debug issues, or validate updates. 
            All actions are logged for security.
          </p>
        </CardContent>
      </Card>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {clients?.filter(c => c.subscription?.status === 'active' && (c.total_sales || 0) > 0).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Idle Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {clients?.filter(c => c.subscription?.status === 'active' && (c.total_sales || 0) === 0).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues / Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {clients?.filter(c => c.subscription?.status === 'suspended').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Systems List */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Client Systems</CardTitle>
              <CardDescription>
                Click "Login as Client" to access any system
              </CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or pharmacy..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients?.map((client) => {
                  const systemStatus = getSystemStatus(client);
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {systemStatus.icon}
                          <span className="text-sm">{systemStatus.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{client.pharmacy_name || '-'}</TableCell>
                      <TableCell>{client.full_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          {client.total_medicines || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                          {client.total_sales || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(client.created_at), 'dd MMM yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => handleLoginAsClient(client)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Login as Client
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredClients?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No systems found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login as Client</DialogTitle>
            <DialogDescription>
              You are about to login as {selectedClient?.pharmacy_name || selectedClient?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Client:</strong> {selectedClient?.pharmacy_name || '-'}
              </p>
              <p className="text-sm">
                <strong>Owner:</strong> {selectedClient?.full_name || '-'}
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> {selectedClient?.phone || '-'}
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Security Notice:</strong> This action will be logged in the audit trail. 
                You will have full access to the client's system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Cancel</Button>
            <Button onClick={confirmLoginAsClient}>
              <Eye className="h-4 w-4 mr-2" />
              Confirm & Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
