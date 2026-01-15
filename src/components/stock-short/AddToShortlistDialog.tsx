import { useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Package } from 'lucide-react';
import { useMedicines, MedicineWithBatches } from '@/hooks/useMedicines';

interface AddToShortlistDialogProps {
  onAddToShortlist: (medicines: MedicineWithBatches[]) => void;
}

export function AddToShortlistDialog({ onAddToShortlist }: AddToShortlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const { medicines, isLoading } = useMedicines();

  // Filter medicines by search term
  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMedicine = (id: string) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAddToShortlist = () => {
    const selected = medicines.filter((m) => selectedMedicines.includes(m.id));
    onAddToShortlist(selected);
    setSelectedMedicines([]);
    setSearchTerm('');
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedMedicines([]);
      setSearchTerm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add to Shortlist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Medicines to Shortlist
          </DialogTitle>
          <DialogDescription>
            Search and select medicines to add to your order shortlist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, generic name, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading medicines...
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No medicines found matching "{searchTerm}"
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {filteredMedicines.map((medicine) => (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{medicine.name}</span>
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
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {medicine.total_stock} {medicine.unit}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Current stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedMedicines.length} medicine(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddToShortlist}
                disabled={selectedMedicines.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Shortlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
