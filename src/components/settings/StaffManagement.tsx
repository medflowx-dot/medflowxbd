import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { usePharmacyStaff, useInviteStaff, useRemoveStaff, useResetStaffPassword, StaffMember } from '@/hooks/useStaffManagement';
import { StaffPermissionsDialog } from '@/components/settings/StaffPermissionsDialog';
import { Users, UserPlus, Trash2, Loader2, Lock, Crown, KeyRound, Settings2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';

const emailSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }).max(255),
  fullName: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
});

const phoneSchema = z.object({
  phone: z.string().min(11, { message: 'Enter valid phone number' }).max(15),
  fullName: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
});

export function StaffManagement() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string; fullName?: string }>({});
  const [permissionsDialogStaff, setPermissionsDialogStaff] = useState<StaffMember | null>(null);

  const { canCreateStaff, isTrial, isAdmin } = usePermissions();
  const { data: staff, isLoading } = usePharmacyStaff();
  const inviteStaff = useInviteStaff();
  const removeStaff = useRemoveStaff();
  const resetPassword = useResetStaffPassword();

  const canManageStaff = canCreateStaff();

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 11);
  };

  const handleInvite = () => {
    setFormErrors({});

    if (inviteMethod === 'email') {
      const result = emailSchema.safeParse({ email, fullName });
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
        { 
          invite_method: 'email',
          email: result.data.email, 
          fullName: result.data.fullName 
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEmail('');
            setFullName('');
          },
        }
      );
    } else {
      const result = phoneSchema.safeParse({ phone, fullName });
      if (!result.success) {
        const errors: { phone?: string; fullName?: string } = {};
        result.error.errors.forEach(err => {
          if (err.path[0] === 'phone') errors.phone = err.message;
          if (err.path[0] === 'fullName') errors.fullName = err.message;
        });
        setFormErrors(errors);
        return;
      }

      inviteStaff.mutate(
        { 
          invite_method: 'phone',
          phone: result.data.phone, 
          fullName: result.data.fullName 
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setPhone('');
            setFullName('');
          },
          onError: () => {
            // Keep dialog open to show error, don't close
          },
        }
      );
    }
  };

  const handleRemove = (staffMember: StaffMember) => {
    removeStaff.mutate(staffMember.user_id);
  };

  const handleResetPassword = (staffMember: StaffMember) => {
    resetPassword.mutate(staffMember.user_id);
  };

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setFullName('');
    setFormErrors({});
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
              <CardTitle>{language === 'bn' ? 'স্টাফ ম্যানেজমেন্ট' : 'Staff Management'}</CardTitle>
              <CardDescription>{language === 'bn' ? 'আপনার ফার্মেসি স্টাফ ইনভাইট ও ম্যানেজ করুন' : 'Invite and manage your pharmacy staff'}</CardDescription>
            </div>
          </div>
          {canManageStaff ? (
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'স্টাফ ইনভাইট' : 'Invite Staff'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{language === 'bn' ? 'স্টাফ মেম্বার ইনভাইট করুন' : 'Invite Staff Member'}</DialogTitle>
                  <DialogDescription>
                    {language === 'bn' 
                      ? 'আপনার ফার্মেসিতে নতুন স্টাফ যোগ করুন। তারা লগইন ক্রেডেনশিয়াল পাবে।'
                      : 'Add a new staff member to your pharmacy. They will receive login credentials.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Invite Method Tabs */}
                  <div className="space-y-2">
                    <Label>{language === 'bn' ? 'ইনভাইট পদ্ধতি' : 'Invite Method'}</Label>
                    <Tabs value={inviteMethod} onValueChange={(v) => setInviteMethod(v as 'email' | 'phone')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {language === 'bn' ? 'ফোন' : 'Phone'}
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {language === 'bn' ? 'ইমেইল' : 'Email'}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="staffName">{language === 'bn' ? 'পুরো নাম' : 'Full Name'}</Label>
                    <Input
                      id="staffName"
                      placeholder={language === 'bn' ? 'স্টাফের নাম লিখুন' : "Enter staff member's name"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-destructive">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email or Phone based on method */}
                  {inviteMethod === 'email' ? (
                    <div className="space-y-2">
                      <Label htmlFor="staffEmail">{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</Label>
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
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="staffPhone">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                      <Input
                        id="staffPhone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-destructive">{formErrors.phone}</p>
                      )}
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 text-sm">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      🔑 {language === 'bn' ? 'টেম্পোরারি পাসওয়ার্ড:' : 'Temporary Password:'} 
                      <code className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded font-mono text-amber-700 dark:text-amber-300">123456</code>
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {language === 'bn' 
                        ? '⚠️ স্টাফ প্রথম লগইনে অবশ্যই নতুন পাসওয়ার্ড সেট করতে বাধ্য থাকবে।'
                        : '⚠️ Staff must set a new password on their first login.'
                      }
                    </p>
                  </div>

                  {/* Access Info Box */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {language === 'bn' ? 'স্টাফ সদস্যদের সীমিত অ্যাক্সেস থাকে:' : 'Staff members have limited access:'}
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>{language === 'bn' ? 'ঔষধ দেখা (শুধুমাত্র পড়া)' : 'View medicines (read-only)'}</li>
                      <li>{language === 'bn' ? 'বিক্রি তৈরি ও ম্যানেজ' : 'Create and manage sales'}</li>
                      <li>{language === 'bn' ? 'দৈনিক ক্যাশ ম্যানেজ' : 'Manage daily cash'}</li>
                    </ul>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleInvite} 
                    disabled={inviteStaff.isPending}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    {inviteStaff.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {language === 'bn' ? 'ইনভিটেশন পাঠান' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              {isTrial ? (
                <span>{language === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade to invite staff'}</span>
              ) : (
                <span>{language === 'bn' ? 'অনুপলব্ধ' : 'Staff management unavailable'}</span>
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
                  <TableHead>{language === 'bn' ? 'নাম' : 'Name'}</TableHead>
                  <TableHead>{language === 'bn' ? 'ফোন' : 'Phone'}</TableHead>
                  <TableHead>{language === 'bn' ? 'রোল' : 'Role'}</TableHead>
                  <TableHead>{language === 'bn' ? 'যোগ হয়েছে' : 'Added'}</TableHead>
                  <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
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
                        {language === 'bn' ? 'স্টাফ' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(member.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageStaff && (
                        <div className="flex items-center justify-end gap-1">
                          {/* Permissions */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            onClick={() => setPermissionsDialogStaff(member)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>

                          {/* Reset Password */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'bn' 
                                    ? `এটি ${member.full_name || 'এই স্টাফ সদস্যের'} জন্য একটি নতুন পাসওয়ার্ড তৈরি করবে।`
                                    : `This will generate a new password for ${member.full_name || 'this staff member'}.`
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{language === 'bn' ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleResetPassword(member)}
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                >
                                  {resetPassword.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    language === 'bn' ? 'রিসেট করুন' : 'Reset Password'
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
                                <AlertDialogTitle>{language === 'bn' ? 'স্টাফ সদস্য সরান' : 'Remove Staff Member'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'bn' 
                                    ? `আপনি কি নিশ্চিত যে আপনি ${member.full_name || 'এই স্টাফ সদস্যকে'} সরাতে চান?`
                                    : `Are you sure you want to remove ${member.full_name || 'this staff member'}?`
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{language === 'bn' ? 'বাতিল' : 'Cancel'}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemove(member)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {removeStaff.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    language === 'bn' ? 'সরান' : 'Remove'
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
            <p className="text-lg font-medium mb-1">{language === 'bn' ? 'কোনো স্টাফ সদস্য নেই' : 'No staff members yet'}</p>
            {canManageStaff ? (
              <p className="text-sm text-muted-foreground">
                {language === 'bn' 
                  ? '"স্টাফ ইনভাইট" ক্লিক করে আপনার প্রথম টিম মেম্বার যোগ করুন'
                  : 'Click "Invite Staff" to add your first team member'
                }
              </p>
            ) : isTrial ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'bn' ? 'স্টাফ যোগ করতে প্ল্যান আপগ্রেড করুন' : 'Upgrade your plan to add staff members'}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Staff Permissions Dialog */}
        {permissionsDialogStaff && (
          <StaffPermissionsDialog
            open={!!permissionsDialogStaff}
            onOpenChange={(open) => !open && setPermissionsDialogStaff(null)}
            staffUserId={permissionsDialogStaff.user_id}
            staffName={permissionsDialogStaff.full_name || 'Staff Member'}
          />
        )}
      </CardContent>
    </Card>
  );
}
