import { useState, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, ShoppingCart, Search, ClipboardList } from 'lucide-react';
import { useSales, type CreateSaleItemData, type SaleUnit } from '@/hooks/useSales';
import { useMedicines, type MedicineWithBatches, type MedicineBatch } from '@/hooks/useMedicines';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const saleSchema = z.object({
  discount: z.coerce.number().min(0).default(0),
  paid_amount: z.coerce.number().min(0),
  payment_method: z.string().default('cash'),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface CartItem extends CreateSaleItemData {
  id: string;
  sale_unit: SaleUnit;
}

interface NewSaleDialogProps {
  trigger?: React.ReactNode;
}

export function NewSaleDialog({ trigger }: NewSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithBatches | null>(null);
  
  const { createSale } = useSales();
  const { medicines } = useMedicines();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      discount: 0,
      paid_amount: 0,
      payment_method: 'cash',
      notes: '',
    },
  });

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const discount = form.watch('discount') || 0;
  const total = subtotal - discount;
  const paidAmount = form.watch('paid_amount') || 0;
  const dueAmount = Math.max(0, total - paidAmount);

  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return [];
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [medicines, searchTerm]);

  const addToCart = (medicine: MedicineWithBatches, batch: MedicineBatch, unit: SaleUnit = 'piece') => {
    const existingIndex = cart.findIndex((item) => item.batch_id === batch.id && item.sale_unit === unit);
    
    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      updatedCart[existingIndex].total_price = 
        updatedCart[existingIndex].quantity * updatedCart[existingIndex].unit_price;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: `${batch.id}-${unit}-${Date.now()}`,
        medicine_id: medicine.id,
        batch_id: batch.id,
        medicine_name: medicine.name,
        batch_number: batch.batch_number,
        quantity: 1,
        unit_price: batch.selling_price,
        total_price: batch.selling_price,
        sale_unit: unit,
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm('');
    setSelectedMedicine(null);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map((item) =>
      item.id === itemId
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const updateUnitPrice = (itemId: string, unitPrice: number) => {
    if (unitPrice < 0) return;
    
    setCart(cart.map((item) =>
      item.id === itemId
        ? { ...item, unit_price: unitPrice, total_price: item.quantity * unitPrice }
        : item
    ));
  };

  const updateSaleUnit = (itemId: string, saleUnit: SaleUnit) => {
    setCart(cart.map((item) =>
      item.id === itemId ? { ...item, sale_unit: saleUnit } : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const onSubmit = async (data: SaleFormData) => {
    if (cart.length === 0) return;

    await createSale.mutateAsync({
      subtotal,
      discount: data.discount,
      total_amount: total,
      paid_amount: data.paid_amount,
      due_amount: dueAmount,
      payment_method: data.payment_method,
      notes: data.notes,
      items: cart.map(({ id, ...item }) => item),
    });

    setOpen(false);
    setCart([]);
    form.reset();
  };

  const getUnitLabel = (unit: SaleUnit) => {
    switch (unit) {
      case 'piece': return 'Pcs';
      case 'strip': return 'Strip';
      case 'box': return 'Box';
      default: return unit;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ClipboardList className="h-4 w-4 mr-2" />
            Detailed Sale
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Detailed Sale Entry
          </DialogTitle>
          <DialogDescription>Add medicines to the cart and complete the sale</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Product Search & Cart */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredMedicines.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {filteredMedicines.map((medicine) => (
                  <div key={medicine.id} className="p-2 hover:bg-muted border-b last:border-b-0">
                    <div className="font-medium text-sm">{medicine.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {medicine.batches.filter((b) => b.quantity > 0).map((batch) => (
                        <Button
                          key={batch.id}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => addToCart(medicine, batch, 'piece')}
                        >
                          {batch.batch_number} (৳{batch.selling_price}) - {batch.quantity} left
                        </Button>
                      ))}
                      {medicine.batches.filter((b) => b.quantity > 0).length === 0 && (
                        <span className="text-xs text-muted-foreground">No stock available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border rounded-md">
              <div className="p-2 bg-muted font-medium text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.length} items)
              </div>
              <ScrollArea className="h-64">
                {cart.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Search and add medicines to cart
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-20">Unit</TableHead>
                        <TableHead className="w-20">Price</TableHead>
                        <TableHead className="w-16">Qty</TableHead>
                        <TableHead className="text-right w-20">Total</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-2">
                            <div className="text-sm font-medium">{item.medicine_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.batch_number}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Select
                              value={item.sale_unit}
                              onValueChange={(value: SaleUnit) => updateSaleUnit(item.id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piece">Pcs</SelectItem>
                                <SelectItem value="strip">Strip</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateUnitPrice(item.id, parseFloat(e.target.value) || 0)}
                              className="h-7 w-16 text-xs"
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="h-7 w-14 text-xs"
                            />
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm">
                            ৳{item.total_price.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Right: Sale Details */}
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm">Discount:</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={subtotal}
                              className="w-24 h-8 text-right"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>৳{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paid_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paid Amount (৳)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={total} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {dueAmount > 0 && (
                  <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-900">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-orange-800 dark:text-orange-200">Unpaid Balance:</span>
                      <Badge variant="destructive" className="text-lg px-3">
                        ৳{dueAmount.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      This amount will be tracked as internal unpaid balance
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={cart.length === 0 || createSale.isPending}>
                    {createSale.isPending ? 'Processing...' : `Complete Sale (৳${total.toFixed(2)})`}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
