import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Wallet, ArrowUpCircle, MoreHorizontal } from 'lucide-react';
import { useSuppliers, SupplierPayment, SupplierPaymentType } from '@/hooks/useSuppliers';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditSupplierPaymentDialogProps {
  payment: SupplierPayment;
}

export function EditSupplierPaymentDialog({ payment }: EditSupplierPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { updatePayment } = useSuppliers();
  const { t } = useLanguage();
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    payment.payment_date ? parseISO(payment.payment_date) : new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    payment_method: payment.payment_method,
    payment_type: payment.payment_type as SupplierPaymentType,
    reference_number: payment.reference_number || '',
    notes: payment.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updatePayment({
        id: payment.id,
        amount: parseFloat(formData.amount),
        payment_date: paymentDate ? format(paymentDate, 'yyyy-MM-dd') : payment.payment_date,
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null,
      });
      setOpen(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOthersPayment = formData.payment_type === 'others';
  const isNotesRequired = isOthersPayment && !formData.notes.trim();
  const paymentAmount = parseFloat(formData.amount) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.suppliers?.editPayment || 'Edit Payment'}</DialogTitle>
          <DialogDescription>
            {t.suppliers?.editPaymentDesc || 'Update the payment details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div className="space-y-2">
            <Label>{t.suppliers?.paymentType || 'Payment Type'}</Label>
            <Select
              value={formData.payment_type}
              onValueChange={(value: SupplierPaymentType) => setFormData({ ...formData, payment_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_payment">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {t.suppliers?.duePayment || 'Due Payment'}
                  </div>
                </SelectItem>
                <SelectItem value="advance">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    {t.suppliers?.advancePayment || 'Advance Payment'}
                  </div>
                </SelectItem>
                <SelectItem value="others">
                  <div className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    {t.suppliers?.othersPayment || 'Others'}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t.labels?.amount || 'Amount'} *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.labels?.date || 'Date'}</Label>
              <DatePicker
                date={paymentDate}
                onDateChange={setPaymentDate}
                placeholder={t.batches?.pickDate || "Select date"}
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">{t.sales?.paymentMethod || 'Payment Method'}</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.sales?.cash || 'Cash'}</SelectItem>
                  <SelectItem value="bank">{t.suppliers?.bankTransfer || 'Bank Transfer'}</SelectItem>
                  <SelectItem value="bkash">{t.sales?.bkash || 'bKash'}</SelectItem>
                  <SelectItem value="nagad">{t.sales?.nagad || 'Nagad'}</SelectItem>
                  <SelectItem value="cheque">{t.suppliers?.cheque || 'Cheque'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference_number">{t.suppliers?.referenceNumber || 'Reference #'}</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="TXN-123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {t.labels?.notes || 'Notes'} {isOthersPayment && '*'}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isOthersPayment 
                ? (t.suppliers?.othersNotesPlaceholder || 'Describe the reason for this payment...')
                : (t.suppliers?.paymentNotesPlaceholder || 'Payment notes')
              }
              rows={2}
              required={isOthersPayment}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.amount || paymentAmount <= 0 || isNotesRequired || isSubmitting}
            >
              {isSubmitting ? (t.messages?.loading || 'Saving...') : (t.suppliers?.updatePayment || 'Update Payment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
