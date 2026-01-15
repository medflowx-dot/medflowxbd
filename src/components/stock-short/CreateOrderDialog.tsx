import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, Phone } from 'lucide-react';
import { MedicineWithBatches } from '@/hooks/useMedicines';
import { useStockOrders } from '@/hooks/useStockOrders';
import { useManufacturers } from '@/hooks/useManufacturers';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicines: MedicineWithBatches[];
}

interface OrderItem {
  medicine: MedicineWithBatches;
  quantity_to_order: number;
}

export function CreateOrderDialog({ open, onOpenChange, medicines }: CreateOrderDialogProps) {
  const { createOrder } = useStockOrders();
  const { manufacturers: manufacturerList } = useManufacturers();
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>(() =>
    medicines.map((m) => ({
      medicine: m,
      quantity_to_order: Math.max((m.min_stock_level || 10) * 2 - m.total_stock, 10),
    }))
  );

  // Group by manufacturer - use manufacturer_id to get the actual manufacturer info
  const manufacturerGroups = useMemo(() => {
    const groups: Record<string, { name: string; phone: string | null; items: OrderItem[] }> = {};
    
    items.forEach((item) => {
      const manufacturerName = item.medicine.manufacturer || 'Unknown';
      const manufacturerId = item.medicine.manufacturer_id;
      
      // Try to find manufacturer details from the manufacturers list
      const manufacturerInfo = manufacturerId 
        ? manufacturerList.find(m => m.id === manufacturerId)
        : manufacturerList.find(m => m.name.toLowerCase() === manufacturerName.toLowerCase());
      
      if (!groups[manufacturerName]) {
        groups[manufacturerName] = {
          name: manufacturerName,
          phone: manufacturerInfo?.phone || null,
          items: [],
        };
      }
      groups[manufacturerName].items.push(item);
    });
    
    return groups;
  }, [items, manufacturerList]);

  const manufacturers = Object.keys(manufacturerGroups);

  const updateQuantity = (medicineId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId
          ? { ...item, quantity_to_order: Math.max(0, quantity) }
          : item
      )
    );
  };

  const removeItem = (medicineId: string) => {
    setItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;

    // Create separate orders for each manufacturer
    for (const manufacturer of manufacturers) {
      const group = manufacturerGroups[manufacturer];
      if (!group || group.items.length === 0) continue;

      await createOrder.mutateAsync({
        manufacturer,
        manufacturer_phone: group.phone || undefined,
        notes: notes || undefined,
        items: group.items.map((item) => ({
          medicine_id: item.medicine.id,
          medicine_name: item.medicine.name,
          current_stock: item.medicine.total_stock,
          min_stock_level: item.medicine.min_stock_level || 10,
          quantity_to_order: item.quantity_to_order,
          unit: item.medicine.unit,
        })),
      });
    }

    onOpenChange(false);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Order Notes</DialogTitle>
          <DialogDescription>
            Orders will be grouped by manufacturer. Review quantities before creating.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {manufacturers.map((manufacturer) => {
              const group = manufacturerGroups[manufacturer];
              if (!group || group.items.length === 0) return null;

              return (
                <div key={manufacturer} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{manufacturer}</h4>
                    {group.phone && (
                      <Badge variant="outline" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        {group.phone}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item.medicine.id}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.medicine.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Current: {item.medicine.total_stock} {item.medicine.unit} | Min:{' '}
                            {item.medicine.min_stock_level}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Order:</Label>
                          <Input
                            type="number"
                            min={0}
                            value={item.quantity_to_order}
                            onChange={(e) =>
                              updateQuantity(item.medicine.id, parseInt(e.target.value) || 0)
                            }
                            className="w-20 h-8"
                          />
                          <span className="text-xs text-muted-foreground">{item.medicine.unit}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.medicine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Add any notes for this order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={items.length === 0 || createOrder.isPending}
          >
            {createOrder.isPending ? 'Creating...' : `Create ${manufacturers.length} Order(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
