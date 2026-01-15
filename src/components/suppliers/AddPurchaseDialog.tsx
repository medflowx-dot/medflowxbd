import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSuppliers, Supplier } from '@/hooks/useSuppliers';
import { format } from 'date-fns';

interface AddPurchaseDialogProps {
  suppliers: Supplier[];
  defaultSupplierId?: string;
  trigger?: React.ReactNode;
}

export function AddPurchaseDialog({ suppliers, defaultSupplierId, trigger }: AddPurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const { addPurchase } = useSuppliers();

  const [formData, setFormData] = useState({
    supplier_id: defaultSupplierId ?? '',
    invoice_number: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
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
        purchase_date: formData.purchase_date,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        due_amount: totalAmount - paidAmount,
        notes: formData.notes || null,
      });
      setOpen(false);
      setFormData({
        supplier_id: defaultSupplierId ?? '',
        invoice_number: '',
        purchase_date: format(new Date(), 'yyyy-MM-dd'),
        total_amount: '',
        paid_amount: '',
        notes: '',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const dueAmount = (parseFloat(formData.total_amount) || 0) - (parseFloat(formData.paid_amount) || 0);

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
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
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
              <Label htmlFor="paid_amount">Paid Amount</Label>
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

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Amount:</span>
              <span className={`font-semibold ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                ৳{dueAmount.toFixed(2)}
              </span>
            </div>
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
