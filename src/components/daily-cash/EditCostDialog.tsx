import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { DailyCost, useUpdateDailyCost } from '@/hooks/useDailyCash';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditCostDialogProps {
  cost: DailyCost;
}

export function EditCostDialog({ cost }: EditCostDialogProps) {
  const [open, setOpen] = useState(false);
  const updateCost = useUpdateDailyCost();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    category: cost.category,
    description: cost.description,
    amount: cost.amount.toString(),
    payment_method: cost.payment_method,
    notes: cost.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateCost.mutate({
      id: cost.id,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
    }, {
      onSuccess: () => setOpen(false),
    });
  };

  const categories = [
    { value: 'general', label: t.dailyCash?.general || 'General' },
    { value: 'electricity', label: t.dailyCash?.utilities || 'Electricity' },
    { value: 'rent', label: t.dailyCash?.rent || 'Rent' },
    { value: 'salary', label: t.dailyCash?.salaries || 'Salary' },
    { value: 'transport', label: t.dailyCash?.transport || 'Transport' },
    { value: 'maintenance', label: t.dailyCash?.maintenance || 'Maintenance' },
    { value: 'other', label: t.dailyCash?.other || 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.dailyCash?.editCost || 'Edit Cost'}</DialogTitle>
          <DialogDescription>
            {t.dailyCash?.editCostDesc || 'Update the cost details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.dailyCash?.category || 'Category'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.dailyCash?.method || 'Payment Method'}</Label>
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
                  <SelectItem value="bank">{t.suppliers?.bankTransfer || 'Bank'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.dailyCash?.description || 'Description'} *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.dailyCash?.whatWasExpense || 'What was this cost for?'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t.labels?.amount || 'Amount'} *</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.labels?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.dailyCash?.notesPlaceholder || 'Optional notes'}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.description || !formData.amount || updateCost.isPending}
            >
              {updateCost.isPending ? (t.messages?.loading || 'Saving...') : (t.dailyCash?.updateCost || 'Update Cost')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
