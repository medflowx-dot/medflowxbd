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
import { useAddCustomerDue } from '@/hooks/useCustomerDues';

interface AddDueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { id: string; name: string; total_due: number } | null;
}

export function AddDueDialog({ open, onOpenChange, customer }: AddDueDialogProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const addDue = useAddCustomerDue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    addDue.mutate(
      {
        customer_id: customer.id,
        amount: parseFloat(amount),
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

  const resetForm = () => {
    setAmount('');
    setNotes('');
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Due Amount</DialogTitle>
          <DialogDescription>
            Add a new due amount for {customer.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Current Due</p>
            <p className="text-xl font-bold">৳{Number(customer.total_due).toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add (৳) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What is this due for?"
              rows={2}
            />
          </div>

          {amount && (
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-sm text-muted-foreground">New Total Due</p>
              <p className="text-xl font-bold text-primary">
                ৳{(Number(customer.total_due) + parseFloat(amount || '0')).toFixed(2)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || addDue.isPending}>
              {addDue.isPending ? 'Adding...' : 'Add Due'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
