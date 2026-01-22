import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Wallet, ArrowUpCircle, MoreHorizontal } from 'lucide-react';
import { useSuppliers, Supplier, SupplierPaymentType } from '@/hooks/useSuppliers';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface SupplierPaymentDialogProps {
  supplier: Supplier;
  trigger?: React.ReactNode;
}

export function SupplierPaymentDialog({ supplier, trigger }: SupplierPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { addPayment } = useSuppliers();
  const { t } = useLanguage();
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_type: 'due_payment' as SupplierPaymentType,
    reference_number: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addPayment({
        supplier_id: supplier.id,
        amount: parseFloat(formData.amount),
        payment_date: paymentDate ? format(paymentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null,
      });
      setOpen(false);
      setPaymentDate(new Date());
      setFormData({
        amount: '',
        payment_method: 'cash',
        payment_type: 'due_payment',
        reference_number: '',
        notes: '',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const paymentAmount = parseFloat(formData.amount) || 0;
  const remainingDue = supplier.total_due - paymentAmount;
  const isDuePayment = formData.payment_type === 'due_payment';
  const isOthersPayment = formData.payment_type === 'others';

  // Determine max amount based on payment type
  const maxAmount = isDuePayment ? supplier.total_due : undefined;

  // Check if notes are required (for 'others' type)
  const isNotesRequired = isOthersPayment && !formData.notes.trim();

  const getPaymentTypeIcon = (type: SupplierPaymentType) => {
    switch (type) {
      case 'due_payment':
        return <Wallet className="h-4 w-4" />;
      case 'advance':
        return <ArrowUpCircle className="h-4 w-4" />;
      case 'others':
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            {supplier.total_due > 0 
              ? (t.suppliers?.payDue || 'Pay Due')
              : (t.suppliers?.makePayment || 'Make Payment')
            }
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.suppliers?.recordPaymentToSupplier || 'Record Payment to Supplier'}</DialogTitle>
          <DialogDescription>
            {t.suppliers?.recordPaymentTo || 'Record a payment to'} {supplier.name}
          </DialogDescription>
        </DialogHeader>

        {/* Current Due Info */}
        <div className="p-3 bg-muted rounded-lg mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.suppliers?.currentDue || 'Current Due'}:</span>
            <span className={`font-semibold ${supplier.total_due > 0 ? 'text-destructive' : 'text-green-600'}`}>
              ৳{Math.round(Math.max(0, supplier.total_due))}
            </span>
          </div>
          {supplier.total_due > 0 && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => setFormData({ ...formData, amount: String(supplier.total_due), payment_type: 'due_payment' })}
              >
                {t.suppliers?.payFullDueWithValue?.replace('{amount}', String(Math.round(supplier.total_due))) || `${t.suppliers?.payFullDue || 'Pay Full Due'} (৳${Math.round(supplier.total_due)})`}
              </Button>
            </div>
          )}
        </div>

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
            {formData.payment_type === 'advance' && (
              <p className="text-xs text-muted-foreground">
                {t.suppliers?.advancePaymentDesc || 'Prepayment for future orders'}
              </p>
            )}
            {formData.payment_type === 'others' && (
              <p className="text-xs text-muted-foreground">
                {t.suppliers?.othersPaymentDesc || 'Miscellaneous payments (notes required)'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t.labels?.amount || 'Amount'} *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={maxAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
              {isDuePayment && supplier.total_due > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t.suppliers?.maxDue || 'Max'}: ৳{Math.round(supplier.total_due)}
                </p>
              )}
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

        {/* Summary based on payment type */}
          {paymentAmount > 0 && isDuePayment && (
            <div className="p-3 bg-success/10 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.suppliers?.remainingDueAfter || 'Remaining Due After Payment'}:</span>
                <span className={`font-semibold ${remainingDue > 0 ? 'text-destructive' : 'text-success'}`}>
                  ৳{Math.round(Math.max(0, remainingDue))}
                </span>
              </div>
            </div>
          )}

          {paymentAmount > 0 && formData.payment_type === 'advance' && (
            <div className="p-3 bg-info/10 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.suppliers?.advanceAmount || 'Advance Amount'}:</span>
                <span className="font-semibold text-info">
                  ৳{Math.round(paymentAmount)}
                </span>
              </div>
            </div>
          )}

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
              disabled={!formData.amount || paymentAmount <= 0 || isNotesRequired}
            >
              {t.suppliers?.recordPayment || 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
