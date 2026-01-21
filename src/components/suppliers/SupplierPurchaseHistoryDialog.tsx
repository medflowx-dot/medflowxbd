import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ShoppingCart, Pencil, Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Supplier, SupplierPurchase, useSuppliers } from '@/hooks/useSuppliers';
import { EditPurchaseDialog } from './EditPurchaseDialog';
import { AddPurchaseDialog } from './AddPurchaseDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SupplierPurchaseHistoryDialogProps {
  supplier: Supplier;
  purchases: SupplierPurchase[];
  trigger?: React.ReactNode;
}

export function SupplierPurchaseHistoryDialog({ supplier, purchases, trigger }: SupplierPurchaseHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deletePurchaseId, setDeletePurchaseId] = useState<string | null>(null);
  const { deletePurchase, suppliers } = useSuppliers();
  const { t } = useLanguage();

  const supplierPurchases = purchases.filter(p => p.supplier_id === supplier.id);
  const totalPurchaseAmount = supplierPurchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalPaidAmount = supplierPurchases.reduce((sum, p) => sum + p.paid_amount, 0);
  const totalDueAmount = supplierPurchases.reduce((sum, p) => sum + p.due_amount, 0);

  const handleDelete = async () => {
    if (deletePurchaseId) {
      await deletePurchase(deletePurchaseId);
      setDeletePurchaseId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="icon" variant="ghost" title={t.suppliers.purchaseHistory}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t.suppliers.purchaseHistory}: {supplier.name}
            </DialogTitle>
            <DialogDescription>
              {t.suppliers.purchaseHistoryDesc}
            </DialogDescription>
          </DialogHeader>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t.suppliers.totalPurchaseAmount}</p>
              <p className="text-xl font-bold">৳{Math.round(totalPurchaseAmount)}</p>
            </div>
            <div className="bg-success/10 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t.suppliers.totalPaid}</p>
              <p className="text-xl font-bold text-success">৳{Math.round(totalPaidAmount)}</p>
            </div>
            <div className={cn(
              "rounded-lg p-3",
              totalDueAmount > 0 ? "bg-destructive/10" : "bg-muted/50"
            )}>
              <p className="text-sm text-muted-foreground">{t.suppliers.totalDue}</p>
              <p className={cn(
                "text-xl font-bold",
                totalDueAmount > 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                ৳{totalDueAmount > 0 ? Math.round(totalDueAmount) : '0'}
              </p>
            </div>
          </div>

          {/* Add Purchase Button */}
          <div className="flex justify-end mb-2">
            <AddPurchaseDialog
              suppliers={suppliers}
              defaultSupplierId={supplier.id}
              trigger={
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  {t.suppliers.addPurchase}
                </Button>
              }
            />
          </div>

          {/* Purchase History Table */}
          <ScrollArea className="h-[400px] rounded-md border">
            {supplierPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{t.suppliers.noPurchasesYet}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.labels.date}</TableHead>
                    <TableHead className="text-right">{t.labels.total}</TableHead>
                    <TableHead className="text-right">{t.sales.paid}</TableHead>
                    <TableHead className="text-right">{t.suppliers.dueAmount}</TableHead>
                    <TableHead className="w-[80px] sticky right-0 bg-background">{t.suppliers.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(parseISO(purchase.purchase_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ৳{Math.round(purchase.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        ৳{Math.round(purchase.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {purchase.due_amount > 0 ? (
                          <Badge variant="destructive">৳{Math.round(purchase.due_amount)}</Badge>
                        ) : (
                          <Badge variant="secondary">৳0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-background">
                        <div className="flex items-center gap-1">
                          <EditPurchaseDialog
                            purchase={purchase}
                            trigger={
                              <Button size="icon" variant="ghost" title={t.suppliers.editPurchase}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            title={t.suppliers.deletePurchase}
                            onClick={() => setDeletePurchaseId(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {supplierPurchases.length > 0 && (
            <div className="text-sm text-muted-foreground text-right">
              {supplierPurchases.length} {t.suppliers.purchasesLabel}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePurchaseId} onOpenChange={() => setDeletePurchaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.deletePurchase}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers.deletePurchaseConfirm}
              <br />
              <span className="text-destructive">{t.suppliers.deletePurchaseWarning}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
