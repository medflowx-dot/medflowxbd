import { useState } from 'react';
import { format } from 'date-fns';
import {
  Edit,
  Trash2,
  Package,
  Plus,
  Building2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AddMedicineDialog } from './AddMedicineDialog';
import { AddBatchDialog } from './AddBatchDialog';
import { BatchListDialog } from './BatchListDialog';
import { useMedicines, type MedicineWithBatches } from '@/hooks/useMedicines';
import { useManufacturers } from '@/hooks/useManufacturers';
import { usePermissions } from '@/hooks/usePermissions';
import { useLanguage } from '@/contexts/LanguageContext';

interface MedicineTableProps {
  medicines: MedicineWithBatches[];
  searchTerm: string;
  shelfFilter?: string;
}

export function MedicineTable({ medicines, searchTerm, shelfFilter = 'all' }: MedicineTableProps) {
  const { deleteMedicine, updateMedicine } = useMedicines();
  const { manufacturers } = useManufacturers();
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const canManageMedicines = hasPermission('manage_medicines');

  const handleManufacturerChange = async (medicineId: string, manufacturerId: string) => {
    setUpdatingId(medicineId);
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    try {
      await updateMedicine.mutateAsync({
        id: medicineId,
        manufacturer_id: manufacturerId === 'none' ? undefined : manufacturerId,
        manufacturer: manufacturer?.name || undefined,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMedicines = medicines.filter((medicine) => {
    // Text search filter
    const matchesSearch = 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.shelf_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Shelf location filter
    let matchesShelf = true;
    if (shelfFilter !== 'all') {
      if (shelfFilter === 'unassigned') {
        matchesShelf = !medicine.shelf_location || medicine.shelf_location.trim() === '';
      } else {
        matchesShelf = medicine.shelf_location === shelfFilter;
      }
    }
    
    return matchesSearch && matchesShelf;
  });

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'critical';
    if (daysUntilExpiry <= 60) return 'warning';
    if (daysUntilExpiry <= 90) return 'notice';
    return 'safe';
  };

  if (filteredMedicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">
          {searchTerm ? t.medicines.noMedicinesFound : t.medicines.noMedicinesYet}
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {searchTerm
            ? t.medicines.tryAdjustingSearch
            : t.medicines.startByAdding}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.medicines.medicine}</TableHead>
            <TableHead className="hidden md:table-cell">{t.medicines.manufacturer}</TableHead>
            <TableHead className="hidden lg:table-cell">{t.medicines.category}</TableHead>
            <TableHead className="hidden sm:table-cell">{t.medicines.shelf}</TableHead>
            <TableHead className="hidden xl:table-cell">{t.medicines.batches}</TableHead>
            <TableHead>{t.medicines.expiry}</TableHead>
            {canManageMedicines && (
              <TableHead className="text-right sticky right-0 bg-background">{t.medicines.actions}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMedicines.map((medicine) => {
            const expiryStatus = getExpiryStatus(medicine.earliest_expiry);

            return (
              <TableRow key={medicine.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{medicine.name}</p>
                    {medicine.generic_name && (
                      <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {canManageMedicines ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-auto py-1 px-2 ${!medicine.manufacturer_id ? 'text-muted-foreground' : ''}`}
                          disabled={updatingId === medicine.id}
                        >
                          {updatingId === medicine.id ? (
                            <span className="text-xs">{t.medicines.saving}</span>
                          ) : medicine.manufacturer ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {medicine.manufacturer}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs">
                              <Plus className="h-3 w-3" />
                              {t.medicines.setManufacturer}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="start">
                        <Select
                          value={medicine.manufacturer_id || 'none'}
                          onValueChange={(value) => handleManufacturerChange(medicine.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t.medicines.selectManufacturer} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t.medicines.none}</SelectItem>
                            {manufacturers.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </PopoverContent>
                    </Popover>
                  ) : medicine.manufacturer ? (
                    <span className="text-sm">{medicine.manufacturer}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {medicine.category && (
                    <Badge variant="secondary">{medicine.category}</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {medicine.shelf_location ? (
                    <Badge variant="outline" className="font-mono">
                      {medicine.shelf_location}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <BatchListDialog
                    medicineName={medicine.name}
                    medicineId={medicine.id}
                    batches={medicine.batches}
                    trigger={
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        {medicine.batches.length}
                      </Badge>
                    }
                  />
                </TableCell>
                <TableCell>
                  {medicine.earliest_expiry ? (
                    <Badge
                      variant={
                        expiryStatus === 'expired' || expiryStatus === 'critical'
                          ? 'destructive'
                          : expiryStatus === 'warning'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        expiryStatus === 'warning'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : expiryStatus === 'notice'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
                          : ''
                      }
                    >
                      {format(new Date(medicine.earliest_expiry), 'dd MMM yyyy')}
                    </Badge>
                  ) : canManageMedicines ? (
                    <AddBatchDialog
                      medicineId={medicine.id}
                      medicineName={medicine.name}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-primary text-sm h-auto py-1 px-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {t.medicines.addBatch}
                        </Button>
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">{t.medicines.noBatches}</span>
                  )}
                </TableCell>
                {canManageMedicines && (
                  <TableCell className="text-right sticky right-0 bg-background">
                    <div className="flex items-center justify-end gap-1">
                      <AddMedicineDialog
                        medicine={medicine}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.medicines.deleteMedicine}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.medicines.deleteConfirm} "{medicine.name}"? {t.medicines.deleteWarning}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMedicine.mutate(medicine.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t.actions.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
