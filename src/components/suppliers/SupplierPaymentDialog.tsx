import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { useSuppliers, Supplier } from '@/hooks/useSuppliers';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface SupplierPaymentDialogProps {
  supplier: Supplier;
  trigger?: React.ReactNode;
}

export function SupplierPaymentDialog({ supplier, trigger }: SupplierPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { addPayment } = useSuppliers();
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
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
        reference_number: formData.reference_number || null,
        notes: formData.notes || null,
      });
      setOpen(false);
      setPaymentDate(new Date());
      setFormData({
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: '',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const paymentAmount = parseFloat(formData.amount) || 0;
  const remainingDue = supplier.total_due - paymentAmount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment to Supplier</DialogTitle>
          <DialogDescription>
            Record a payment to {supplier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted rounded-lg mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Due:</span>
            <span className="font-semibold text-destructive">৳{supplier.total_due.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={supplier.total_due}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={paymentDate}
                onDateChange={setPaymentDate}
                placeholder="Select date"
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference #</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="TXN-123"
              />
            </div>
          </div>

          {paymentAmount > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining Due After Payment:</span>
                <span className={`font-semibold ${remainingDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  ৳{remainingDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.amount || paymentAmount <= 0}>
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
