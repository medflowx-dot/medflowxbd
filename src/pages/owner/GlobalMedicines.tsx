import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pill, Search, Plus, Upload, MoreHorizontal, Pencil, Trash2, Database, Download, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalMedicines, GlobalMedicine, CreateGlobalMedicineData } from '@/hooks/useGlobalMedicines';
import { useGlobalManufacturers } from '@/hooks/useGlobalManufacturers';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const UNITS = ['pcs', 'strip', 'box', 'bottle', 'tube', 'vial', 'sachet'];

export default function GlobalMedicines() {
  const { medicines, isLoading, createGlobalMedicine, updateGlobalMedicine, deleteGlobalMedicine, bulkCreate } = useGlobalMedicines();
  const { manufacturers } = useGlobalManufacturers();
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<GlobalMedicine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateGlobalMedicineData>({
    name: '',
    generic_name: '',
    category: '',
    manufacturer_id: '',
    unit: 'pcs',
    is_tax_applicable: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImportingMedex, setIsImportingMedex] = useState(false);
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManufacturer = manufacturerFilter === 'all' || m.manufacturer_id === manufacturerFilter;
    return matchesSearch && matchesManufacturer;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      category: '',
      manufacturer_id: '',
      unit: 'pcs',
      is_tax_applicable: false,
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    await createGlobalMedicine.mutateAsync({
      ...formData,
      name: formData.name.trim(),
      manufacturer_id: formData.manufacturer_id || undefined,
    });
    resetForm();
    setAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedMedicine || !formData.name.trim()) return;
    await updateGlobalMedicine.mutateAsync({
      id: selectedMedicine.id,
      ...formData,
      name: formData.name.trim(),
      manufacturer_id: formData.manufacturer_id || undefined,
    });
    resetForm();
    setEditDialogOpen(false);
    setSelectedMedicine(null);
  };

  const handleDelete = async () => {
    if (!selectedMedicine) return;
    await deleteGlobalMedicine.mutateAsync(selectedMedicine.id);
    setDeleteDialogOpen(false);
    setSelectedMedicine(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
      
      const medicinesData: CreateGlobalMedicineData[] = rows
        .filter(row => row.Name || row.name || row['Medicine Name'])
        .map(row => {
          const manufacturerName = row.Manufacturer || row.manufacturer || row['Company Name'] || '';
          const manufacturer = manufacturers.find(m => 
            m.name.toLowerCase() === manufacturerName.toLowerCase()
          );
          
          return {
            name: row.Name || row.name || row['Medicine Name'] || '',
            generic_name: row['Generic Name'] || row.generic_name || row.Generic || '',
            category: row.Category || row.category || '',
            manufacturer_id: manufacturer?.id,
            unit: row.Unit || row.unit || 'pcs',
            is_tax_applicable: row['Tax Applicable']?.toLowerCase() === 'yes' || false,
          };
        });

      if (medicinesData.length === 0) {
        toast.error('No valid data found in file');
        return;
      }

      await bulkCreate.mutateAsync(medicinesData);
    } catch (error) {
      toast.error('Failed to read file');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateMasterData = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-global-medicines');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success(`${data.inserted} medicines added, ${data.skipped} skipped (already exist)`);
      } else {
        toast.error(data.error || 'Failed to generate medicines');
      }
    } catch (error: any) {
      console.error('Error generating medicines:', error);
      toast.error(error.message || 'Failed to generate master data');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/templates/global-medicines-template.csv', '_blank');
  };

  const handleImportFromMedex = async () => {
    setIsImportingMedex(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-medex-medicines');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success(`${data.inserted} herbal medicines imported, ${data.skipped} already existed`);
      } else {
        toast.error(data.error || 'Failed to import from MedEx');
      }
    } catch (error: any) {
      console.error('Error importing from MedEx:', error);
      toast.error(error.message || 'Failed to import from MedEx');
    } finally {
      setIsImportingMedex(false);
    }
  };
  const MedicineForm = ({ onSubmit, submitLabel, isLoading: formLoading }: { onSubmit: () => void; submitLabel: string; isLoading: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Medicine Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Napa 500mg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="generic">Generic Name</Label>
          <Input
            id="generic"
            value={formData.generic_name}
            onChange={(e) => setFormData(prev => ({ ...prev, generic_name: e.target.value }))}
            placeholder="e.g., Paracetamol"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Analgesic"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Select
            value={formData.manufacturer_id || 'none'}
            onValueChange={(v) => setFormData(prev => ({ ...prev, manufacturer_id: v === 'none' ? '' : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manufacturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {manufacturers.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tax"
              checked={formData.is_tax_applicable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_tax_applicable: !!checked }))}
            />
            <Label htmlFor="tax">Tax Applicable</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {
          resetForm();
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={formLoading}>
          {formLoading ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Global Medicines</h1>
          <p className="text-muted-foreground mt-1">
            Master list of medicines for all clients
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleImportFromMedex}
            disabled={isImportingMedex}
          >
            {isImportingMedex ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {isImportingMedex ? 'Importing...' : 'Import from MedEx'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleGenerateMasterData}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Master Data'}
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Global Medicine</DialogTitle>
                <DialogDescription>
                  This medicine will be available for all clients to copy.
                </DialogDescription>
              </DialogHeader>
              <MedicineForm onSubmit={handleAdd} submitLabel="Add" isLoading={createGlobalMedicine.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Total Medicines
          </CardDescription>
          <CardTitle className="text-2xl">{medicines.length}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Global Medicines</CardTitle>
          <CardDescription>Manage master medicine list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by manufacturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                {manufacturers.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredMedicines.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No medicines found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.generic_name || '-'}</TableCell>
                      <TableCell>{medicine.manufacturer?.name || '-'}</TableCell>
                      <TableCell>{medicine.unit}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMedicine(medicine);
                                setFormData({
                                  name: medicine.name,
                                  generic_name: medicine.generic_name || '',
                                  category: medicine.category || '',
                                  manufacturer_id: medicine.manufacturer_id || '',
                                  unit: medicine.unit,
                                  is_tax_applicable: medicine.is_tax_applicable,
                                });
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedMedicine(medicine);
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <MedicineForm onSubmit={handleEdit} submitLabel="Save" isLoading={updateGlobalMedicine.isPending} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{selectedMedicine?.name}" from the global list. Clients who have already copied this medicine will not be affected.
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
