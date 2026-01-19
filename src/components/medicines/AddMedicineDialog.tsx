import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Building2 } from 'lucide-react';
import { useMedicines, type CreateMedicineData, type Medicine } from '@/hooks/useMedicines';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useLanguage } from '@/contexts/LanguageContext';

const medicineSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  generic_name: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  manufacturer_id: z.string().optional(),
  manufacturer: z.string().trim().max(200).optional(),
  unit: z.string().trim().min(1, 'Unit is required'),
  shelf_location: z.string().trim().max(50).optional(),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

const CATEGORIES = [
  'Tablets',
  'Capsules',
  'Syrup',
  'Injection',
  'Cream/Ointment',
  'Drops',
  'Inhaler',
  'Powder',
  'Suppository',
  'Other',
];

const UNITS = ['pcs', 'strip', 'box', 'bottle', 'tube', 'vial', 'ampule', 'sachet'];

interface AddMedicineDialogProps {
  medicine?: Medicine;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddMedicineDialog({ medicine, trigger, onSuccess }: AddMedicineDialogProps) {
  const [open, setOpen] = useState(false);
  const { createMedicine, updateMedicine } = useMedicines();
  const { manufacturers } = useManufacturers();
  const { t } = useLanguage();
  const isEditing = !!medicine;

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: medicine?.name || '',
      generic_name: medicine?.generic_name || '',
      category: medicine?.category || '',
      manufacturer_id: medicine?.manufacturer_id || '',
      manufacturer: medicine?.manufacturer || '',
      unit: medicine?.unit || 'pcs',
      shelf_location: medicine?.shelf_location || '',
    },
  });

  // When manufacturer_id changes, update the manufacturer name
  const watchManufacturerId = form.watch('manufacturer_id');
  useEffect(() => {
    if (watchManufacturerId) {
      const selectedManufacturer = manufacturers.find(m => m.id === watchManufacturerId);
      if (selectedManufacturer) {
        form.setValue('manufacturer', selectedManufacturer.name);
      }
    }
  }, [watchManufacturerId, manufacturers, form]);

  const onSubmit = async (data: MedicineFormData) => {
    const cleanData: CreateMedicineData = {
      name: data.name,
      generic_name: data.generic_name || undefined,
      category: data.category || undefined,
      manufacturer_id: data.manufacturer_id === 'none' ? undefined : data.manufacturer_id || undefined,
      manufacturer: data.manufacturer || undefined,
      unit: data.unit,
      shelf_location: data.shelf_location || undefined,
    };

    if (isEditing) {
      await updateMedicine.mutateAsync({ id: medicine.id, ...cleanData });
    } else {
      await createMedicine.mutateAsync(cleanData);
    }

    setOpen(false);
    form.reset();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t.medicines.addMedicine}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.medicines.editMedicine : t.medicines.addNewMedicine}</DialogTitle>
          <DialogDescription>
            {isEditing ? t.medicines.editMedicineDesc : t.medicines.addMedicineDesc}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.medicines.medicineNameLabel} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t.medicines.medicineNamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generic_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.medicines.genericNameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.medicines.genericNamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.medicines.categoryLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.medicines.selectCategory} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.medicines.unitLabel} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.medicines.selectUnit} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {t.medicines.manufacturerLabel}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.medicines.selectManufacturer} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t.medicines.none}</SelectItem>
                      {manufacturers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelf_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.medicines.shelfLocation}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.medicines.shelfPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.actions.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createMedicine.isPending || updateMedicine.isPending}
              >
                {createMedicine.isPending || updateMedicine.isPending
                  ? t.medicines.savingBtn
                  : isEditing
                  ? t.medicines.updateMedicine
                  : t.medicines.addMedicine}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
