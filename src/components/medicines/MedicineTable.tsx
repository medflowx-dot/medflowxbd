import { useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Package,
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
import { AddMedicineDialog } from './AddMedicineDialog';
import { AddBatchDialog } from './AddBatchDialog';
import { useMedicines, type MedicineWithBatches } from '@/hooks/useMedicines';
import { usePermissions } from '@/hooks/usePermissions';

interface MedicineTableProps {
  medicines: MedicineWithBatches[];
  searchTerm: string;
  shelfFilter?: string;
}

export function MedicineTable({ medicines, searchTerm, shelfFilter = 'all' }: MedicineTableProps) {
  const [expandedMedicines, setExpandedMedicines] = useState<Set<string>>(new Set());
  const { deleteMedicine, deleteBatch } = useMedicines();
  const { hasPermission } = usePermissions();
  
  const canManageMedicines = hasPermission('manage_medicines');

  const toggleExpand = (id: string) => {
    setExpandedMedicines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
          {searchTerm ? 'No medicines found' : 'No medicines yet'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {searchTerm
            ? 'Try adjusting your search term'
            : 'Start by adding your first medicine to track inventory and batches.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Medicine</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Shelf</TableHead>
            <TableHead>Earliest Expiry</TableHead>
            {canManageMedicines && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMedicines.map((medicine) => {
            const isExpanded = expandedMedicines.has(medicine.id);
            const expiryStatus = getExpiryStatus(medicine.earliest_expiry);

            return (
              <>
                <TableRow key={medicine.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => toggleExpand(medicine.id)}>
                    {medicine.batches.length > 0 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell onClick={() => toggleExpand(medicine.id)}>
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medicine.generic_name && <span>{medicine.generic_name}</span>}
                        {medicine.manufacturer && (
                          <span className="ml-2">• {medicine.manufacturer}</span>
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => toggleExpand(medicine.id)}>
                    {medicine.category && (
                      <Badge variant="secondary">{medicine.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={() => toggleExpand(medicine.id)}>
                    {medicine.shelf_location ? (
                      <Badge variant="outline" className="font-mono">
                        {medicine.shelf_location}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell onClick={() => toggleExpand(medicine.id)}>
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
                    ) : (
                      <span className="text-muted-foreground text-sm">No batches</span>
                    )}
                  </TableCell>
                  {canManageMedicines && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <AddBatchDialog
                          medicineId={medicine.id}
                          medicineName={medicine.name}
                          trigger={
                            <Button variant="ghost" size="sm">
                              + Batch
                            </Button>
                          }
                        />
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
                              <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{medicine.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMedicine.mutate(medicine.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>

                {/* Expanded Batches */}
                {isExpanded && medicine.batches.length > 0 && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={canManageMedicines ? 6 : 5} className="p-0">
                      <div className="px-8 py-4">
                        <h4 className="font-medium text-sm mb-3">Batches ({medicine.batches.length})</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Batch #</TableHead>
                              <TableHead>Purchase Price</TableHead>
                              <TableHead>Selling Price</TableHead>
                              <TableHead>Expiry Date</TableHead>
                              <TableHead>Supplier</TableHead>
                              {canManageMedicines && (
                                <TableHead className="text-right">Actions</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medicine.batches.map((batch) => {
                              const batchExpiryStatus = getExpiryStatus(batch.expiry_date);
                              return (
                                <TableRow key={batch.id}>
                                  <TableCell className="font-mono text-sm">
                                    {batch.batch_number}
                                  </TableCell>
                                  <TableCell>৳{batch.purchase_price.toFixed(2)}</TableCell>
                                  <TableCell>৳{batch.selling_price.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        batchExpiryStatus === 'expired' || batchExpiryStatus === 'critical'
                                          ? 'destructive'
                                          : batchExpiryStatus === 'warning'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className={
                                        batchExpiryStatus === 'warning'
                                          ? 'bg-orange-500 hover:bg-orange-600'
                                          : batchExpiryStatus === 'notice'
                                          ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
                                          : ''
                                      }
                                    >
                                      {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {batch.supplier_name || '-'}
                                  </TableCell>
                                  {canManageMedicines && (
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <AddBatchDialog
                                          medicineId={medicine.id}
                                          medicineName={medicine.name}
                                          batch={batch}
                                          trigger={
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          }
                                        />
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete batch "{batch.batch_number}"? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => deleteBatch.mutate(batch.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
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
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
