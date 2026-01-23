import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Plus, Users, MoreHorizontal, Settings, Trash2, Power, PowerOff, Mail, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useAdminTeamMembers, 
  useInviteAdminTeam, 
  useRemoveAdminTeam, 
  useToggleAdminTeamStatus,
  useUpdateAdminTeamMember,
  AdminTeamRole,
  AdminTeamMemberWithPermissions,
  roleLabels,
  getRoleLabel
} from '@/hooks/useAdminTeam';
import { AdminTeamPermissionsDialog } from '@/components/owner/AdminTeamPermissionsDialog';
import { z } from 'zod';

const inviteSchema = z.object({
  full_name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক email দিন'),
  team_role: z.enum(['manager', 'support', 'staff', 'technical_it']),
});

export default function AdminTeamManagement() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AdminTeamMemberWithPermissions | null>(null);
  
  // Invite form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [teamRole, setTeamRole] = useState<AdminTeamRole>('staff');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: teamMembers, isLoading } = useAdminTeamMembers();
  const inviteMutation = useInviteAdminTeam();
  const removeMutation = useRemoveAdminTeam();
  const toggleStatusMutation = useToggleAdminTeamStatus();
  const updateMemberMutation = useUpdateAdminTeamMember();

  const filteredMembers = teamMembers?.filter(member => 
    member.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase()) ||
    member.team_role.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleInvite = async () => {
    setFormErrors({});
    
    const result = inviteSchema.safeParse({ full_name: fullName, email, team_role: teamRole });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    await inviteMutation.mutateAsync({
      full_name: fullName,
      email,
      team_role: teamRole,
    });

    setFullName('');
    setEmail('');
    setTeamRole('staff');
    setInviteOpen(false);
  };

  const handleRemove = async (member: AdminTeamMemberWithPermissions, deleteUser: boolean) => {
    await removeMutation.mutateAsync({ teamMemberId: member.id, deleteUser });
  };

  const handleToggleStatus = async (member: AdminTeamMemberWithPermissions) => {
    await toggleStatusMutation.mutateAsync({ 
      teamMemberId: member.id, 
      isActive: !member.is_active 
    });
  };

  const handleRoleChange = async (member: AdminTeamMemberWithPermissions, newRole: AdminTeamRole) => {
    await updateMemberMutation.mutateAsync({
      teamMemberId: member.id,
      data: { team_role: newRole }
    });
  };

  const openPermissions = (member: AdminTeamMemberWithPermissions) => {
    setSelectedMember(member);
    setPermissionsDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: AdminTeamRole) => {
    switch (role) {
      case 'manager': return 'default';
      case 'support': return 'secondary';
      case 'technical_it': return 'outline';
      default: return 'secondary';
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {language === 'bn' ? 'Admin Team Management' : 'Admin Team Management'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' 
                  ? 'Owner Panel এর জন্য team members পরিচালনা করুন'
                  : 'Manage team members for the Owner Panel'}
              </CardDescription>
            </div>

            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'নতুন সদস্য' : 'Add Member'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'bn' ? 'নতুন Team Member' : 'Invite Team Member'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'bn' 
                      ? 'Admin Team এ নতুন সদস্য যুক্ত করুন। তাদের email এ login তথ্য পাঠানো হবে।'
                      : 'Add a new member to the Admin Team. Login credentials will be sent via email.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      {language === 'bn' ? 'পুরো নাম' : 'Full Name'}
                    </Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
                    />
                    {formErrors.full_name && (
                      <p className="text-sm text-destructive">{formErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'bn' ? 'ইমেইল' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team_role">
                      {language === 'bn' ? 'রোল' : 'Role'}
                    </Label>
                    <Select value={teamRole} onValueChange={(v) => setTeamRole(v as AdminTeamRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">
                          {language === 'bn' ? 'ম্যানেজার' : 'Manager'}
                        </SelectItem>
                        <SelectItem value="support">
                          {language === 'bn' ? 'সাপোর্ট' : 'Support'}
                        </SelectItem>
                        <SelectItem value="staff">
                          {language === 'bn' ? 'স্টাফ' : 'Staff'}
                        </SelectItem>
                        <SelectItem value="technical_it">
                          {language === 'bn' ? 'টেকনিক্যাল আইটি' : 'Technical IT'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Mail className="h-4 w-4 mr-2" />
                    {language === 'bn' ? 'Invite পাঠান' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'bn' ? 'নাম, email বা role দিয়ে খুঁজুন...' : 'Search by name, email or role...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'নাম' : 'Name'}</TableHead>
                  <TableHead>{language === 'bn' ? 'ইমেইল' : 'Email'}</TableHead>
                  <TableHead>{language === 'bn' ? 'রোল' : 'Role'}</TableHead>
                  <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                  <TableHead>{language === 'bn' ? 'যুক্ত হয়েছে' : 'Joined'}</TableHead>
                  <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === 'bn' ? 'কোনো team member পাওয়া যায়নি' : 'No team members found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={member.team_role}
                          onValueChange={(v) => handleRoleChange(member, v as AdminTeamRole)}
                          disabled={updateMemberMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge variant={getRoleBadgeVariant(member.team_role)}>
                              {getRoleLabel(member.team_role, language === 'bn' ? 'bn' : 'en')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">
                              {language === 'bn' ? 'ম্যানেজার' : 'Manager'}
                            </SelectItem>
                            <SelectItem value="support">
                              {language === 'bn' ? 'সাপোর্ট' : 'Support'}
                            </SelectItem>
                            <SelectItem value="staff">
                              {language === 'bn' ? 'স্টাফ' : 'Staff'}
                            </SelectItem>
                            <SelectItem value="technical_it">
                              {language === 'bn' ? 'টেকনিক্যাল আইটি' : 'Technical IT'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={member.is_active}
                            onCheckedChange={() => handleToggleStatus(member)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <span className={member.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                            {member.is_active 
                              ? (language === 'bn' ? 'সক্রিয়' : 'Active')
                              : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(member.created_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPermissions(member)}>
                              <Settings className="h-4 w-4 mr-2" />
                              {language === 'bn' ? 'Permissions' : 'Permissions'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                              {member.is_active ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  {language === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  {language === 'bn' ? 'সক্রিয় করুন' : 'Activate'}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {language === 'bn' ? 'সরিয়ে দিন' : 'Remove'}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === 'bn' ? 'নিশ্চিত করুন' : 'Are you sure?'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === 'bn'
                                      ? `${member.full_name} কে Team থেকে সরিয়ে দিতে চান?`
                                      : `Remove ${member.full_name} from the team?`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemove(member, false)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {removeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {language === 'bn' ? 'সরিয়ে দিন' : 'Remove'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {language === 'bn' ? 'মোট:' : 'Total:'} {filteredMembers.length} {language === 'bn' ? 'জন সদস্য' : 'member(s)'}
          </div>
        </CardContent>
      </Card>

      {selectedMember && (
        <AdminTeamPermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          member={selectedMember}
        />
      )}
    </div>
  );
}
