import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import { usePharmacyStaff, useInviteStaff, useRemoveStaff, useResetStaffPassword, StaffMember } from '@/hooks/useStaffManagement';
import { Users, UserPlus, Trash2, Loader2, Lock, Crown, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }).max(255),
  fullName: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
});

export function StaffManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; fullName?: string }>({});

  const { canCreateStaff, isTrial, isAdmin } = usePermissions();
  const { data: staff, isLoading } = usePharmacyStaff();
  const inviteStaff = useInviteStaff();
  const removeStaff = useRemoveStaff();
  const resetPassword = useResetStaffPassword();

  const canManageStaff = canCreateStaff();

  const handleInvite = () => {
    setFormErrors({});

    const result = inviteSchema.safeParse({ email, fullName });
    if (!result.success) {
      const errors: { email?: string; fullName?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'email') errors.email = err.message;
        if (err.path[0] === 'fullName') errors.fullName = err.message;
      });
      setFormErrors(errors);
      return;
    }

    inviteStaff.mutate(
      { email: result.data.email, fullName: result.data.fullName },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEmail('');
          setFullName('');
        },
      }
    );
  };

  const handleRemove = (staffMember: StaffMember) => {
    removeStaff.mutate(staffMember.user_id);
  };

  const handleResetPassword = (staffMember: StaffMember) => {
    resetPassword.mutate(staffMember.user_id);
  };

  // Only admins can see this section
  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Invite and manage your pharmacy staff</CardDescription>
            </div>
          </div>
          {canManageStaff ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Staff Member</DialogTitle>
                  <DialogDescription>
                    Add a new staff member to your pharmacy. They will receive login credentials.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffName">Full Name</Label>
                    <Input
                      id="staffName"
                      placeholder="Enter staff member's name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-destructive">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffEmail">Email Address</Label>
                    <Input
                      id="staffEmail"
                      type="email"
                      placeholder="staff@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Staff members have limited access:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>View medicines (read-only)</li>
                      <li>Create and manage sales</li>
                      <li>Manage daily cash</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInvite} 
                    disabled={inviteStaff.isPending}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    {inviteStaff.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              {isTrial ? (
                <span>Upgrade to invite staff</span>
              ) : (
                <span>Staff management unavailable</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : staff && staff.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {member.full_name || 'Unnamed'}
                    </TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-300 border-0">
                        Staff
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageStaff && (
                        <div className="flex items-center justify-end gap-1">
                          {/* Reset Password */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will generate a new password for {member.full_name || 'this staff member'}. 
                                  {' '}The new credentials will be sent via email if SMTP is configured.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleResetPassword(member)}
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                >
                                  {resetPassword.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Reset Password'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Remove Staff */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.full_name || 'this staff member'}? 
                                  This action cannot be undone and will delete their account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemove(member)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {removeStaff.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Remove'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-dashed border-indigo-200 dark:border-indigo-800/50">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
            <p className="text-lg font-medium mb-1">No staff members yet</p>
            {canManageStaff ? (
              <p className="text-sm text-muted-foreground">
                Click "Invite Staff" to add your first team member
              </p>
            ) : isTrial ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Upgrade your plan to add staff members</span>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
