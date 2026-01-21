import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSuppliers, Supplier } from '@/hooks/useSuppliers';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface AddPurchaseDialogProps {
  suppliers: Supplier[];
  defaultSupplierId?: string;
  trigger?: React.ReactNode;
}

export function AddPurchaseDialog({ suppliers, defaultSupplierId, trigger }: AddPurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const { addPurchase } = useSuppliers();
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());

  const [formData, setFormData] = useState({
    supplier_id: defaultSupplierId ?? '',
    invoice_number: '',
    total_amount: '',
    paid_amount: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(formData.total_amount) || 0;
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    
    try {
      await addPurchase({
        supplier_id: formData.supplier_id,
        invoice_number: formData.invoice_number || null,
        purchase_date: purchaseDate ? format(purchaseDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        total_amount: totalAmount,
        paid_amount: paidAmount,
        due_amount: totalAmount - paidAmount,
        notes: formData.notes || null,
      });
      setOpen(false);
      setPurchaseDate(new Date());
      setFormData({
        supplier_id: defaultSupplierId ?? '',
        invoice_number: '',
        total_amount: '',
        paid_amount: '',
        notes: '',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);
  const previousDue = Math.max(0, selectedSupplier?.total_due || 0);
  const currentPurchaseDue = Math.max(0, (parseFloat(formData.total_amount) || 0) - (parseFloat(formData.paid_amount) || 0));
  const totalDueAfter = previousDue + currentPurchaseDue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
          <DialogDescription>
            Record a purchase from a supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier *</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>
          </div>

          {selectedSupplier && previousDue > 0 && (
            <div className="p-3 bg-accent border border-border rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">পূর্বের বকেয়া (Previous Due):</span>
                <span className="font-semibold text-destructive">৳{Math.round(previousDue)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="INV-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <DatePicker
                date={purchaseDate}
                onDateChange={setPurchaseDate}
                placeholder="Select date"
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount *</Label>
              <Input
                id="total_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <Label htmlFor="paid_amount">Paid Amount</Label>
                {(parseFloat(formData.total_amount) || 0) > 0 && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={() => {
                        setFormData({ ...formData, paid_amount: formData.total_amount });
                      }}
                    >
                      শুধু এই পার্চেজ (৳{Math.round(parseFloat(formData.total_amount) || 0)})
                    </Button>
                    {selectedSupplier && previousDue > 0 && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => {
                          const fullDue = (parseFloat(formData.total_amount) || 0) + previousDue;
                          setFormData({ ...formData, paid_amount: String(fullDue) });
                        }}
                      >
                        পুরো বকেয়া (৳{Math.round((parseFloat(formData.total_amount) || 0) + previousDue)})
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <Input
                id="paid_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">এই পার্চেজের বকেয়া (This Purchase Due):</span>
              <span className={`font-semibold ${currentPurchaseDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                ৳{Math.round(currentPurchaseDue)}
              </span>
            </div>
            {selectedSupplier && (
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground font-medium">মোট বকেয়া হবে (Total Due After):</span>
                <span className={`font-bold ${totalDueAfter > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  ৳{Math.round(totalDueAfter)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.supplier_id}>
              Record Purchase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
