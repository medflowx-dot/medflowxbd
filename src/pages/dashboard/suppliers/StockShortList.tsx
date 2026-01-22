import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Trash2, CheckCircle, Package, Search, AlertTriangle, Zap } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStockShortList } from '@/hooks/useStockShortList';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useMedicines } from '@/hooks/useMedicines';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';

interface AutoDetectedInfo {
  medicine: {
    id: string;
    name: string;
    unit: string;
    manufacturer_id: string | null;
  } | null;
  manufacturer: {
    id: string;
    name: string;
  } | null;
  supplier: {
    id: string;
    name: string;
  } | null;
}

export default function StockShortList() {
  const { 
    notes, 
    suppliers,
    isLoading, 
    quickAddItem, 
    isQuickAdding,
    deleteItem, 
    completeNote, 
    deleteNote 
  } = useStockShortList();
  const { manufacturers } = useManufacturers();
  const { medicines } = useMedicines();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_stock_short');
  // Quick add state
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicinePopoverOpen, setMedicinePopoverOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');

  // Filter notes
  const activeNotes = notes.filter(n => n.status === 'active');
  const completedNotes = notes.filter(n => n.status === 'completed');

  // Today's note for display
  const today = new Date().toISOString().split('T')[0];
  const todayNote = activeNotes.find(n => n.note_date === today);

  // Get all active medicines for quick add
  const activeMedicines = useMemo(() => {
    return medicines.filter(m => m.is_active !== false);
  }, [medicines]);

  // Filter medicines by search
  const filteredMedicines = useMemo(() => {
    if (!medicineSearch.trim()) return activeMedicines.slice(0, 50);
    const search = medicineSearch.toLowerCase();
    return activeMedicines
      .filter(m => m.name.toLowerCase().includes(search))
      .slice(0, 50);
  }, [activeMedicines, medicineSearch]);

  // Auto-detect manufacturer and supplier when medicine is selected
  const autoDetectedInfo: AutoDetectedInfo = useMemo(() => {
    if (!selectedMedicineId) {
      return { medicine: null, manufacturer: null, supplier: null };
    }
    
    const medicine = medicines.find(m => m.id === selectedMedicineId);
    if (!medicine) {
      return { medicine: null, manufacturer: null, supplier: null };
    }
    
    const manufacturer = medicine.manufacturer_id 
      ? manufacturers.find(m => m.id === medicine.manufacturer_id)
      : null;
    
    const supplier = manufacturer 
      ? suppliers.find(s => s.manufacturer_id === manufacturer.id)
      : null;
    
    return {
      medicine: {
        id: medicine.id,
        name: medicine.name,
        unit: medicine.unit || 'pcs',
        manufacturer_id: medicine.manufacturer_id || null,
      },
      manufacturer: manufacturer ? { id: manufacturer.id, name: manufacturer.name } : null,
      supplier: supplier ? { id: supplier.id, name: supplier.name } : null,
    };
  }, [selectedMedicineId, medicines, manufacturers, suppliers]);

  // Handle quick add
  const handleQuickAdd = async () => {
    if (!autoDetectedInfo.medicine || !autoDetectedInfo.manufacturer) {
      return;
    }
    
    try {
      await quickAddItem({
        medicine_id: autoDetectedInfo.medicine.id,
        manufacturer_id: autoDetectedInfo.manufacturer.id,
        quantity: parseInt(quantity) || 1,
      });
      
      // Reset form
      setSelectedMedicineId(null);
      setMedicineSearch('');
      setQuantity('1');
    } catch (error) {
      // handled in hook
    }
  };

  // Handle medicine selection
  const handleMedicineSelect = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
    setMedicinePopoverOpen(false);
    setMedicineSearch('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Stock Short List</h1>
          <p className="text-muted-foreground mt-1">
            Quickly add medicines that need to be reordered
          </p>
        </div>
      </div>

      {/* Quick Add Card - Only show if can manage */}
      {canManage && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Quick Add</CardTitle>
            </div>
            <CardDescription>
              Medicine সিলেক্ট করলেই Manufacturer ও Supplier স্বয়ংক্রিয় সনাক্ত হবে
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Form */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Medicine Combobox */}
              <div className="flex-1">
                <Popover open={medicinePopoverOpen} onOpenChange={setMedicinePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={medicinePopoverOpen}
                      className="w-full justify-between font-normal bg-background"
                    >
                      {autoDetectedInfo.medicine 
                        ? `${autoDetectedInfo.medicine.name} (${autoDetectedInfo.medicine.unit})`
                        : "Medicine সার্চ করুন..."
                      }
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Medicine সার্চ করুন..." 
                        value={medicineSearch}
                        onValueChange={setMedicineSearch}
                      />
                      <CommandList>
                        <CommandEmpty>কোনো Medicine পাওয়া যায়নি</CommandEmpty>
                        <CommandGroup>
                          {filteredMedicines.map((med) => {
                            const mfg = manufacturers.find(m => m.id === med.manufacturer_id);
                            return (
                              <CommandItem
                                key={med.id}
                                value={med.name}
                                onSelect={() => handleMedicineSelect(med.id)}
                                className="flex flex-col items-start py-2"
                              >
                                <span className="font-medium">{med.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {mfg?.name || 'No manufacturer'} • {med.unit || 'pcs'}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => {
                    const current = parseInt(quantity) || 1;
                    if (current > 1) setQuantity(String(current - 1));
                  }}
                  disabled={parseInt(quantity) <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && autoDetectedInfo.manufacturer) {
                      e.preventDefault();
                      handleQuickAdd();
                    }
                  }}
                  className="w-16 h-10 text-center"
                  placeholder="Qty"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => {
                    const current = parseInt(quantity) || 1;
                    setQuantity(String(current + 1));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Add Button */}
              <Button 
                onClick={handleQuickAdd}
                disabled={!autoDetectedInfo.manufacturer || isQuickAdding}
                className="sm:w-auto"
              >
                {isQuickAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>

            {/* Auto-Detection Display */}
            {selectedMedicineId && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {autoDetectedInfo.manufacturer ? (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {autoDetectedInfo.manufacturer.name}
                    </Badge>
                    {autoDetectedInfo.supplier ? (
                      <Badge variant="secondary" className="gap-1">
                        ✓ Supplier: {autoDetectedInfo.supplier.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No supplier linked
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    No manufacturer - Cannot add
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's List */}
      {todayNote && todayNote.items && todayNote.items.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Today's List</CardTitle>
                  <Badge variant="outline">{todayNote.items.length} items</Badge>
                </div>
                <CardDescription className="mt-1">
                  {format(new Date(todayNote.note_date), 'dd MMM yyyy')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {canManage && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Create Orders
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Create Supplier Orders?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will create pending orders for each manufacturer's supplier. 
                            Items will be grouped by manufacturer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => completeNote(todayNote.id)}>
                            Create Orders
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Today's List?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this note and all its items.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteNote(todayNote.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead className="hidden sm:table-cell">Manufacturer</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="w-12 sticky right-0 bg-background"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayNote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.medicine?.name || 'Unknown'}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({item.medicine?.unit || 'pcs'})
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.manufacturer?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="sticky right-0 bg-background">
                        {canManage && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Items Today</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              উপরের Quick Add ফর্ম ব্যবহার করে Medicine যোগ করুন।
              প্রথম আইটেম যোগ করলেই স্বয়ংক্রিয় নোট তৈরি হবে।
            </p>
          </CardContent>
        </Card>
      )}

      {/* Other Active Notes (not today) */}
      {activeNotes.filter(n => n.note_date !== today).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Other Active Notes</h2>
          {activeNotes.filter(n => n.note_date !== today).map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {format(new Date(note.note_date), 'dd MMM yyyy')}
                    </CardTitle>
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="secondary">{note.items?.length || 0} items</Badge>
                  </div>
                  <div className="flex gap-2">
                    {canManage && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!note.items || note.items.length === 0}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Create Supplier Orders?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will create pending orders for each manufacturer's supplier.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => completeNote(note.id)}>
                                Create Orders
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this note and all its items.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteNote(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Notes Section */}
      {completedNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Completed Notes</h2>
          {completedNotes.slice(0, 5).map((note) => (
            <Card key={note.id} className="opacity-75">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {format(new Date(note.note_date), 'dd MMM yyyy')}
                    </CardTitle>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {note.items?.length || 0} items
                      </span>
                      {canManage && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this completed note and all its items.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteNote(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
