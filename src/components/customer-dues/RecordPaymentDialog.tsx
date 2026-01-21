import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecordPayment } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { id: string; name: string; total_due: number } | null;
}

export function RecordPaymentDialog({ open, onOpenChange, customer }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const recordPayment = useRecordPayment();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    recordPayment.mutate(
      {
        customer_id: customer.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const handlePayFull = () => {
    if (customer) {
      setAmount(Number(customer.total_due).toString());
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('cash');
    setNotes('');
  };

  if (!customer) return null;

  const maxAmount = Number(customer.total_due);
  const remainingAfterPayment = maxAmount - parseFloat(amount || '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.customerDues.recordPaymentTitle}</DialogTitle>
          <DialogDescription>
            {t.customerDues.recordPaymentFrom} {customer.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.customerDues.outstandingDue}:</span>
              <span className="font-semibold text-destructive">৳{Math.round(maxAmount)}</span>
            </div>
            {maxAmount > 0 && (
              <div className="pt-2 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-8"
                  onClick={handlePayFull}
                >
                  পুরো বকেয়া পরিশোধ (৳{Math.round(maxAmount)})
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t.customerDues.paymentAmount} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.customerDues.enterAmount}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{t.customerDues.paymentMethod}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t.customerDues.cash}</SelectItem>
                <SelectItem value="bkash">{t.customerDues.bkash}</SelectItem>
                <SelectItem value="nagad">{t.customerDues.nagad}</SelectItem>
                <SelectItem value="bank">{t.customerDues.bankTransfer}</SelectItem>
                <SelectItem value="other">{t.customerDues.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.customerDues.notesOptional}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues.additionalNotes}
              rows={2}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg bg-success/10 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.customerDues.remainingDue}:</span>
                <span className={`font-semibold ${remainingAfterPayment > 0 ? 'text-destructive' : 'text-success'}`}>
                  ৳{Math.round(Math.max(0, remainingAfterPayment))}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.actions.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount || recordPayment.isPending}
            >
              {recordPayment.isPending ? t.customerDues.recording : t.customerDues.recordPayment}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
