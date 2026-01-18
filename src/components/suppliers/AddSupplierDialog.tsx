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

interface AddSupplierDialogProps {
  supplier?: Supplier;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddSupplierDialog({ supplier, trigger, onSuccess }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const { addSupplier, updateSupplier } = useSuppliers();
  const { manufacturers, isLoading: loadingManufacturers } = useManufacturers();
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

  // Reset form when supplier prop changes
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update supplier information' : 'Add a new medicine supplier'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer_id">Manufacturer *</Label>
            <Select
              value={formData.manufacturer_id}
              onValueChange={(value) => setFormData({ ...formData, manufacturer_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manufacturer" />
              </SelectTrigger>
              <SelectContent>
                {loadingManufacturers ? (
                  <SelectItem value="" disabled>Loading...</SelectItem>
                ) : manufacturers.length === 0 ? (
                  <SelectItem value="" disabled>No manufacturers found</SelectItem>
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
              Each supplier is linked to one manufacturer
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="WhatsApp number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Contact person name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Supplier address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.manufacturer_id}>
              {isEditing ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
