import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { Sale, useSales } from '@/hooks/useSales';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditSaleDialogProps {
  sale: Sale;
  trigger?: React.ReactNode;
}

export function EditSaleDialog({ sale, trigger }: EditSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateSale } = useSales();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    discount: sale.discount.toString(),
    paid_amount: sale.paid_amount.toString(),
    payment_method: sale.payment_method,
    notes: sale.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const discount = parseFloat(formData.discount) || 0;
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const totalAmount = sale.subtotal - discount;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    try {
      await updateSale.mutateAsync({
        id: sale.id,
        discount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
      });
      setOpen(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const discount = parseFloat(formData.discount) || 0;
  const paidAmount = parseFloat(formData.paid_amount) || 0;
  const totalAmount = sale.subtotal - discount;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.sales?.editSale || 'Edit Sale'}</DialogTitle>
          <DialogDescription>
            {t.sales?.editSaleDesc || 'Update sale payment details'} - {sale.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t.sales?.subtotal || 'Subtotal'}:</span>
              <span className="font-medium">৳{Math.round(Number(sale.subtotal))}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">{t.sales?.discount || 'Discount'}</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                max={sale.subtotal}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_amount">{t.sales?.paidAmount || 'Paid Amount'}</Label>
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

          <div className="space-y-2">
            <Label>{t.sales?.paymentMethod || 'Payment Method'}</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t.sales?.cash || 'Cash'}</SelectItem>
                <SelectItem value="bkash">{t.sales?.bkash || 'bKash'}</SelectItem>
                <SelectItem value="nagad">{t.sales?.nagad || 'Nagad'}</SelectItem>
                <SelectItem value="card">{t.sales?.card || 'Card'}</SelectItem>
                <SelectItem value="mixed">{t.sales?.mixed || 'Mixed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t.labels?.total || 'Total'}:</span>
              <span className="font-medium">৳{Math.round(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t.sales?.due || 'Due'}:</span>
              <span className={`font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                ৳{Math.round(dueAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.labels?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.sales?.anyNotes || 'Any notes...'}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (t.messages?.loading || 'Saving...') : (t.sales?.updateSale || 'Update Sale')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
