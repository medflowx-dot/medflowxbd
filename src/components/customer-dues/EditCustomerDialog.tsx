import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { Customer, useUpdateCustomer } from '@/hooks/useCustomerDues';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditCustomerDialogProps {
  customer: Customer;
  trigger?: React.ReactNode;
}

export function EditCustomerDialog({ customer, trigger }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const updateCustomer = useUpdateCustomer();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone || '',
    address: customer.address || '',
    notes: customer.notes || '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateCustomer.mutate({
      id: customer.id,
      name: formData.name,
      phone: formData.phone || null,
      address: formData.address || null,
      notes: formData.notes || null,
    }, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.customerDues?.editCustomer || 'Edit Customer'}</DialogTitle>
          <DialogDescription>
            {t.customerDues?.editCustomerDesc || 'Update customer information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.customerDues?.customerName || 'Customer Name'} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.customerDues?.enterCustomerName || 'Enter customer name'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.customerDues?.phoneNumber || 'Phone Number'}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t.customerDues?.phonePlaceholder || 'e.g., 01XXXXXXXXX'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.customerDues?.address || 'Address'}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t.customerDues?.customerAddress || 'Customer address'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.customerDues?.notes || 'Notes'}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.customerDues?.additionalNotes || 'Any additional notes...'}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={!formData.name || updateCustomer.isPending}>
              {updateCustomer.isPending ? (t.messages?.loading || 'Saving...') : (t.customerDues?.updateCustomer || 'Update Customer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
