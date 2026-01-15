import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PackageCheck } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { StockOrder, StockOrderItem } from '@/hooks/useStockOrders';
import { useMedicines } from '@/hooks/useMedicines';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface ReceiveOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: StockOrder;
}

interface BatchInput {
  item: StockOrderItem;
  batch_number: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: Date;
  include: boolean;
}

export function ReceiveOrderDialog({ open, onOpenChange, order }: ReceiveOrderDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultExpiryDate = addMonths(new Date(), 12);
  
  const [batches, setBatches] = useState<BatchInput[]>(() =>
    (order.items || []).map((item) => ({
      item,
      batch_number: `B${Date.now().toString().slice(-6)}`,
      quantity: item.quantity_to_order,
      purchase_price: 0,
      selling_price: 0,
      expiry_date: defaultExpiryDate,
      include: true,
    }))
  );

  const updateBatch = (index: number, field: keyof BatchInput, value: unknown) => {
    setBatches((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    const includedBatches = batches.filter((b) => b.include);
    
    if (includedBatches.length === 0) {
      toast({ title: 'No items selected', variant: 'destructive' });
      return;
    }

    // Validate all batches
    for (const batch of includedBatches) {
      if (!batch.batch_number.trim()) {
        toast({ title: 'Batch number is required', variant: 'destructive' });
        return;
      }
      if (batch.quantity <= 0) {
        toast({ title: 'Quantity must be greater than 0', variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create medicine batches
      const batchInserts = includedBatches.map((batch) => ({
        medicine_id: batch.item.medicine_id,
        user_id: user.id,
        batch_number: batch.batch_number.trim(),
        quantity: batch.quantity,
        purchase_price: batch.purchase_price,
        selling_price: batch.selling_price,
        expiry_date: format(batch.expiry_date, 'yyyy-MM-dd'),
        supplier_name: order.manufacturer,
        notes: `From stock order received on ${format(new Date(), 'PP')}`,
      }));

      const { error: batchError } = await supabase
        .from('medicine_batches')
        .insert(batchInserts);

      if (batchError) throw batchError;

      // Update order status to received
      const { error: orderError } = await supabase
        .from('stock_orders')
        .update({
          status: 'received',
          received_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });

      toast({
        title: 'Order received successfully',
        description: `${includedBatches.length} batch(es) added to inventory`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to receive order',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            Receive Order - {order.manufacturer}
          </DialogTitle>
          <DialogDescription>
            Enter batch details for each item. Stock will be added to inventory.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4 pr-4">
            {batches.map((batch, index) => (
              <div
                key={batch.item.id}
                className={cn(
                  'border rounded-lg p-4 space-y-3',
                  !batch.include && 'opacity-50 bg-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={batch.include}
                      onChange={(e) => updateBatch(index, 'include', e.target.checked)}
                      className="rounded border-input"
                    />
                    <div>
                      <p className="font-medium">{batch.item.medicine_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: {batch.item.quantity_to_order} {batch.item.unit}
                      </p>
                    </div>
                  </div>
                </div>

                {batch.include && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Batch Number *</Label>
                      <Input
                        value={batch.batch_number}
                        onChange={(e) => updateBatch(index, 'batch_number', e.target.value)}
                        placeholder="e.g., B123456"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Quantity Received *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={batch.quantity}
                        onChange={(e) =>
                          updateBatch(index, 'quantity', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Expiry Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(batch.expiry_date, 'PP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={batch.expiry_date}
                            onSelect={(date) =>
                              date && updateBatch(index, 'expiry_date', date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Purchase Price (৳)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={batch.purchase_price}
                        onChange={(e) =>
                          updateBatch(index, 'purchase_price', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Selling Price (৳)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={batch.selling_price}
                        onChange={(e) =>
                          updateBatch(index, 'selling_price', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <PackageCheck className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Processing...' : 'Receive & Update Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
