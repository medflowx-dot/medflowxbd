import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useMedicines, MedicineWithBatches } from '@/hooks/useMedicines';

interface LowStockListProps {
  onCreateOrder: (medicines: MedicineWithBatches[]) => void;
}

export function LowStockList({ onCreateOrder }: LowStockListProps) {
  const { medicines, isLoading } = useMedicines();
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);

  const lowStockMedicines = medicines.filter(
    (m) => m.min_stock_level && m.total_stock <= m.min_stock_level
  );

  const toggleMedicine = (id: string) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedMedicines.length === lowStockMedicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines(lowStockMedicines.map((m) => m.id));
    }
  };

  const handleCreateOrder = () => {
    const selected = lowStockMedicines.filter((m) => selectedMedicines.includes(m.id));
    onCreateOrder(selected);
    setSelectedMedicines([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading low stock items...
        </CardContent>
      </Card>
    );
  }

  if (lowStockMedicines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Low Stock Items
          </CardTitle>
          <CardDescription>Medicines below minimum stock level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-3">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium">All stock levels are adequate</h3>
            <p className="text-muted-foreground text-sm mt-1">
              No medicines are currently below their minimum stock level.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Items
              <Badge variant="secondary">{lowStockMedicines.length}</Badge>
            </CardTitle>
            <CardDescription>Select items to create an order note</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedMedicines.length === lowStockMedicines.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              size="sm"
              onClick={handleCreateOrder}
              disabled={selectedMedicines.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Order ({selectedMedicines.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {lowStockMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedMedicines.includes(medicine.id)
                    ? 'bg-primary/5 border-primary/30'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleMedicine(medicine.id)}
              >
                <Checkbox
                  checked={selectedMedicines.includes(medicine.id)}
                  onCheckedChange={() => toggleMedicine(medicine.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{medicine.name}</span>
                    {medicine.manufacturer && (
                      <Badge variant="outline" className="text-xs">
                        {medicine.manufacturer}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {medicine.generic_name || 'No generic name'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        medicine.total_stock === 0 ? 'text-destructive' : 'text-amber-600'
                      }`}
                    >
                      {medicine.total_stock}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{medicine.min_stock_level}</span>
                    <span className="text-xs text-muted-foreground">{medicine.unit}</span>
                  </div>
                  <Badge
                    variant={medicine.total_stock === 0 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {medicine.total_stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
