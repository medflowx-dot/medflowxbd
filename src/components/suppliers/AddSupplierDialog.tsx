import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSuppliers, Supplier } from '@/hooks/useSuppliers';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddSupplierDialogProps {
  supplier?: Supplier;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddSupplierDialog({ supplier, trigger, onSuccess }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const { addSupplier, updateSupplier } = useSuppliers();
  const { manufacturers, isLoading: loadingManufacturers } = useManufacturers();
  const { t } = useLanguage();
  const isEditing = !!supplier;

  const [formData, setFormData] = useState({
    name: supplier?.name ?? '',
    phone: supplier?.phone ?? '',
    whatsapp_number: supplier?.whatsapp_number ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    contact_person: supplier?.contact_person ?? '',
    notes: supplier?.notes ?? '',
    manufacturer_id: supplier?.manufacturer_id ?? '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name ?? '',
        phone: supplier.phone ?? '',
        whatsapp_number: supplier.whatsapp_number ?? '',
        email: supplier.email ?? '',
        address: supplier.address ?? '',
        contact_person: supplier.contact_person ?? '',
        notes: supplier.notes ?? '',
        manufacturer_id: supplier.manufacturer_id ?? '',
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateSupplier({
          id: supplier.id,
          ...formData,
          manufacturer_id: formData.manufacturer_id || null,
        });
      } else {
        await addSupplier({
          ...formData,
          manufacturer_id: formData.manufacturer_id || null,
          is_active: true,
        });
      }
      setOpen(false);
      if (!isEditing) {
        setFormData({
          name: '',
          phone: '',
          whatsapp_number: '',
          email: '',
          address: '',
          contact_person: '',
          notes: '',
          manufacturer_id: '',
        });
      }
      onSuccess?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-auto py-2 px-3 flex flex-col sm:flex-row items-center gap-1">
            <Plus className="h-4 w-4" />
            <span className="text-[10px] sm:text-sm">{t.suppliers.addSupplier}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.suppliers.editSupplier : t.suppliers.addNewSupplier}</DialogTitle>
          <DialogDescription>
            {isEditing ? t.suppliers.updateSupplierInfo : t.suppliers.addMedicineSupplier}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.suppliers.supplierName} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.suppliers.enterSupplierName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer_id">{t.suppliers.manufacturerRequired}</Label>
            <Select
              value={formData.manufacturer_id}
              onValueChange={(value) => setFormData({ ...formData, manufacturer_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t.suppliers.selectManufacturer} />
              </SelectTrigger>
              <SelectContent>
                {loadingManufacturers ? (
                  <div className="py-2 px-3 text-sm text-muted-foreground">{t.messages.loading}</div>
                ) : manufacturers.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-muted-foreground">{t.suppliers.noManufacturersFound}</div>
                ) : (
                  manufacturers.map((mfg) => (
                    <SelectItem key={mfg.id} value={mfg.id}>
                      {mfg.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t.suppliers.eachSupplierLinked}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.labels.phone}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t.suppliers.phoneNumber}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">{t.suppliers.whatsapp}</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder={t.suppliers.whatsappNumber}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.labels.email}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.suppliers.emailAddress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">{t.suppliers.contactPerson}</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder={t.suppliers.contactPersonName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.labels.address}</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t.suppliers.supplierAddress}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.labels.notes}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.suppliers.additionalNotes}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={!formData.manufacturer_id}>
              {isEditing ? t.suppliers.updateSupplier : t.suppliers.addSupplier}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}