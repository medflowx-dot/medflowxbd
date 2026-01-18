import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Zap } from 'lucide-react';
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
import { FormDatePicker } from '@/components/ui/date-picker';
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
import { useSales } from '@/hooks/useSales';

const quickSaleSchema = z.object({
  sale_date: z.date().default(() => new Date()),
  total_amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  paid_amount: z.coerce.number().min(0),
  payment_method: z.string().default('cash'),
  notes: z.string().optional(),
});

type QuickSaleFormData = z.infer<typeof quickSaleSchema>;

interface QuickSaleDialogProps {
  trigger?: React.ReactNode;
}

export function QuickSaleDialog({ trigger }: QuickSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const { createQuickSale } = useSales();

  const form = useForm<QuickSaleFormData>({
    resolver: zodResolver(quickSaleSchema),
    defaultValues: {
      sale_date: new Date(),
      total_amount: 0,
      paid_amount: 0,
      payment_method: 'cash',
      notes: '',
    },
  });

  const totalAmount = form.watch('total_amount') || 0;
  const paidAmount = form.watch('paid_amount') || 0;

  const onSubmit = async (data: QuickSaleFormData) => {
    await createQuickSale.mutateAsync({
      sale_date: format(data.sale_date, 'yyyy-MM-dd'),
      total_amount: data.total_amount,
      paid_amount: data.paid_amount,
      payment_method: data.payment_method,
      notes: data.notes,
    });

    setOpen(false);
    form.reset({
      sale_date: new Date(),
      total_amount: 0,
      paid_amount: 0,
      payment_method: 'cash',
      notes: '',
    });
  };

  const handleSetFullPayment = () => {
    form.setValue('paid_amount', totalAmount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 sm:h-9">
            <Zap className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Quick Entry</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Sale Entry
          </DialogTitle>
          <DialogDescription>
            Record total daily sales without itemizing medicines
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sale_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <FormDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick a date"
                      disabled={(date) => date > new Date()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Sales Amount (৳)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Enter total sales"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="paid_amount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Received Amount (৳)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Amount received"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetFullPayment}
                className="mb-0.5"
              >
                Full
              </Button>
            </div>

            {paidAmount < totalAmount && totalAmount > 0 && (
              <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-900">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-800 dark:text-orange-200">Unaccounted:</span>
                  <span className="font-bold text-orange-800 dark:text-orange-200">
                    ৳{(totalAmount - paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about today's sales..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createQuickSale.isPending}>
                {createQuickSale.isPending ? 'Saving...' : 'Record Sale'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
