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
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Medicines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [shelfFilter, setShelfFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { medicines, isLoading } = useMedicines();
  const { medicines: globalMedicines, isLoading: globalLoading, copyToLocal, bulkCopyToLocal } = useGlobalMedicines();
  const { expired, expiring30, totalAlerts } = useExpiryAlerts();
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();
  
  const canManageMedicines = hasPermission('manage_medicines');

  const shelfLocations = useMemo(() => {
    const locations = medicines.map(m => m.shelf_location).filter((loc): loc is string => !!loc && loc.trim() !== '');
    return [...new Set(locations)].sort();
  }, [medicines]);

  const filteredGlobalMedicines = globalMedicines.filter(m =>
    m.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const isAlreadyCopied = (globalMed: GlobalMedicine) => {
    return medicines.some(m => m.name.toLowerCase() === globalMed.name.toLowerCase());
  };

  const copyableMedicines = filteredGlobalMedicines.filter(m => !isAlreadyCopied(m));
  const allCopyableSelected = copyableMedicines.length > 0 && copyableMedicines.every(m => selectedIds.has(m.id));

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (allCopyableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(copyableMedicines.map(m => m.id)));
    }
  };

  const handleCopy = async (medicine: GlobalMedicine) => {
    if (isAlreadyCopied(medicine)) {
      toast.info(t.medicines.alreadyInInventory);
      return;
    }
    await copyToLocal.mutateAsync(medicine);
  };

  const handleBulkCopy = async () => {
    const selectedMedicines = globalMedicines.filter(m => selectedIds.has(m.id) && !isAlreadyCopied(m));
    if (selectedMedicines.length === 0) {
      toast.info(t.medicines.noNewSelected);
      return;
    }
    await bulkCopyToLocal.mutateAsync(selectedMedicines);
    setSelectedIds(new Set());
  };

  const selectedCount = Array.from(selectedIds).filter(id => {
    const med = globalMedicines.find(m => m.id === id);
    return med && !isAlreadyCopied(med);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.medicines.title}</h1>
          <p className="text-muted-foreground mt-1">
            {canManageMedicines ? t.medicines.subtitle : t.medicines.subtitleView}
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
            <CardTitle className="text-sm font-medium">{t.medicines.totalMedicines}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
            <p className="text-xs text-muted-foreground">{t.medicines.registeredInSystem}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.medicines.expiryAlerts}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">{expired.length} {t.medicines.expired}, {expiring30.length} {t.medicines.expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">{t.medicines.myInventory}</TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            {t.medicines.globalMedicines}
          </TabsTrigger>
          <TabsTrigger value="expiry" className="relative">
            {t.medicines.expiryAlertsTab}
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
                  <CardTitle>{t.medicines.medicineInventory}</CardTitle>
                  <CardDescription>{t.medicines.inventoryDesc}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t.medicines.searchMedicines} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  {shelfLocations.length > 0 && (
                    <Select value={shelfFilter} onValueChange={setShelfFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder={t.medicines.allShelves} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.medicines.allShelves}</SelectItem>
                        <SelectItem value="unassigned">{t.medicines.unassigned}</SelectItem>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.medicines.globalMedicines}</CardTitle>
                  <CardDescription>{t.medicines.globalDesc}</CardDescription>
                </div>
                {selectedCount > 0 && (
                  <Button onClick={handleBulkCopy} disabled={bulkCopyToLocal.isPending}>
                    <Copy className="h-4 w-4 mr-2" />
                    {bulkCopyToLocal.isPending ? t.medicines.copying : `${t.medicines.copySelected} (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.medicines.searchGlobal} value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-9" />
              </div>
              {globalLoading ? (
                <div className="py-8 text-center text-muted-foreground">{t.messages.loading}</div>
              ) : filteredGlobalMedicines.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>{t.medicines.noGlobalFound}</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allCopyableSelected && copyableMedicines.length > 0}
                            onCheckedChange={toggleSelectAll}
                            disabled={copyableMedicines.length === 0}
                          />
                        </TableHead>
                        <TableHead>{t.medicines.medicineName}</TableHead>
                        <TableHead>{t.medicines.genericName}</TableHead>
                        <TableHead>{t.medicines.manufacturer}</TableHead>
                        <TableHead className="w-[100px]">{t.medicines.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGlobalMedicines.map((medicine) => {
                        const alreadyCopied = isAlreadyCopied(medicine);
                        return (
                          <TableRow key={medicine.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(medicine.id)}
                                onCheckedChange={() => toggleSelect(medicine.id)}
                                disabled={alreadyCopied}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.generic_name || '-'}</TableCell>
                            <TableCell>{medicine.manufacturer?.name || '-'}</TableCell>
                            <TableCell>
                              <Button variant={alreadyCopied ? "secondary" : "outline"} size="sm" onClick={() => handleCopy(medicine)} disabled={copyToLocal.isPending || alreadyCopied}>
                                <Copy className="h-4 w-4 mr-1" />
                                {alreadyCopied ? t.medicines.added : t.medicines.copy}
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
