import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllProfiles, useAllUserRoles, useUpdateUserRole } from '@/hooks/useAdminData';
import { Loader2, Search, UserCog } from 'lucide-react';
import { format } from 'date-fns';

export function AdminUserManagement() {
  const [search, setSearch] = useState('');
  const { data: profiles, isLoading: profilesLoading } = useAllProfiles();
  const { data: userRoles, isLoading: rolesLoading } = useAllUserRoles();
  const updateRole = useUpdateUserRole();

  const isLoading = profilesLoading || rolesLoading;

  // Combine profiles with roles
  const usersWithRoles = profiles?.map(profile => {
    const userRole = userRoles?.find(r => r.user_id === profile.user_id);
    return {
      ...profile,
      role: userRole?.role || 'client_admin',
    };
  }) || [];

  // Filter by search
  const filteredUsers = usersWithRoles.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
  );

  const handleRoleChange = (userId: string, newRole: 'owner_admin' | 'client_admin' | 'client_staff') => {
    updateRole.mutate({ userId, role: newRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner_admin':
        return 'destructive';
      case 'client_admin':
        return 'default';
      case 'client_staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner_admin':
        return 'Owner Admin';
      case 'client_admin':
        return 'Client Admin';
      case 'client_staff':
        return 'Client Staff';
      default:
        return role;
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
              <UserCog className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage all users and their roles across the platform
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, pharmacy, or phone..."
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
                <TableHead>Name</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name'}
                    </TableCell>
                    <TableCell>{user.pharmacy_name || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(
                          user.user_id, 
                          value as 'owner_admin' | 'client_admin' | 'client_staff'
                        )}
                        disabled={updateRole.isPending}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner_admin">Owner Admin</SelectItem>
                          <SelectItem value="client_admin">Client Admin</SelectItem>
                          <SelectItem value="client_staff">Client Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Total: {filteredUsers.length} user(s)
        </div>
      </CardContent>
    </Card>
  );
}
