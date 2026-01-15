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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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

const medicineSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  generic_name: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  manufacturer_id: z.string().optional(),
  manufacturer: z.string().trim().max(200).optional(),
  unit: z.string().trim().min(1, 'Unit is required'),
  shelf_location: z.string().trim().max(50).optional(),
  min_stock_level: z.coerce.number().min(0).optional(),
  is_tax_applicable: z.boolean().default(false),
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
      min_stock_level: medicine?.min_stock_level || 10,
      is_tax_applicable: medicine?.is_tax_applicable || false,
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
      manufacturer_id: data.manufacturer_id || undefined,
      manufacturer: data.manufacturer || undefined,
      unit: data.unit,
      shelf_location: data.shelf_location || undefined,
      min_stock_level: data.min_stock_level,
      is_tax_applicable: data.is_tax_applicable,
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
            Add Medicine
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update medicine details.' : 'Add a new medicine to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paracetamol 500mg" {...field} />
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
                  <FormLabel>Generic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acetaminophen" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
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
                    Manufacturer
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shelf_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A1-B2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_tax_applicable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tax Applicable</FormLabel>
                    <FormDescription>
                      Check if this medicine is subject to tax
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMedicine.isPending || updateMedicine.isPending}
              >
                {createMedicine.isPending || updateMedicine.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Medicine'
                  : 'Add Medicine'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
