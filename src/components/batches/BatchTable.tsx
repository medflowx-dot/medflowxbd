import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Layers, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { AddBatchDialog } from './AddBatchDialog';
import { useMedicines, type MedicineWithBatches, type MedicineBatch } from '@/hooks/useMedicines';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const { t } = useLanguage();
  const { deleteBatch } = useMedicines();
  const isMobile = useIsMobile();
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<BatchWithMedicine | null>(null);

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

  const handleDeleteClick = (batch: BatchWithMedicine) => {
    setBatchToDelete(batch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (batchToDelete) {
      deleteBatch.mutate(batchToDelete.id);
      setDeleteDialogOpen(false);
      setBatchToDelete(null);
      setExpandedBatchId(null);
    }
  };

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{t.batches.noBatchesFound}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {t.batches.tryAdjustingFilters}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("rounded-md border", isMobile ? "overflow-hidden" : "overflow-x-auto")}>
        <Table className={isMobile ? "" : "min-w-[500px]"}>
          <TableHeader>
            <TableRow>
              <TableHead>{t.batches.medicine}</TableHead>
              <TableHead>{t.batches.batchNo}</TableHead>
              <TableHead className="hidden sm:table-cell">{t.batches.expiryDate}</TableHead>
              <TableHead className="hidden md:table-cell">{t.batches.supplier}</TableHead>
              {canManage && (
                <TableHead className="text-right">{t.batches.actions}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => {
              const expiryStatus = getExpiryStatus(batch.expiry_date);
              const isExpired = expiryStatus === 'expired';
              const isExpanded = expandedBatchId === batch.id;

              // Action items for mobile grid
              type ActionItem = {
                icon: typeof Edit;
                label: string;
                color: string;
                type: 'edit' | 'delete';
              };

              const actionItems: ActionItem[] = [
                { 
                  icon: Edit, 
                  label: t.actions?.edit || 'Edit', 
                  color: 'text-primary',
                  type: 'edit'
                },
                { 
                  icon: Trash2, 
                  label: t.actions?.delete || 'Delete', 
                  color: 'text-destructive',
                  type: 'delete'
                },
              ];

              return (
                <>
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
                    <TableCell className="hidden sm:table-cell">
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
                        {isExpired ? `${t.batches.expired}: ` : ''}
                        {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {batch.supplier_name || '-'}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {/* Mobile: Show expand button */}
                        {isMobile ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                            className="h-8 px-2 gap-1 hover:bg-primary/10"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        ) : (
                          /* Desktop: Show all action buttons inline */
                          <div className="flex items-center justify-end gap-1">
                            <AddBatchDialog
                              medicines={medicines}
                              batch={batch}
                              defaultMedicineId={batch.medicine_id}
                              trigger={
                                <span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </span>
                              }
                            />
                            <Button 
                              variant={isExpired ? 'destructive' : 'ghost'} 
                              size="icon" 
                              className={`h-8 w-8 ${!isExpired ? 'text-destructive hover:text-destructive' : ''}`}
                              onClick={() => handleDeleteClick(batch)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                  
                  {/* Mobile: Expandable Action Grid Row */}
                  {isMobile && canManage && isExpanded && (
                    <TableRow key={`${batch.id}-actions`} className="bg-muted/20 border-b">
                      <TableCell colSpan={5} className="p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {actionItems.map((action, idx) => {
                            if (action.type === 'edit') {
                              return (
                                <AddBatchDialog
                                  key={idx}
                                  medicines={medicines}
                                  batch={batch}
                                  defaultMedicineId={batch.medicine_id}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      className="flex flex-col h-auto py-3 px-2 gap-1 w-full hover:bg-background/80 border border-border/50"
                                    >
                                      <action.icon className={cn("h-5 w-5", action.color)} />
                                      <span className="text-xs text-muted-foreground leading-tight text-center">{action.label}</span>
                                    </Button>
                                  }
                                />
                              );
                            }
                            if (action.type === 'delete') {
                              return (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  className={cn(
                                    "flex flex-col h-auto py-3 px-2 gap-1 w-full hover:bg-destructive/10 border border-border/50",
                                    isExpired && "bg-destructive/10"
                                  )}
                                  onClick={() => handleDeleteClick(batch)}
                                >
                                  <action.icon className={cn("h-5 w-5", action.color)} />
                                  <span className="text-xs text-muted-foreground leading-tight text-center">{action.label}</span>
                                </Button>
                              );
                            }
                            return null;
                          })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {batchToDelete && getExpiryStatus(batchToDelete.expiry_date) === 'expired' 
                ? t.batches.deleteExpiredBatch 
                : t.batches.deleteBatch}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {batchToDelete && (
                getExpiryStatus(batchToDelete.expiry_date) === 'expired'
                  ? t.batches.deleteExpiredBatchDesc.replace('{batch}', batchToDelete.batch_number)
                  : t.batches.deleteBatchDesc.replace('{batch}', batchToDelete.batch_number)
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
