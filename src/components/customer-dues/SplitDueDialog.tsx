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
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { CustomerDue, useDeleteCustomerDue } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SplitEntry {
  id: string;
  amount: string;
  date: Date;
  notes: string;
}

interface SplitDueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  due: CustomerDue | null;
  customerId: string;
}

export function SplitDueDialog({ open, onOpenChange, due, customerId }: SplitDueDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deleteDue = useDeleteCustomerDue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [entries, setEntries] = useState<SplitEntry[]>([
    { id: '1', amount: '', date: new Date(), notes: '' },
    { id: '2', amount: '', date: new Date(), notes: '' },
  ]);

  const originalAmount = due?.amount || 0;
  const totalSplit = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const remaining = originalAmount - totalSplit;

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now().toString(), amount: '', date: new Date(), notes: '' },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof SplitEntry, value: string | Date) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!due || !user) return;

    // Validate all entries have amounts
    const validEntries = entries.filter(e => parseFloat(e.amount) > 0);
    if (validEntries.length < 2) {
      toast({
        title: t.customerDues?.splitError || 'Error',
        description: t.customerDues?.atLeastTwoEntries || 'At least 2 entries with amounts are required',
        variant: 'destructive',
      });
      return;
    }

    // Validate total matches
    if (Math.abs(remaining) > 0.01) {
      toast({
        title: t.customerDues?.splitError || 'Error',
        description: t.customerDues?.totalMustMatch || 'Total of split entries must equal original amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert new dues
      const duesData = validEntries.map(entry => ({
        user_id: user.id,
        customer_id: customerId,
        amount: parseFloat(entry.amount),
        due_date: entry.date.toISOString(),
        notes: entry.notes || null,
      }));

      const { error: insertError } = await supabase
        .from('customer_dues')
        .insert(duesData);

      if (insertError) throw insertError;

      // Delete original due
      const { error: deleteError } = await supabase
        .from('customer_dues')
        .delete()
        .eq('id', due.id);

      if (deleteError) throw deleteError;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });

      toast({
        title: t.customerDues?.splitSuccess || 'Due Split Successfully',
        description: t.customerDues?.splitSuccessDesc || 'The due has been split into multiple entries',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Split due error:', error);
      toast({
        title: t.customerDues?.splitError || 'Error',
        description: t.customerDues?.splitErrorDesc || 'Failed to split due. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEntries([
      { id: '1', amount: '', date: new Date(), notes: '' },
      { id: '2', amount: '', date: new Date(), notes: '' },
    ]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!due) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.customerDues?.splitDue || 'Split Due Entry'}</DialogTitle>
          <DialogDescription>
            {t.customerDues?.splitDueDesc || 'Divide this due into multiple separate entries with custom dates'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original Amount Info */}
          <div className="rounded-lg bg-warning/10 p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.customerDues?.originalAmount || 'Original Amount'}:</span>
              <span className="font-bold text-warning">৳{Math.round(originalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.customerDues?.splitTotal || 'Split Total'}:</span>
              <span className="font-semibold">৳{Math.round(totalSplit)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-warning/20 pt-1">
              <span className="text-muted-foreground">{t.customerDues?.remaining || 'Remaining'}:</span>
              <span className={`font-bold ${Math.abs(remaining) < 0.01 ? 'text-success' : 'text-destructive'}`}>
                ৳{Math.round(remaining)}
              </span>
            </div>
          </div>

          {/* Split Entries */}
          <ScrollArea className="max-h-[300px] pr-2">
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={entry.id} className="rounded-lg border p-3 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t.customerDues?.entry || 'Entry'} {index + 1}
                    </span>
                    {entries.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.customerDues?.amount || 'Amount'} (৳)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={entry.amount}
                        onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.reports?.date || 'Date'}</Label>
                      <DatePicker
                        date={entry.date}
                        onDateChange={(date) => date && updateEntry(entry.id, 'date', date)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">{t.customerDues?.notes || 'Notes'}</Label>
                    <Textarea
                      value={entry.notes}
                      onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                      placeholder={t.customerDues?.whatIsDueFor || 'What is this due for?'}
                      rows={1}
                      className="min-h-[36px] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Add Entry Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addEntry}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.customerDues?.addAnotherEntry || 'Add Another Entry'}
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || Math.abs(remaining) > 0.01}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.customerDues?.splitDueBtn || 'Split Due'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
