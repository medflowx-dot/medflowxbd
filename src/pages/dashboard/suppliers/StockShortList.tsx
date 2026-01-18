import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, CheckCircle, ClipboardList, Package } from 'lucide-react';
import { useStockShortList } from '@/hooks/useStockShortList';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useMedicines } from '@/hooks/useMedicines';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

export default function StockShortList() {
  const { notes, isLoading, createNote, addItem, deleteItem, completeNote, deleteNote } = useStockShortList();
  const { manufacturers } = useManufacturers();
  const { medicines } = useMedicines();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState({
    note_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [newItem, setNewItem] = useState({
    manufacturer_id: '',
    medicine_id: '',
    quantity: 1,
    is_tax_applicable: false,
  });

  // Filter active notes
  const activeNotes = notes.filter(n => n.status === 'active');
  const completedNotes = notes.filter(n => n.status === 'completed');

  // Get active manufacturers
  const activeManufacturers = manufacturers.filter(m => m.is_active !== false);
  
  // Filter medicines by selected manufacturer
  const filteredMedicines = newItem.manufacturer_id 
    ? medicines.filter(m => m.manufacturer_id === newItem.manufacturer_id && m.is_active !== false)
    : [];

  const handleCreateNote = async () => {
    try {
      await createNote(newNote);
      setCreateDialogOpen(false);
      setNewNote({ note_date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (error) {
      // handled in hook
    }
  };

  const handleAddItem = async () => {
    if (!selectedNoteId || !newItem.manufacturer_id || !newItem.medicine_id) return;
    
    try {
      await addItem({
        note_id: selectedNoteId,
        manufacturer_id: newItem.manufacturer_id,
        medicine_id: newItem.medicine_id,
        quantity: newItem.quantity,
        is_tax_applicable: newItem.is_tax_applicable,
      });
      setAddItemDialogOpen(false);
      setNewItem({ manufacturer_id: '', medicine_id: '', quantity: 1, is_tax_applicable: false });
    } catch (error) {
      // handled in hook
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
                        <TableHead className="text-center hidden sm:table-cell">Tax</TableHead>
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
                          <TableCell className="text-center hidden sm:table-cell">
                            {item.is_tax_applicable ? (
                              <Badge variant="secondary">Yes</Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
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
                  <span className="text-sm text-muted-foreground">
                    {note.items?.length || 0} items
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Note</DialogTitle>
            <DialogDescription>
              Select manufacturer and medicine to add
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Manufacturer *</Label>
              <Select
                value={newItem.manufacturer_id}
                onValueChange={(value) => setNewItem({ 
                  ...newItem, 
                  manufacturer_id: value,
                  medicine_id: '' // Reset medicine when manufacturer changes
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {activeManufacturers.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">No manufacturers available</div>
                  ) : (
                    activeManufacturers.map((mfg) => (
                      <SelectItem key={mfg.id} value={mfg.id}>
                        {mfg.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Medicine *</Label>
              <Select
                value={newItem.medicine_id}
                onValueChange={(value) => setNewItem({ ...newItem, medicine_id: value })}
                disabled={!newItem.manufacturer_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={newItem.manufacturer_id ? "Select medicine" : "Select manufacturer first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredMedicines.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">No medicines for this manufacturer</div>
                  ) : (
                    filteredMedicines.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name} ({med.unit})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Required Quantity *</Label>
              <Input
                type="number"
                min={1}
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="tax"
                checked={newItem.is_tax_applicable}
                onCheckedChange={(checked) => setNewItem({ ...newItem, is_tax_applicable: !!checked })}
              />
              <Label htmlFor="tax" className="cursor-pointer">Tax Applicable</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddItem}
                disabled={!newItem.manufacturer_id || !newItem.medicine_id}
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
