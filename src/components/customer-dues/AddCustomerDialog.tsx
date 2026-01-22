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
import { useAddCustomer } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialDue, setInitialDue] = useState('');
  const [notes, setNotes] = useState('');

  const addCustomer = useAddCustomer();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addCustomer.mutate(
      {
        name,
        phone: phone || undefined,
        address: address || undefined,
        notes: notes || undefined,
        initial_due: initialDue ? parseFloat(initialDue) : undefined,
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
    setName('');
    setPhone('');
    setAddress('');
    setInitialDue('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t.customerDues.addNewCustomer}</DialogTitle>
          <DialogDescription>
            {t.customerDues.addCustomerDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.customerDues.customerName} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.customerDues.enterCustomerName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.customerDues.phoneNumber}</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.customerDues.phonePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.customerDues.address}</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.customerDues.customerAddress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialDue">{t.customerDues.initialDueAmount}</Label>
            <Input
              id="initialDue"
              type="number"
              step="0.01"
              min="0"
              value={initialDue}
              onChange={(e) => setInitialDue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.customerDues.notes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues.additionalNotes}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={!name || addCustomer.isPending}>
              {addCustomer.isPending ? t.customerDues.adding : t.customerDues.addCustomer}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
