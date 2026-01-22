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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useManufacturers, Manufacturer } from '@/hooks/useManufacturers';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

type ManufacturerFormData = z.infer<typeof manufacturerSchema>;

interface AddManufacturerDialogProps {
  manufacturer?: Manufacturer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddManufacturerDialog({ manufacturer, trigger, onSuccess }: AddManufacturerDialogProps) {
  const { t } = useLanguage();
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
    },
  });

  const onSubmit = async (data: ManufacturerFormData) => {
    const cleanedData = {
      name: data.name.trim(),
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
            {t.manufacturers.addManufacturer}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.manufacturers.editManufacturer : t.manufacturers.addManufacturer}</DialogTitle>
          <DialogDescription>
            {isEditing ? t.manufacturers.updateManufacturerDesc : t.manufacturers.addNewManufacturer}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.manufacturers.companyNameLabel}</Label>
            <Input id="name" {...register('name')} placeholder={t.manufacturers.companyNamePlaceholder} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.manufacturers.saving : isEditing ? t.manufacturers.updateBtn : t.manufacturers.addBtn}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
