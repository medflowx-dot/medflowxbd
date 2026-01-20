import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { SupplierPurchase, useSuppliers } from '@/hooks/useSuppliers';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditPurchaseDialogProps {
  purchase: SupplierPurchase;
}

export function EditPurchaseDialog({ purchase }: EditPurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const { updatePurchase } = useSuppliers();
  const { t } = useLanguage();
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    purchase.purchase_date ? parseISO(purchase.purchase_date) : new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: purchase.invoice_number || '',
    total_amount: purchase.total_amount.toString(),
    paid_amount: purchase.paid_amount.toString(),
    notes: purchase.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalAmount = parseFloat(formData.total_amount) || 0;
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    try {
      await updatePurchase({
        id: purchase.id,
        invoice_number: formData.invoice_number || null,
        purchase_date: purchaseDate ? format(purchaseDate, 'yyyy-MM-dd') : purchase.purchase_date,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        notes: formData.notes || null,
      });
      setOpen(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = parseFloat(formData.total_amount) || 0;
  const paidAmount = parseFloat(formData.paid_amount) || 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.suppliers?.editPurchase || 'Edit Purchase'}</DialogTitle>
          <DialogDescription>
            {t.suppliers?.editPurchaseDesc || 'Update the purchase details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.suppliers?.supplierName || 'Supplier'}</Label>
            <Input value={purchase.supplier?.name || '-'} disabled className="bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">{t.suppliers?.invoiceNumber || 'Invoice #'}</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="INV-001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.labels?.date || 'Date'}</Label>
              <DatePicker
                date={purchaseDate}
                onDateChange={setPurchaseDate}
                placeholder={t.batches?.pickDate || "Select date"}
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">{t.labels?.total || 'Total Amount'} *</Label>
              <Input
                id="total_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_amount">{t.sales?.paid || 'Paid Amount'}</Label>
              <Input
                id="paid_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>{t.suppliers?.dueAmount || 'Due Amount'}:</span>
              <span className={`font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                ৳{dueAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.labels?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.suppliers?.additionalNotes || 'Additional notes'}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={!formData.total_amount || isSubmitting}>
              {isSubmitting ? (t.messages?.loading || 'Saving...') : (t.suppliers?.updatePurchase || 'Update Purchase')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
