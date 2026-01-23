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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

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
        <Button variant="outline" size="sm" className="h-auto py-2 px-3 flex flex-col sm:flex-row items-center gap-1">
          <Zap className="h-4 w-4" />
          <span className="text-[10px] sm:text-sm">{t.sales.quickEntry}</span>
        </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t.sales.quickSaleEntry}
          </DialogTitle>
          <DialogDescription>
            {t.sales.quickSaleDesc}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sale_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.sales.date}</FormLabel>
                  <FormControl>
                    <FormDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t.sales.pickDate}
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
                  <FormLabel>{t.sales.totalSalesAmount}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder={t.sales.enterTotalSales}
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
                    <FormLabel>{t.sales.receivedAmount}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={t.sales.amountReceived}
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
                {t.sales.full}
              </Button>
            </div>

            {paidAmount < totalAmount && totalAmount > 0 && (
              <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-900">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-800 dark:text-orange-200">{t.sales.unaccounted}:</span>
                  <span className="font-bold text-orange-800 dark:text-orange-200">
                    ৳{Math.round(totalAmount - paidAmount)}
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.sales.paymentMethod}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">{t.sales.cash}</SelectItem>
                      <SelectItem value="bkash">{t.sales.bkash}</SelectItem>
                      <SelectItem value="nagad">{t.sales.nagad}</SelectItem>
                      <SelectItem value="card">{t.sales.card}</SelectItem>
                      <SelectItem value="mixed">{t.sales.mixed}</SelectItem>
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
                  <FormLabel>{t.sales.notesOptional}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.sales.notesPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.actions.cancel}
              </Button>
              <Button type="submit" disabled={createQuickSale.isPending}>
                {createQuickSale.isPending ? t.sales.saving : t.sales.recordSale}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}