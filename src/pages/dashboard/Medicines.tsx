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
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/skeletons';

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

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 stagger-children">
        <Card className="stat-card-info transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-info shrink-0">
              <Package className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-medium">{t.medicines.totalMedicines}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-info">{medicines.length}</div>
            <p className="text-xs text-muted-foreground">{t.medicines.registeredInSystem}</p>
          </CardContent>
        </Card>
        
        <Card className="stat-card-expense transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-danger shrink-0">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-medium">{t.medicines.expiryAlerts}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-destructive">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">{expired.length} {t.medicines.expired}, {expiring30.length} {t.medicines.expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger value="inventory" className="text-xs sm:text-sm">{t.medicines.myInventory}</TabsTrigger>
          <TabsTrigger value="global" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t.medicines.globalMedicines}</span>
            <span className="sm:hidden">গ্লোবাল</span>
          </TabsTrigger>
          <TabsTrigger value="expiry" className="relative text-xs sm:text-sm">
            <span className="hidden sm:inline">{t.medicines.expiryAlertsTab}</span>
            <span className="sm:hidden">মেয়াদ</span>
            {totalAlerts > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                "bg-destructive text-destructive-foreground",
                "badge-animated"
              )}>
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-info/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-container-info p-1.5">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    {t.medicines.medicineInventory}
                  </CardTitle>
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
            <CardContent className="p-0 sm:p-4">
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                <MedicineTable medicines={medicines} searchTerm={searchTerm} shelfFilter={shelfFilter} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-container-primary p-1.5">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    {t.medicines.globalMedicines}
                  </CardTitle>
                  <CardDescription>{t.medicines.globalDesc}</CardDescription>
                </div>
                {selectedCount > 0 && (
                  <Button onClick={handleBulkCopy} disabled={bulkCopyToLocal.isPending} className="bg-gradient-to-r from-primary to-primary/80">
                    <Copy className="h-4 w-4 mr-2" />
                    {bulkCopyToLocal.isPending ? t.medicines.copying : `${t.medicines.copySelected} (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-3 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.medicines.searchGlobal} value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-9" />
              </div>
              {globalLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : filteredGlobalMedicines.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <div className="h-16 w-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                    <Globe className="h-8 w-8 opacity-30" />
                  </div>
                  <p>{t.medicines.noGlobalFound}</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allCopyableSelected && copyableMedicines.length > 0}
                            onCheckedChange={toggleSelectAll}
                            disabled={copyableMedicines.length === 0}
                          />
                        </TableHead>
                        <TableHead>{t.medicines.medicineName}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t.medicines.genericName}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t.medicines.manufacturer}</TableHead>
                        <TableHead className="w-[100px]">{t.medicines.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGlobalMedicines.map((medicine) => {
                        const alreadyCopied = isAlreadyCopied(medicine);
                        return (
                          <TableRow key={medicine.id} className={alreadyCopied ? "bg-green-50/50 dark:bg-green-950/20" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(medicine.id)}
                                onCheckedChange={() => toggleSelect(medicine.id)}
                                disabled={alreadyCopied}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {medicine.name}
                              <span className="block sm:hidden text-xs text-muted-foreground">{medicine.generic_name || '-'}</span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{medicine.generic_name || '-'}</TableCell>
                            <TableCell className="hidden sm:table-cell">{medicine.manufacturer?.name || '-'}</TableCell>
                            <TableCell>
                              <Button 
                                variant={alreadyCopied ? "secondary" : "outline"} 
                                size="sm" 
                                onClick={() => handleCopy(medicine)} 
                                disabled={copyToLocal.isPending || alreadyCopied}
                                className={alreadyCopied ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">{alreadyCopied ? t.medicines.added : t.medicines.copy}</span>
                                <span className="sm:hidden">{alreadyCopied ? '✓' : '+'}</span>
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
