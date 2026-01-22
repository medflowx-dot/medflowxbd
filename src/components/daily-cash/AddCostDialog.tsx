import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddDailyCost } from '@/hooks/useDailyCash';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AddCostDialogProps {
  date: Date;
}

const COST_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Transport',
  'Maintenance',
  'Supplies',
  'Food',
  'General',
  'Other',
];

export function AddCostDialog({ date }: AddCostDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const addCost = useAddDailyCost();
  const { t } = useLanguage();

  const getCategoryLabel = (cat: string) => {
    const categoryMap: Record<string, string> = {
      Rent: t.dailyCash.rent,
      Utilities: t.dailyCash.utilities,
      Salaries: t.dailyCash.salaries,
      Transport: t.dailyCash.transport,
      Maintenance: t.dailyCash.maintenance,
      Supplies: t.dailyCash.supplies,
      Food: t.dailyCash.food,
      General: t.dailyCash.general,
      Other: t.dailyCash.other,
    };
    return categoryMap[cat] || cat;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount) return;

    addCost.mutate({
      cost_date: format(date, 'yyyy-MM-dd'),
      category,
      description,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setCategory('General');
    setDescription('');
    setAmount('');
    setPaymentMethod('cash');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 sm:flex-none">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t.dailyCash.addCost}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.dailyCash.addDailyCost}</DialogTitle>
            <DialogDescription>
              {t.dailyCash.recordExpense} {format(date, 'dd MMMM yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">{t.dailyCash.categoryLabel}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t.dailyCash.descriptionLabel} *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.dailyCash.whatWasExpense}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">{t.dailyCash.amountLabel} *</Label>
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
              <Label htmlFor="payment-method">{t.dailyCash.paymentMethod}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.dailyCash.cash}</SelectItem>
                  <SelectItem value="bkash">{t.dailyCash.bkash}</SelectItem>
                  <SelectItem value="nagad">{t.dailyCash.nagad}</SelectItem>
                  <SelectItem value="bank">{t.dailyCash.bankTransfer}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{t.customerDues.notes}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.dailyCash.additionalNotes}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={addCost.isPending}>
              {addCost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.dailyCash.addCost}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
