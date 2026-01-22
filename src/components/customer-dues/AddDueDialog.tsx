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
import { useLanguage } from '@/contexts/LanguageContext';

interface AddDueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { id: string; name: string; total_due: number } | null;
}

export function AddDueDialog({ open, onOpenChange, customer }: AddDueDialogProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const addDue = useAddCustomerDue();
  const { t } = useLanguage();

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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.customerDues.addDueAmount}</DialogTitle>
          <DialogDescription>
            {t.customerDues.addDueFor} {customer.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Previous Due Info */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.customerDues.currentDue}:</span>
              <span className={`font-semibold ${Number(customer.total_due) > 0 ? 'text-destructive' : 'text-success'}`}>
                ৳{Math.round(Math.max(0, Number(customer.total_due)))}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t.customerDues.amountToAdd} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.customerDues.enterAmount}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.customerDues.notesOptional}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues.whatIsDueFor}
              rows={2}
            />
          </div>

          {/* Total Due Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.customerDues.thisDue}:</span>
              <span className="font-semibold text-destructive">
                ৳{Math.round(parseFloat(amount) || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground font-medium">{t.customerDues.newTotalDue}:</span>
              <span className="font-bold text-destructive">
                ৳{Math.round(Number(customer.total_due) + (parseFloat(amount) || 0))}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={!amount || addDue.isPending}>
              {addDue.isPending ? t.customerDues.addingDue : t.customerDues.addDue}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
