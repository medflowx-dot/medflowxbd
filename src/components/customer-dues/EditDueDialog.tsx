import { useState, useEffect } from 'react';
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
import { useUpdateCustomerDue, CustomerDue } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditDueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  due: CustomerDue | null;
}

export function EditDueDialog({ open, onOpenChange, due }: EditDueDialogProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const updateDue = useUpdateCustomerDue();
  const { t } = useLanguage();

  useEffect(() => {
    if (due) {
      setAmount(String(due.amount));
      setNotes(due.notes || '');
    }
  }, [due]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!due) return;

    updateDue.mutate(
      {
        id: due.id,
        amount: parseFloat(amount),
        notes: notes || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  if (!due) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.customerDues?.editDue || 'Edit Due Entry'}</DialogTitle>
          <DialogDescription>
            {t.customerDues?.editDueDesc || 'Update the due amount and notes'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t.customerDues?.amount || 'Amount'} (৳) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.customerDues?.enterAmount || 'Enter amount'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.customerDues?.notesOptional || 'Notes (Optional)'}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues?.whatIsDueFor || 'What is this due for?'}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={!amount || updateDue.isPending}>
              {updateDue.isPending ? (t.manufacturers?.saving || 'Saving...') : (t.customerDues?.updateDue || 'Update Due')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
