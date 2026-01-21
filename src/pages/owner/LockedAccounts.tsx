import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search, Lock, Unlock, RefreshCw, Clock, AlertTriangle, Mail, Phone } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LockedAccount {
  id: string;
  identifier: string;
  identifier_type: string;
  attempts: number;
  locked_until: string | null;
  last_attempt_at: string;
  created_at: string;
}

export default function LockedAccounts() {
  const [accounts, setAccounts] = useState<LockedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [confirmUnlock, setConfirmUnlock] = useState<LockedAccount | null>(null);

  const fetchLockedAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .or('locked_until.gt.now(),attempts.gt.0')
        .order('locked_until', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching locked accounts:', error);
      toast.error('Failed to fetch locked accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLockedAccounts();
  }, []);

  const handleUnlock = async (account: LockedAccount) => {
    setUnlockingId(account.id);
    try {
      const { error } = await supabase
        .from('login_attempts')
        .update({
          attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (error) throw error;

      toast.success(`Successfully unlocked ${account.identifier}`);
      fetchLockedAccounts();
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast.error('Failed to unlock account');
    } finally {
      setUnlockingId(null);
      setConfirmUnlock(null);
    }
  };

  const isCurrentlyLocked = (lockedUntil: string | null) => {
    if (!lockedUntil) return false;
    return new Date(lockedUntil) > new Date();
  };

  const getRemainingLockTime = (lockedUntil: string | null) => {
    if (!lockedUntil) return null;
    const lockDate = new Date(lockedUntil);
    if (lockDate <= new Date()) return null;
    return formatDistanceToNow(lockDate, { addSuffix: false });
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lockedCount = accounts.filter((a) => isCurrentlyLocked(a.locked_until)).length;
  const warningCount = accounts.filter((a) => !isCurrentlyLocked(a.locked_until) && a.attempts > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locked Accounts</h1>
        <p className="text-muted-foreground">
          View and manage accounts that have been locked due to failed login attempts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Locked</CardTitle>
            <Lock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lockedCount}</div>
            <p className="text-xs text-muted-foreground">Accounts locked now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warning State</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Failed attempts (not locked)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">All login attempt records</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Login Attempts</CardTitle>
              <CardDescription>
                Accounts with failed login attempts or active locks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchLockedAccounts}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No locked accounts or login attempts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Attempts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Lock Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const locked = isCurrentlyLocked(account.locked_until);
                    const remainingTime = getRemainingLockTime(account.locked_until);

                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {account.identifier_type === 'email' ? (
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            )}
                            {account.identifier}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {account.identifier_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={account.attempts >= 5 ? 'destructive' : account.attempts >= 3 ? 'default' : 'secondary'}
                          >
                            {account.attempts}/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {locked ? (
                            <Badge variant="destructive" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          ) : account.attempts > 0 ? (
                            <Badge variant="secondary" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Warning
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Clear</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(account.last_attempt_at), 'dd MMM yyyy, HH:mm')}
                        </TableCell>
                        <TableCell>
                          {locked && remainingTime ? (
                            <span className="text-sm text-destructive font-medium">
                              {remainingTime} remaining
                            </span>
                          ) : account.locked_until ? (
                            <span className="text-sm text-muted-foreground">Expired</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {(locked || account.attempts > 0) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmUnlock(account)}
                              disabled={unlockingId === account.id}
                              className="gap-1"
                            >
                              {unlockingId === account.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Unlock className="h-3 w-3" />
                              )}
                              Unlock
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmUnlock} onOpenChange={() => setConfirmUnlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlock <strong>{confirmUnlock?.identifier}</strong>?
              This will reset their failed login attempts and remove any active lock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmUnlock && handleUnlock(confirmUnlock)}
            >
              Unlock Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
