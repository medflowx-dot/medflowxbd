import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Search, Plus, Upload, MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react';
import { useGlobalManufacturers, GlobalManufacturer } from '@/hooks/useGlobalManufacturers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function GlobalManufacturers() {
  const { manufacturers, isLoading, createGlobalManufacturer, updateGlobalManufacturer, deleteGlobalManufacturer, bulkCreate } = useGlobalManufacturers();
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<GlobalManufacturer | null>(null);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!name.trim()) return;
    await createGlobalManufacturer.mutateAsync({ name: name.trim() });
    setName('');
    setAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedManufacturer || !name.trim()) return;
    await updateGlobalManufacturer.mutateAsync({ id: selectedManufacturer.id, name: name.trim() });
    setName('');
    setEditDialogOpen(false);
    setSelectedManufacturer(null);
  };

  const handleDelete = async () => {
    if (!selectedManufacturer) return;
    await deleteGlobalManufacturer.mutateAsync(selectedManufacturer.id);
    setDeleteDialogOpen(false);
    setSelectedManufacturer(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let names: string[] = [];
      
      // Check if it's a CSV file
      if (file.name.endsWith('.csv')) {
        // Read CSV as text to handle encoding properly
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        
        // Skip header if it looks like a header
        const startIndex = lines[0]?.toLowerCase().includes('name') ? 1 : 0;
        names = lines.slice(startIndex).filter(name => name.length > 0);
      } else {
        // For Excel files
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<{ Name?: string; name?: string; 'Company Name'?: string }>(sheet);
        
        names = rows
          .map(row => row.Name || row.name || row['Company Name'] || '')
          .filter(Boolean);
      }

      if (names.length === 0) {
        toast.error('No valid data found in file');
        return;
      }

      toast.info(`Found ${names.length} manufacturers to import...`);
      await bulkCreate.mutateAsync(names);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to read file');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Global Manufacturers</h1>
          <p className="text-muted-foreground mt-1">
            Master list of manufacturers for all clients
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button 
            variant="outline" 
            onClick={() => window.open('/templates/global-manufacturers-template.csv', '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={bulkCreate.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {bulkCreate.isPending ? 'Importing...' : 'Bulk Import'}
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Manufacturer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Global Manufacturer</DialogTitle>
                <DialogDescription>
                  This manufacturer will be available for all clients to copy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Square Pharmaceuticals"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={createGlobalManufacturer.isPending}>
                  {createGlobalManufacturer.isPending ? 'Adding...' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Total Manufacturers
          </CardDescription>
          <CardTitle className="text-2xl">{manufacturers.length}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Global Manufacturers</CardTitle>
          <CardDescription>Manage master manufacturer list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manufacturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredManufacturers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No manufacturers found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManufacturers.map((manufacturer) => (
                    <TableRow key={manufacturer.id}>
                      <TableCell className="font-medium">{manufacturer.name}</TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedManufacturer(manufacturer);
                                setName(manufacturer.name);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedManufacturer(manufacturer);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Manufacturer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateGlobalManufacturer.isPending}>
              {updateGlobalManufacturer.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manufacturer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{selectedManufacturer?.name}" from the global list. Clients who have already copied this manufacturer will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
