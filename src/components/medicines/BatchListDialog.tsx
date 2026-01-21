import { format } from 'date-fns';
import { Package, Calendar, Hash, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useMedicines, type MedicineBatch } from '@/hooks/useMedicines';
import { usePermissions } from '@/hooks/usePermissions';

interface BatchListDialogProps {
  medicineName: string;
  medicineId: string;
  batches: MedicineBatch[];
  trigger: React.ReactNode;
}

export function BatchListDialog({ medicineName, medicineId, batches, trigger }: BatchListDialogProps) {
  const { deleteBatch } = useMedicines();
  const { hasPermission } = usePermissions();
  const canManageMedicines = hasPermission('manage_medicines');

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

  const getExpiryBadge = (expiryDate: string) => {
    const status = getExpiryStatus(expiryDate);
    const formattedDate = format(new Date(expiryDate), 'dd MMM yyyy');

    switch (status) {
      case 'expired':
        return <Badge variant="destructive">{formattedDate}</Badge>;
      case 'critical':
        return <Badge variant="destructive">{formattedDate}</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500 hover:bg-orange-600">{formattedDate}</Badge>;
      case 'notice':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">{formattedDate}</Badge>;
      default:
        return <Badge variant="secondary">{formattedDate}</Badge>;
    }
  };

  const getStatusLabel = (expiryDate: string) => {
    const status = getExpiryStatus(expiryDate);
    switch (status) {
      case 'expired':
        return <span className="text-destructive text-xs">Expired</span>;
      case 'critical':
        return <span className="text-destructive text-xs">Expiring soon</span>;
      case 'warning':
        return <span className="text-orange-500 text-xs">60 days</span>;
      case 'notice':
        return <span className="text-yellow-600 text-xs">90 days</span>;
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent variant="fullscreen" className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {medicineName} - Batches ({batches.length})
          </DialogTitle>
        </DialogHeader>
        
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No batches</h3>
            <p className="text-muted-foreground text-sm mt-1">
              No batches have been added for this medicine yet.
            </p>
            {canManageMedicines && (
              <AddBatchDialog
                medicineId={medicineId}
                medicineName={medicineName}
                trigger={
                  <Button className="mt-4">
                    Add First Batch
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Batch No
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expiry
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    {canManageMedicines && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches
                    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
                    .map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono font-medium">
                          {batch.batch_number}
                        </TableCell>
                        <TableCell>
                          {getExpiryBadge(batch.expiry_date)}
                        </TableCell>
                        <TableCell>
                          {getStatusLabel(batch.expiry_date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {batch.supplier_name || '—'}
                        </TableCell>
                        {canManageMedicines && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <AddBatchDialog
                                medicineId={medicineId}
                                medicineName={medicineName}
                                batch={batch}
                                trigger={
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                }
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
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
                    ))}
                </TableBody>
              </Table>
            </div>
            
            {canManageMedicines && (
              <div className="mt-4 flex justify-end">
                <AddBatchDialog
                  medicineId={medicineId}
                  medicineName={medicineName}
                  trigger={
                    <Button variant="outline" size="sm">
                      Add New Batch
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
