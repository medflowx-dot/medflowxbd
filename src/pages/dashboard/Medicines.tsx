import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, AlertTriangle, MapPin, Globe, Copy } from 'lucide-react';
import { AddMedicineDialog } from '@/components/medicines/AddMedicineDialog';
import { BulkImportDialog } from '@/components/medicines/BulkImportDialog';
import { MedicineTable } from '@/components/medicines/MedicineTable';
import { ExpiryAlerts } from '@/components/medicines/ExpiryAlerts';
import { useMedicines, useExpiryAlerts } from '@/hooks/useMedicines';
import { useGlobalMedicines, GlobalMedicine } from '@/hooks/useGlobalMedicines';
import { usePermissions } from '@/hooks/usePermissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function Medicines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [shelfFilter, setShelfFilter] = useState<string>('all');
  const { medicines, isLoading } = useMedicines();
  const { medicines: globalMedicines, isLoading: globalLoading, copyToLocal } = useGlobalMedicines();
  const { expired, expiring30, totalAlerts } = useExpiryAlerts();
  const { hasPermission } = usePermissions();
  
  const canManageMedicines = hasPermission('manage_medicines');

  const shelfLocations = useMemo(() => {
    const locations = medicines
      .map(m => m.shelf_location)
      .filter((loc): loc is string => !!loc && loc.trim() !== '');
    return [...new Set(locations)].sort();
  }, [medicines]);

  const filteredGlobalMedicines = globalMedicines.filter(m =>
    m.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const isAlreadyCopied = (globalMed: GlobalMedicine) => {
    return medicines.some(m => m.name.toLowerCase() === globalMed.name.toLowerCase());
  };

  const handleCopy = async (medicine: GlobalMedicine) => {
    if (isAlreadyCopied(medicine)) {
      toast.info('This medicine is already in your inventory');
      return;
    }
    await copyToLocal.mutateAsync(medicine);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Medicines</h1>
          <p className="text-muted-foreground mt-1">
            {canManageMedicines ? 'Manage your medicine inventory and batches' : 'View medicine inventory'}
          </p>
        </div>
        {canManageMedicines && (
          <div className="flex items-center gap-2">
            <BulkImportDialog />
            <AddMedicineDialog />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">{expired.length} expired, {expiring30.length} expiring soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">My Inventory</TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            Global Medicines
          </TabsTrigger>
          <TabsTrigger value="expiry" className="relative">
            Expiry Alerts
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Medicine Inventory</CardTitle>
                  <CardDescription>Track all medicines, batches, and expiry dates</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  {shelfLocations.length > 0 && (
                    <Select value={shelfFilter} onValueChange={setShelfFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Shelves" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shelves</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {shelfLocations.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                      </SelectContent>
                    </Select>
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
                <MedicineTable medicines={medicines} searchTerm={searchTerm} shelfFilter={shelfFilter} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Medicines</CardTitle>
              <CardDescription>Browse and copy medicines from the master list to your inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search global medicines..." value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-9" />
              </div>
              {globalLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : filteredGlobalMedicines.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No global medicines found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Generic Name</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGlobalMedicines.map((medicine) => {
                        const alreadyCopied = isAlreadyCopied(medicine);
                        return (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.generic_name || '-'}</TableCell>
                            <TableCell>{medicine.manufacturer?.name || '-'}</TableCell>
                            <TableCell>
                              <Button variant={alreadyCopied ? "secondary" : "outline"} size="sm" onClick={() => handleCopy(medicine)} disabled={copyToLocal.isPending || alreadyCopied}>
                                <Copy className="h-4 w-4 mr-1" />
                                {alreadyCopied ? 'Added' : 'Copy'}
                              </Button>
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
        </TabsContent>

        <TabsContent value="expiry">
          <ExpiryAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
