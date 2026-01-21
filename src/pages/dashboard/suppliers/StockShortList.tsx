import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Trash2, CheckCircle, ClipboardList, Package, Search, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStockShortList } from '@/hooks/useStockShortList';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useMedicines } from '@/hooks/useMedicines';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Type for pending items in batch add
interface PendingItem {
  medicine_id: string;
  medicine_name: string;
  medicine_unit: string;
  quantity: number;
}

export default function StockShortList() {
  const { notes, isLoading, createNote, addItem, deleteItem, completeNote, deleteNote } = useStockShortList();
  const { manufacturers } = useManufacturers();
  const { medicines } = useMedicines();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAddingItems, setIsAddingItems] = useState(false);
  
  const [newNote, setNewNote] = useState({
    note_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [newItem, setNewItem] = useState({
    manufacturer_id: '',
    medicine_id: '',
    quantity: '1',
  });
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicinePopoverOpen, setMedicinePopoverOpen] = useState(false);
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [manufacturerPopoverOpen, setManufacturerPopoverOpen] = useState(false);

  // Pending items for batch adding
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  // Filter active notes
  const activeNotes = notes.filter(n => n.status === 'active');
  const completedNotes = notes.filter(n => n.status === 'completed');

  // Get active manufacturers filtered by search
  const activeManufacturers = manufacturers.filter(m => 
    m.is_active !== false && 
    m.name.toLowerCase().includes(manufacturerSearch.toLowerCase())
  );

  // Get selected manufacturer name
  const selectedManufacturer = manufacturers.find(m => m.id === newItem.manufacturer_id);
  
  // Filter medicines by selected manufacturer and search
  const filteredMedicines = newItem.manufacturer_id 
    ? medicines.filter(m => 
        m.manufacturer_id === newItem.manufacturer_id && 
        m.is_active !== false &&
        m.name.toLowerCase().includes(medicineSearch.toLowerCase())
      )
    : [];

  // Get selected medicine name
  const selectedMedicine = medicines.find(m => m.id === newItem.medicine_id);

  const handleCreateNote = async () => {
    try {
      await createNote(newNote);
      setCreateDialogOpen(false);
      setNewNote({ note_date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (error) {
      // handled in hook
    }
  };

  // Add medicine to pending list
  const handleAddToPending = () => {
    if (!newItem.medicine_id) return;
    const medicine = medicines.find(m => m.id === newItem.medicine_id);
    if (!medicine) return;
    
    const quantityNum = parseInt(newItem.quantity) || 1;
    
    // Check if already exists, update quantity if so
    const existingIndex = pendingItems.findIndex(
      item => item.medicine_id === newItem.medicine_id
    );
    
    if (existingIndex >= 0) {
      const updated = [...pendingItems];
      updated[existingIndex].quantity += quantityNum;
      setPendingItems(updated);
    } else {
      setPendingItems([...pendingItems, {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        medicine_unit: medicine.unit || 'pcs',
        quantity: quantityNum,
      }]);
    }
    
    // Reset medicine selection but keep manufacturer
    setNewItem({ ...newItem, medicine_id: '', quantity: '1' });
    setMedicineSearch('');
  };

  // Remove from pending list
  const handleRemoveFromPending = (medicineId: string) => {
    setPendingItems(pendingItems.filter(item => item.medicine_id !== medicineId));
  };

  // Add all pending items to note
  const handleAddAllItems = async () => {
    if (!selectedNoteId || !newItem.manufacturer_id || pendingItems.length === 0) return;
    
    setIsAddingItems(true);
    try {
      for (const item of pendingItems) {
        await addItem({
          note_id: selectedNoteId,
          manufacturer_id: newItem.manufacturer_id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
        });
      }
      toast.success(`${pendingItems.length} টি আইটেম যোগ করা হয়েছে`);
      handleDialogClose(false);
    } catch (error) {
      // handled in hook
    } finally {
      setIsAddingItems(false);
    }
  };

  // Dialog close handler - reset all states
  const handleDialogClose = (open: boolean) => {
    setAddItemDialogOpen(open);
    if (!open) {
      setPendingItems([]);
      setNewItem({ manufacturer_id: '', medicine_id: '', quantity: '1' });
      setMedicineSearch('');
      setManufacturerSearch('');
    }
  };

  const openAddItemDialog = (noteId: string) => {
    setSelectedNoteId(noteId);
    setAddItemDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Stock Short List</h1>
          <p className="text-muted-foreground mt-1">
            Note medicines that need to be reordered
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stock Short Note</DialogTitle>
              <DialogDescription>
                Start a new list of medicines that need to be ordered
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Note Date</Label>
                <Input
                  type="date"
                  value={newNote.note_date}
                  onChange={(e) => setNewNote({ ...newNote, note_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Textarea
                  value={newNote.remarks}
                  onChange={(e) => setNewNote({ ...newNote, remarks: e.target.value })}
                  placeholder="Any notes about this list..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote}>
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Notes */}
      {activeNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Active Notes</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Create a new note to start listing medicines that need to be reordered.
            </p>
          </CardContent>
        </Card>
      ) : (
        activeNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Note: {format(new Date(note.note_date), 'dd MMM yyyy')}</CardTitle>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  {note.remarks && (
                    <CardDescription className="mt-1">{note.remarks}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openAddItemDialog(note.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm"
                        disabled={!note.items || note.items.length === 0}
                      >
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
                        <AlertDialogAction onClick={() => completeNote(note.id)}>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!note.items || note.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items added yet. Click "Add Item" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead className="hidden sm:table-cell">Manufacturer</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {note.items.map((item) => (
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
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))
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
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Dialog - Batch Add */}
      <Dialog open={addItemDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Items to Note</DialogTitle>
            <DialogDescription>
              একটি Manufacturer সিলেক্ট করে একাধিক Medicine যোগ করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Manufacturer Selection */}
            <div className="space-y-2">
              <Label>Manufacturer *</Label>
              <Popover open={manufacturerPopoverOpen} onOpenChange={setManufacturerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={manufacturerPopoverOpen}
                    className="w-full justify-between font-normal"
                    disabled={pendingItems.length > 0}
                  >
                    {selectedManufacturer 
                      ? selectedManufacturer.name
                      : "Search manufacturer..."
                    }
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search manufacturer..." 
                      value={manufacturerSearch}
                      onValueChange={setManufacturerSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No manufacturer found.</CommandEmpty>
                      <CommandGroup>
                        {activeManufacturers.slice(0, 50).map((mfg) => (
                          <CommandItem
                            key={mfg.id}
                            value={mfg.name}
                            onSelect={() => {
                              setNewItem({ ...newItem, manufacturer_id: mfg.id, medicine_id: '' });
                              setManufacturerPopoverOpen(false);
                              setManufacturerSearch('');
                              setPendingItems([]); // Clear pending when manufacturer changes
                            }}
                          >
                            {mfg.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Medicine Add Section - Only show when manufacturer is selected */}
            {newItem.manufacturer_id && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Add Medicines</Label>
                  
                  {/* Medicine + Quantity Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Popover open={medicinePopoverOpen} onOpenChange={setMedicinePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={medicinePopoverOpen}
                            className="w-full justify-between font-normal text-sm h-9"
                          >
                            {selectedMedicine 
                              ? `${selectedMedicine.name}`
                              : "Search medicine..."
                            }
                            <Search className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search medicine..." 
                              value={medicineSearch}
                              onValueChange={setMedicineSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No medicine found.</CommandEmpty>
                              <CommandGroup>
                                {filteredMedicines.slice(0, 50).map((med) => (
                                  <CommandItem
                                    key={med.id}
                                    value={med.name}
                                    onSelect={() => {
                                      setNewItem({ ...newItem, medicine_id: med.id });
                                      setMedicinePopoverOpen(false);
                                      setMedicineSearch('');
                                    }}
                                  >
                                    {med.name} ({med.unit})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Quantity with +/- buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => {
                          const current = parseInt(newItem.quantity) || 1;
                          if (current > 1) {
                            setNewItem({ ...newItem, quantity: String(current - 1) });
                          }
                        }}
                        disabled={parseInt(newItem.quantity) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newItem.medicine_id) {
                            e.preventDefault();
                            handleAddToPending();
                          }
                        }}
                        className="w-14 h-9 text-center px-1"
                        placeholder="Qty"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => {
                          const current = parseInt(newItem.quantity) || 1;
                          setNewItem({ ...newItem, quantity: String(current + 1) });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="h-9 px-4"
                      onClick={handleAddToPending}
                      disabled={!newItem.medicine_id}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Pending Items List */}
                {pendingItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Added Items ({pendingItems.length})
                      </Label>
                    </div>
                    <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                      {pendingItems.map((item) => (
                        <div 
                          key={item.medicine_id} 
                          className="flex items-center justify-between px-3 py-2 text-sm gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate block">{item.medicine_name}</span>
                            <span className="text-xs text-muted-foreground">({item.medicine_unit})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  const updated = pendingItems.map(p =>
                                    p.medicine_id === item.medicine_id
                                      ? { ...p, quantity: p.quantity - 1 }
                                      : p
                                  );
                                  setPendingItems(updated);
                                }
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                const updated = pendingItems.map(p =>
                                  p.medicine_id === item.medicine_id
                                    ? { ...p, quantity: p.quantity + 1 }
                                    : p
                                );
                                setPendingItems(updated);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-1"
                              onClick={() => handleRemoveFromPending(item.medicine_id)}
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddAllItems}
                disabled={pendingItems.length === 0 || isAddingItems}
              >
                {isAddingItems ? 'Adding...' : `Add All (${pendingItems.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
