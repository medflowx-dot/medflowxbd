import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSetOpeningCash, useOpeningCash } from '@/hooks/useDailyCash';
import { Wallet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SetOpeningCashDialogProps {
  date: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function SetOpeningCashDialog({ 
  date, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  showTrigger = true 
}: SetOpeningCashDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { data: existingCash } = useOpeningCash(date);
  const setOpeningCash = useSetOpeningCash();

  useEffect(() => {
    if (existingCash) {
      setAmount(existingCash.amount.toString());
      setNotes(existingCash.notes || '');
    }
  }, [existingCash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) return;

    setOpeningCash.mutate({
      date: format(date, 'yyyy-MM-dd'),
      amount: parseFloat(amount),
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Wallet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Set Opening</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Opening Cash</DialogTitle>
            <DialogDescription>
              Set the opening cash balance for {format(date, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Opening Amount (৳) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the opening balance..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={setOpeningCash.isPending}>
              {setOpeningCash.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
