import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CustomerPayment, useUpdateCustomerPayment } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: CustomerPayment | null;
}

export function EditPaymentDialog({ open, onOpenChange, payment }: EditPaymentDialogProps) {
  const updatePayment = useUpdateCustomerPayment();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    notes: '',
  });
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        payment_method: payment.payment_method || 'cash',
        notes: payment.notes || '',
      });
      setPaymentDate(payment.payment_date ? parseISO(payment.payment_date) : new Date());
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    updatePayment.mutate({
      id: payment.id,
      amount,
      payment_method: formData.payment_method,
      payment_date: paymentDate ? format(paymentDate, 'yyyy-MM-dd') : payment.payment_date,
      notes: formData.notes || null,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.customerDues?.editPayment || 'Edit Payment'}</DialogTitle>
          <DialogDescription>
            {t.customerDues?.editPaymentDesc || 'Update payment details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t.customerDues?.amount || 'Amount'} *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
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

          <div className="space-y-2">
            <Label>{t.customerDues?.paymentMethod || 'Payment Method'}</Label>
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
                <SelectItem value="bank">{t.customerDues?.bank || 'Bank'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.labels?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.customerDues?.additionalNotes || 'Any additional notes...'}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={!formData.amount || updatePayment.isPending}>
              {updatePayment.isPending ? (t.messages?.loading || 'Saving...') : (t.customerDues?.updatePayment || 'Update Payment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
