import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormDatePicker } from '@/components/ui/date-picker';
import { Plus, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMedicines, type CreateBatchData, type MedicineBatch, type MedicineWithBatches } from '@/hooks/useMedicines';
import { useLanguage } from '@/contexts/LanguageContext';

const batchSchema = z.object({
  medicine_id: z.string().min(1, 'Please select a medicine'),
  batch_number: z.string().trim().min(1, 'Batch number is required').max(50, 'Batch number must be less than 50 characters'),
  expiry_date: z.date({ required_error: 'Expiry date is required' }),
  manufactured_date: z.date().optional(),
  supplier_name: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface AddBatchDialogProps {
  medicines: MedicineWithBatches[];
  batch?: MedicineBatch;
  defaultMedicineId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddBatchDialog({ 
  medicines,
  batch, 
  defaultMedicineId,
  trigger, 
  onSuccess 
}: AddBatchDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [medicineOpen, setMedicineOpen] = useState(false);
  const { createBatch, updateBatch } = useMedicines();
  const isEditing = !!batch;

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      medicine_id: defaultMedicineId || batch?.medicine_id || '',
      batch_number: batch?.batch_number || '',
      expiry_date: batch?.expiry_date ? new Date(batch.expiry_date) : undefined,
      manufactured_date: batch?.manufactured_date ? new Date(batch.manufactured_date) : undefined,
      supplier_name: batch?.supplier_name || '',
      notes: batch?.notes || '',
    },
  });

  const selectedMedicineId = form.watch('medicine_id');
  const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        medicine_id: defaultMedicineId || batch?.medicine_id || '',
        batch_number: batch?.batch_number || '',
        expiry_date: batch?.expiry_date ? new Date(batch.expiry_date) : undefined,
        manufactured_date: batch?.manufactured_date ? new Date(batch.manufactured_date) : undefined,
        supplier_name: batch?.supplier_name || '',
        notes: batch?.notes || '',
      });
    }
  }, [open, batch, defaultMedicineId, form]);

  const onSubmit = async (data: BatchFormData) => {
    const cleanData: CreateBatchData = {
      medicine_id: data.medicine_id,
      batch_number: data.batch_number,
      expiry_date: format(data.expiry_date, 'yyyy-MM-dd'),
      manufactured_date: data.manufactured_date ? format(data.manufactured_date, 'yyyy-MM-dd') : undefined,
      supplier_name: data.supplier_name || undefined,
      notes: data.notes || undefined,
    };

    if (isEditing && batch) {
      await updateBatch.mutateAsync({ id: batch.id, ...cleanData });
    } else {
      await createBatch.mutateAsync(cleanData);
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
            {t.batches.addBatch}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t.batches.editBatch : t.batches.addNewBatch}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? t.batches.updateBatchInfo
              : t.batches.selectMedicineAndAdd}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Medicine Selector */}
            <FormField
              control={form.control}
              name="medicine_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.batches.medicineLabel}</FormLabel>
                  <Popover open={medicineOpen} onOpenChange={setMedicineOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={medicineOpen}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isEditing}
                        >
                          {selectedMedicine?.name || t.batches.selectMedicine}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t.batches.searchMedicines} />
                        <CommandList>
                          <CommandEmpty>{t.batches.noMedicineFound}</CommandEmpty>
                          <CommandGroup>
                            {medicines.map((medicine) => (
                              <CommandItem
                                key={medicine.id}
                                value={medicine.name}
                                onSelect={() => {
                                  form.setValue('medicine_id', medicine.id);
                                  setMedicineOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === medicine.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{medicine.name}</span>
                                  {medicine.generic_name && (
                                    <span className="text-xs text-muted-foreground">
                                      {medicine.generic_name}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batch_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.batches.batchNumber}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.batches.batchNumberPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.batches.expiryDateLabel}</FormLabel>
                    <FormControl>
                      <FormDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t.batches.pickDate}
                        disabled={(date) => date < new Date('1900-01-01')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufactured_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.batches.manufacturedDate}</FormLabel>
                    <FormControl>
                      <FormDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t.batches.pickDate}
                        disabled={(date) => date > new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.batches.supplierName}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.batches.supplierPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.batches.notes}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.batches.notesPlaceholder} {...field} />
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
                disabled={createBatch.isPending || updateBatch.isPending}
              >
                {createBatch.isPending || updateBatch.isPending
                  ? t.batches.saving
                  : isEditing
                  ? t.batches.updateBatch
                  : t.batches.addBatch}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
