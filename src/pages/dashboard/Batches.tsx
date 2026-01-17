import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Search, AlertTriangle, Package, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BatchTable } from '@/components/batches/BatchTable';
import { AddBatchDialog } from '@/components/batches/AddBatchDialog';
import { useMedicines } from '@/hooks/useMedicines';
import { usePermissions } from '@/hooks/usePermissions';

export default function Batches() {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { medicines, isLoading, deleteExpiredBatches } = useMedicines();
  const { hasPermission } = usePermissions();
  
  const canManageMedicines = hasPermission('manage_medicines');

  // Get all batches with medicine info
  const allBatches = useMemo(() => {
    return medicines.flatMap(medicine => 
      medicine.batches.map(batch => ({
        ...batch,
        medicine_name: medicine.name,
        medicine_id: medicine.id,
        medicine_unit: medicine.unit,
      }))
    );
  }, [medicines]);

  // Filter batches
  const filteredBatches = useMemo(() => {
    return allBatches.filter(batch => {
      // Medicine filter
      if (selectedMedicineId !== 'all' && batch.medicine_id !== selectedMedicineId) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          batch.medicine_name.toLowerCase().includes(searchLower) ||
          batch.batch_number.toLowerCase().includes(searchLower) ||
          batch.supplier_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      const today = new Date();
      const expiry = new Date(batch.expiry_date);
      const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (statusFilter === 'expired' && daysUntilExpiry >= 0) return false;
      if (statusFilter === 'expiring' && (daysUntilExpiry < 0 || daysUntilExpiry > 30)) return false;
      if (statusFilter === 'active' && daysUntilExpiry < 0) return false;

      return true;
    });
  }, [allBatches, selectedMedicineId, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    let expired = 0;
    let expiringSoon = 0;

    allBatches.forEach(batch => {
      const expiry = new Date(batch.expiry_date);
      const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) expired++;
      else if (daysUntilExpiry <= 30) expiringSoon++;
    });

    return { total: allBatches.length, expired, expiringSoon };
  }, [allBatches]);

  const clearFilters = () => {
    setSelectedMedicineId('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedMedicineId !== 'all' || statusFilter !== 'all' || searchTerm !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Batches</h1>
          <p className="text-muted-foreground mt-1">
            {canManageMedicines 
              ? 'Manage medicine batches and track expiry dates'
              : 'View medicine batches and expiry information'}
          </p>
        </div>
        {canManageMedicines && (
          <div className="flex items-center gap-2">
            {stats.expired > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Expired ({stats.expired})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Expired Batches</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete all {stats.expired} expired batches? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteExpiredBatches.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteExpiredBatches.isPending}
                    >
                      {deleteExpiredBatches.isPending ? 'Deleting...' : 'Delete All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AddBatchDialog medicines={medicines} />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across {medicines.length} medicines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Need to be removed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Batch List</CardTitle>
              <CardDescription>
                Search for medicines or filter by status
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines or batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Medicines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Medicines</SelectItem>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <BatchTable 
              batches={filteredBatches} 
              medicines={medicines}
              canManage={canManageMedicines} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
