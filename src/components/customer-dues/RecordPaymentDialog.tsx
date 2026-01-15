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
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment from {customer.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-muted-foreground">Outstanding Due</p>
            <p className="text-xl font-bold text-destructive">৳{maxAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Payment Amount (৳) *</Label>
              <Button type="button" variant="link" size="sm" onClick={handlePayFull}>
                Pay Full Amount
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
              <p className="text-sm text-muted-foreground">Remaining Due After Payment</p>
              <p className="text-xl font-bold text-green-600">
                ৳{Math.max(0, remainingAfterPayment).toFixed(2)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount || recordPayment.isPending}
            >
              {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
