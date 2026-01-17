import { useState } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMedicines, type CreateBatchData, type MedicineBatch } from '@/hooks/useMedicines';

const batchSchema = z.object({
  batch_number: z.string().trim().min(1, 'Batch number is required').max(50, 'Batch number must be less than 50 characters'),
  purchase_price: z.coerce.number().min(0, 'Purchase price must be 0 or more'),
  selling_price: z.coerce.number().min(0, 'Selling price must be 0 or more'),
  expiry_date: z.date({ required_error: 'Expiry date is required' }),
  manufactured_date: z.date().optional(),
  supplier_name: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface AddBatchDialogProps {
  medicineId: string;
  medicineName: string;
  batch?: MedicineBatch;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddBatchDialog({ 
  medicineId, 
  medicineName, 
  batch, 
  trigger, 
  onSuccess 
}: AddBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const { createBatch, updateBatch } = useMedicines();
  const isEditing = !!batch;

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch_number: batch?.batch_number || '',
      purchase_price: batch?.purchase_price || 0,
      selling_price: batch?.selling_price || 0,
      expiry_date: batch?.expiry_date ? new Date(batch.expiry_date) : undefined,
      manufactured_date: batch?.manufactured_date ? new Date(batch.manufactured_date) : undefined,
      supplier_name: batch?.supplier_name || '',
      notes: batch?.notes || '',
    },
  });

  const onSubmit = async (data: BatchFormData) => {
    const cleanData: CreateBatchData = {
      medicine_id: medicineId,
      batch_number: data.batch_number,
      purchase_price: data.purchase_price,
      selling_price: data.selling_price,
      expiry_date: format(data.expiry_date, 'yyyy-MM-dd'),
      manufactured_date: data.manufactured_date ? format(data.manufactured_date, 'yyyy-MM-dd') : undefined,
      supplier_name: data.supplier_name || undefined,
      notes: data.notes || undefined,
    };

    if (isEditing) {
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
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Batch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update batch for ${medicineName}` : `Add a new batch for ${medicineName}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="batch_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BT-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (৳) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (৳) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufactured_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Manufactured Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Distributors" {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBatch.isPending || updateBatch.isPending}
              >
                {createBatch.isPending || updateBatch.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Batch'
                  : 'Add Batch'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
