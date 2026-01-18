import { format } from 'date-fns';
import {
  Edit,
  Trash2,
  Package,
  Plus,
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
  const { deleteMedicine } = useMedicines();
  const { hasPermission } = usePermissions();
  
  const canManageMedicines = hasPermission('manage_medicines');

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
            : 'Start by adding your first medicine to track inventory.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden sm:table-cell">Shelf</TableHead>
            <TableHead className="hidden lg:table-cell">Batches</TableHead>
            <TableHead>Expiry</TableHead>
            {canManageMedicines && (
              <TableHead className="text-right">Actions</TableHead>
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
                    <p className="text-sm text-muted-foreground">
                      {medicine.generic_name && <span>{medicine.generic_name}</span>}
                      {medicine.manufacturer && (
                        <span className="ml-2">• {medicine.manufacturer}</span>
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
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
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">
                    {medicine.batches.length}
                  </Badge>
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
                          Add batch
                        </Button>
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No batches</span>
                  )}
                </TableCell>
                {canManageMedicines && (
                  <TableCell className="text-right">
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
                            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{medicine.name}"? This will also delete all associated batches. This action cannot be undone.
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
