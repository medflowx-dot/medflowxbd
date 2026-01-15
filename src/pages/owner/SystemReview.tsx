import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useClients, Client } from '@/hooks/useOwnerData';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Activity, Eye, ExternalLink, Package, ShoppingCart, CheckCircle, AlertCircle, Clock, Shield, Copy, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ImpersonationSession {
  sessionToken: string;
  expiresAt: string;
  targetUser: {
    id: string;
    email: string;
    fullName: string | null;
    pharmacyName: string | null;
  };
}

export default function SystemReview() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [impersonationSession, setImpersonationSession] = useState<ImpersonationSession | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [loginLink, setLoginLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: clients, isLoading } = useClients();

  const filteredClients = clients?.filter(client =>
    client.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoginAsClient = (client: Client) => {
    setSelectedClient(client);
    setShowLoginDialog(true);
    setImpersonationSession(null);
    setLoginLink(null);
  };

  const createImpersonationSession = async () => {
    if (!selectedClient) return;

    setIsCreatingSession(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/create-impersonation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ targetUserId: selectedClient.user_id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create session');
      }

      setImpersonationSession(result);
      toast.success('Impersonation session created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create impersonation session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const validateAndGetLink = async () => {
    if (!impersonationSession) return;

    setIsValidating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/validate-impersonation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ sessionToken: impersonationSession.sessionToken }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate session');
      }

      if (result.actionLink) {
        setLoginLink(result.actionLink);
        toast.success('Login link generated');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate login link');
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenLoginLink = () => {
    if (loginLink) {
      window.open(loginLink, '_blank');
    }
  };

  const copyToClipboard = async () => {
    if (loginLink) {
      await navigator.clipboard.writeText(loginLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
    setSelectedClient(null);
    setImpersonationSession(null);
    setLoginLink(null);
  };

  const getSystemStatus = (client: Client) => {
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
          <p className="text-muted-foreground">Monitor client systems and perform secure one-click reviews</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Secure One-Click Login
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Login as any client admin to review their system. Sessions are time-limited (1 hour) and all actions are logged in the audit trail.
              </p>
            </div>
          </div>
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
                Click "Login as Client" to access any system securely
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

      {/* Secure Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Secure Client Login
            </DialogTitle>
            <DialogDescription>
              Login as {selectedClient?.pharmacy_name || selectedClient?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Client Info */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <p className="font-medium">{selectedClient?.pharmacy_name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span>
                  <p className="font-medium">{selectedClient?.full_name || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{selectedClient?.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{selectedClient?.subscription?.status || '-'}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Create Session */}
            {!impersonationSession && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">Security Notice</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  This action will be logged in the audit trail. The session will be valid for 1 hour.
                </AlertDescription>
              </Alert>
            )}

            {/* Step 2: Session Created */}
            {impersonationSession && !loginLink && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Session Created</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Valid until: {format(new Date(impersonationSession.expiresAt), 'dd MMM yyyy HH:mm')}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 3: Login Link Generated */}
            {loginLink && (
              <div className="space-y-3">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Login Link Ready</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Click the button below to open the client's dashboard in a new tab.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button onClick={handleOpenLoginLink} className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Client Dashboard
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard}>
                    {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
            
            {!impersonationSession && (
              <Button onClick={createImpersonationSession} disabled={isCreatingSession}>
                {isCreatingSession && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Eye className="h-4 w-4 mr-2" />
                Create Secure Session
              </Button>
            )}
            
            {impersonationSession && !loginLink && (
              <Button onClick={validateAndGetLink} disabled={isValidating}>
                {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <ExternalLink className="h-4 w-4 mr-2" />
                Generate Login Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
