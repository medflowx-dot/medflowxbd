import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useManufacturers, Manufacturer } from '@/hooks/useManufacturers';
import { Plus } from 'lucide-react';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  contact_person: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type ManufacturerFormData = z.infer<typeof manufacturerSchema>;

interface AddManufacturerDialogProps {
  manufacturer?: Manufacturer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddManufacturerDialog({ manufacturer, trigger, onSuccess }: AddManufacturerDialogProps) {
  const [open, setOpen] = useState(false);
  const { createManufacturer, updateManufacturer } = useManufacturers();
  const isEditing = !!manufacturer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: manufacturer?.name || '',
      phone: manufacturer?.phone || '',
      email: manufacturer?.email || '',
      address: manufacturer?.address || '',
      contact_person: manufacturer?.contact_person || '',
      notes: manufacturer?.notes || '',
    },
  });

  const onSubmit = async (data: ManufacturerFormData) => {
    const cleanedData = {
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
      contact_person: data.contact_person?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };

    if (isEditing) {
      await updateManufacturer.mutateAsync({ id: manufacturer.id, ...cleanedData });
    } else {
      await createManufacturer.mutateAsync(cleanedData);
    }

    setOpen(false);
    reset();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Manufacturer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Manufacturer' : 'Add Manufacturer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update manufacturer details.' : 'Add a new manufacturer to your contacts.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" {...register('name')} placeholder="e.g., Square Pharmaceuticals" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" {...register('contact_person')} placeholder="e.g., Mr. Rahman" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} placeholder="+8801XXXXXXXXX" />
              <p className="text-xs text-muted-foreground">Used for WhatsApp orders</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="orders@company.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register('address')} placeholder="Company address" rows={2} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Additional notes..." rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add Manufacturer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
