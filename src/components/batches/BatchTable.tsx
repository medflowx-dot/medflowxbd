import { format } from 'date-fns';
import { Edit, Trash2, Layers } from 'lucide-react';
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
import { AddBatchDialog } from './AddBatchDialog';
import { useMedicines, type MedicineWithBatches, type MedicineBatch } from '@/hooks/useMedicines';

interface BatchWithMedicine extends MedicineBatch {
  medicine_name: string;
  medicine_id: string;
  medicine_unit: string;
}

interface BatchTableProps {
  batches: BatchWithMedicine[];
  medicines: MedicineWithBatches[];
  canManage: boolean;
}

export function BatchTable({ batches, medicines, canManage }: BatchTableProps) {
  const { deleteBatch } = useMedicines();

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'critical';
    if (daysUntilExpiry <= 60) return 'warning';
    if (daysUntilExpiry <= 90) return 'notice';
    return 'safe';
  };

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No batches found</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          Try adjusting your filters or add a new batch.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Batch #</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Supplier</TableHead>
            {canManage && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => {
            const expiryStatus = getExpiryStatus(batch.expiry_date);
            const isExpired = expiryStatus === 'expired';

            return (
              <TableRow 
                key={batch.id} 
                className={isExpired ? 'bg-destructive/5' : ''}
              >
                <TableCell>
                  <div className="font-medium">{batch.medicine_name}</div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {batch.batch_number}
                </TableCell>
                <TableCell>৳{batch.purchase_price.toFixed(2)}</TableCell>
                <TableCell>৳{batch.selling_price.toFixed(2)}</TableCell>
                <TableCell>
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
                    {isExpired ? 'Expired: ' : ''}
                    {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {batch.supplier_name || '-'}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <AddBatchDialog
                        medicines={medicines}
                        batch={batch}
                        defaultMedicineId={batch.medicine_id}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant={isExpired ? 'destructive' : 'ghost'} 
                            size="icon" 
                            className={`h-8 w-8 ${!isExpired ? 'text-destructive hover:text-destructive' : ''}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {isExpired ? 'Delete Expired Batch' : 'Delete Batch'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {isExpired 
                                ? `This batch "${batch.batch_number}" has expired. Are you sure you want to permanently delete it?`
                                : `Are you sure you want to delete batch "${batch.batch_number}"? This action cannot be undone.`
                              }
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
  );
}
