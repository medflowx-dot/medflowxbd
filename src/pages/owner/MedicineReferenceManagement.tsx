import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Search, Plus, Upload, MoreHorizontal, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMedicineReferenceAdmin, MedicineReferenceData, CreateMedicineReferenceData } from '@/hooks/useMedicineReferenceAdmin';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream', 'Ointment', 'Gel', 'Drops', 'Inhaler', 'Suppository', 'Powder', 'Solution', 'Spray'];
const DRUG_CLASSES = ['Antibiotic', 'Analgesic', 'Antacid', 'Antidiabetic', 'Antihypertensive', 'Antihistamine', 'Anti-inflammatory', 'Cardiovascular', 'Gastrointestinal', 'Respiratory', 'CNS', 'Dermatological', 'Vitamin', 'Insulin', 'Antiviral', 'Antifungal'];
const PREGNANCY_CATEGORIES = ['A', 'B', 'C', 'D', 'X', 'N'];

const INITIAL_FORM_DATA: CreateMedicineReferenceData = {
  name: '',
  generic_name: '',
  dosage_form: '',
  strength: '',
  manufacturer_name: '',
  unit_price: undefined,
  strip_price: undefined,
  pack_size: '',
  indication: '',
  drug_class: '',
  therapeutic_class: '',
  pharmacology: '',
  mode_of_action: '',
  dosage_adult: '',
  dosage_pediatric: '',
  administration: '',
  contraindications: '',
  side_effects: '',
  precautions: '',
  drug_interactions: '',
  overdose_info: '',
  pregnancy_category: '',
  lactation_info: '',
  storage: '',
};

export default function MedicineReferenceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { medicines, isLoading, createMedicine, updateMedicine, deleteMedicine, bulkCreate } = useMedicineReferenceAdmin({ search: searchTerm });
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineReferenceData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateMedicineReferenceData>(INITIAL_FORM_DATA);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Medicine name is required');
      return;
    }
    await createMedicine.mutateAsync(formData);
    resetForm();
    setAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedMedicine || !formData.name.trim()) return;
    await updateMedicine.mutateAsync({
      id: selectedMedicine.id,
      ...formData,
    });
    resetForm();
    setEditDialogOpen(false);
    setSelectedMedicine(null);
  };

  const handleDelete = async () => {
    if (!selectedMedicine) return;
    await deleteMedicine.mutateAsync(selectedMedicine.id);
    setDeleteDialogOpen(false);
    setSelectedMedicine(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
      
      const medicinesData: CreateMedicineReferenceData[] = rows
        .filter(row => row.Name || row.name || row['Medicine Name'])
        .map(row => ({
          name: String(row.Name || row.name || row['Medicine Name'] || '').trim(),
          generic_name: String(row['Generic Name'] || row.generic_name || row.Generic || '').trim() || undefined,
          dosage_form: String(row['Dosage Form'] || row.dosage_form || row.Form || '').trim() || undefined,
          strength: String(row.Strength || row.strength || '').trim() || undefined,
          manufacturer_name: String(row.Manufacturer || row.manufacturer || row['Company Name'] || '').trim() || undefined,
          unit_price: parseFloat(row['Unit Price'] || row.unit_price) || undefined,
          strip_price: parseFloat(row['Strip Price'] || row.strip_price) || undefined,
          pack_size: String(row['Pack Size'] || row.pack_size || '').trim() || undefined,
          indication: String(row.Indication || row.indication || '').trim() || undefined,
          drug_class: String(row['Drug Class'] || row.drug_class || row.Class || '').trim() || undefined,
          therapeutic_class: String(row['Therapeutic Class'] || row.therapeutic_class || '').trim() || undefined,
          pharmacology: String(row.Pharmacology || row.pharmacology || '').trim() || undefined,
          mode_of_action: String(row['Mode of Action'] || row.mode_of_action || '').trim() || undefined,
          dosage_adult: String(row['Dosage Adult'] || row.dosage_adult || row['Adult Dose'] || '').trim() || undefined,
          dosage_pediatric: String(row['Dosage Pediatric'] || row.dosage_pediatric || row['Pediatric Dose'] || '').trim() || undefined,
          administration: String(row.Administration || row.administration || '').trim() || undefined,
          contraindications: String(row.Contraindications || row.contraindications || '').trim() || undefined,
          side_effects: String(row['Side Effects'] || row.side_effects || '').trim() || undefined,
          precautions: String(row.Precautions || row.precautions || '').trim() || undefined,
          drug_interactions: String(row['Drug Interactions'] || row.drug_interactions || '').trim() || undefined,
          overdose_info: String(row['Overdose Info'] || row.overdose_info || row.Overdose || '').trim() || undefined,
          pregnancy_category: String(row['Pregnancy Category'] || row.pregnancy_category || '').trim() || undefined,
          lactation_info: String(row['Lactation Info'] || row.lactation_info || '').trim() || undefined,
          storage: String(row.Storage || row.storage || '').trim() || undefined,
        }));

      if (medicinesData.length === 0) {
        toast.error('No valid data found in file');
        return;
      }

      await bulkCreate.mutateAsync(medicinesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to import file');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportFromEdgeFunction = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-medicine-reference');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success(`${data.inserted} medicines imported! (${data.skipped} already existed)`);
      } else {
        toast.error(data.error || 'Failed to import');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import medicine reference');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        'Name': 'Napa 500mg Tablet',
        'Generic Name': 'Paracetamol',
        'Dosage Form': 'Tablet',
        'Strength': '500mg',
        'Manufacturer': 'Beximco Pharmaceuticals',
        'Unit Price': 2.50,
        'Strip Price': 25.00,
        'Pack Size': '10',
        'Drug Class': 'Analgesic',
        'Therapeutic Class': 'Antipyretic',
        'Indication': 'Fever, Pain, Headache, Muscle aches',
        'Pharmacology': 'Paracetamol is a para-aminophenol derivative that exhibits analgesic and antipyretic activity.',
        'Mode of Action': 'It is thought to work by reducing the production of prostaglandins in the CNS.',
        'Dosage Adult': '500mg-1g every 4-6 hours. Maximum: 4g/day',
        'Dosage Pediatric': '10-15mg/kg every 4-6 hours. Maximum: 60mg/kg/day',
        'Administration': 'Oral. Can be taken with or without food.',
        'Contraindications': 'Severe hepatic impairment, Hypersensitivity to paracetamol',
        'Side Effects': 'Rare: Skin rash, Blood disorders, Hepatotoxicity (overdose)',
        'Precautions': 'Use with caution in hepatic impairment, chronic alcohol abuse',
        'Drug Interactions': 'Warfarin - may enhance anticoagulant effect. Metoclopramide - increases absorption.',
        'Overdose Info': 'N-acetylcysteine is the specific antidote. Seek immediate medical attention.',
        'Pregnancy Category': 'B',
        'Lactation Info': 'Compatible with breastfeeding in normal doses',
        'Storage': 'Store below 25°C. Protect from light and moisture.',
      },
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicine Reference');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 25 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 40 }, { wch: 50 }, { wch: 50 }, { wch: 40 }, { wch: 40 },
      { wch: 30 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 },
      { wch: 40 }, { wch: 5 }, { wch: 40 }, { wch: 40 },
    ];
    
    XLSX.writeFile(wb, 'medicine_reference_template_complete.xlsx');
  };

  const openEditDialog = (medicine: MedicineReferenceData) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name || '',
      dosage_form: medicine.dosage_form || '',
      strength: medicine.strength || '',
      manufacturer_name: medicine.manufacturer_name || '',
      unit_price: medicine.unit_price || undefined,
      strip_price: medicine.strip_price || undefined,
      pack_size: medicine.pack_size || '',
      indication: medicine.indication || '',
      drug_class: medicine.drug_class || '',
      therapeutic_class: medicine.therapeutic_class || '',
      pharmacology: medicine.pharmacology || '',
      mode_of_action: medicine.mode_of_action || '',
      dosage_adult: medicine.dosage_adult || '',
      dosage_pediatric: medicine.dosage_pediatric || '',
      administration: medicine.administration || '',
      contraindications: medicine.contraindications || '',
      side_effects: medicine.side_effects || '',
      precautions: medicine.precautions || '',
      drug_interactions: medicine.drug_interactions || '',
      overdose_info: medicine.overdose_info || '',
      pregnancy_category: medicine.pregnancy_category || '',
      lactation_info: medicine.lactation_info || '',
      storage: medicine.storage || '',
    });
    setEditDialogOpen(true);
  };

  // Multi-tab medicine form component
  const MedicineForm = ({ onSubmit, submitLabel, isFormLoading }: { onSubmit: () => void; submitLabel: string; isFormLoading: boolean }) => (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[45vh] mt-4 pr-4">
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Napa 500mg Tablet"
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
                <Label htmlFor="dosage_form">Dosage Form</Label>
                <Input
                  id="dosage_form"
                  value={formData.dosage_form}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage_form: e.target.value }))}
                  placeholder="e.g., Tablet, Syrup"
                  list="dosage-forms"
                />
                <datalist id="dosage-forms">
                  {DOSAGE_FORMS.map(form => (
                    <option key={form} value={form} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                  placeholder="e.g., 500mg, 100ml"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer_name: e.target.value }))}
                  placeholder="e.g., Square Pharmaceuticals"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drug_class">Drug Class</Label>
                <Input
                  id="drug_class"
                  value={formData.drug_class}
                  onChange={(e) => setFormData(prev => ({ ...prev, drug_class: e.target.value }))}
                  placeholder="e.g., Antibiotic"
                  list="drug-classes"
                />
                <datalist id="drug-classes">
                  {DRUG_CLASSES.map(cls => (
                    <option key={cls} value={cls} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="therapeutic_class">Therapeutic Class</Label>
                <Input
                  id="therapeutic_class"
                  value={formData.therapeutic_class}
                  onChange={(e) => setFormData(prev => ({ ...prev, therapeutic_class: e.target.value }))}
                  placeholder="e.g., Antipyretic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Input
                  id="storage"
                  value={formData.storage}
                  onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                  placeholder="e.g., Store below 25°C"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price (৳)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strip_price">Strip Price (৳)</Label>
                <Input
                  id="strip_price"
                  type="number"
                  step="0.01"
                  value={formData.strip_price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, strip_price: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pack_size">Pack Size</Label>
                <Input
                  id="pack_size"
                  value={formData.pack_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, pack_size: e.target.value }))}
                  placeholder="e.g., 10, 30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indication">Indication</Label>
              <Textarea
                id="indication"
                value={formData.indication}
                onChange={(e) => setFormData(prev => ({ ...prev, indication: e.target.value }))}
                placeholder="e.g., Fever, Pain, Headache, Muscle aches..."
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Clinical Tab */}
          <TabsContent value="clinical" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="pharmacology">Pharmacology</Label>
              <Textarea
                id="pharmacology"
                value={formData.pharmacology}
                onChange={(e) => setFormData(prev => ({ ...prev, pharmacology: e.target.value }))}
                placeholder="Describe the pharmacological properties..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mode_of_action">Mode of Action</Label>
              <Textarea
                id="mode_of_action"
                value={formData.mode_of_action}
                onChange={(e) => setFormData(prev => ({ ...prev, mode_of_action: e.target.value }))}
                placeholder="Describe how the medicine works..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage_adult">Adult Dosage</Label>
              <Textarea
                id="dosage_adult"
                value={formData.dosage_adult}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage_adult: e.target.value }))}
                placeholder="e.g., 500mg-1g every 4-6 hours. Maximum: 4g/day"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage_pediatric">Pediatric Dosage</Label>
              <Textarea
                id="dosage_pediatric"
                value={formData.dosage_pediatric}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage_pediatric: e.target.value }))}
                placeholder="e.g., 10-15mg/kg every 4-6 hours. Maximum: 60mg/kg/day"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="administration">Administration</Label>
              <Textarea
                id="administration"
                value={formData.administration}
                onChange={(e) => setFormData(prev => ({ ...prev, administration: e.target.value }))}
                placeholder="e.g., Oral. Can be taken with or without food."
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="contraindications">Contraindications</Label>
              <Textarea
                id="contraindications"
                value={formData.contraindications}
                onChange={(e) => setFormData(prev => ({ ...prev, contraindications: e.target.value }))}
                placeholder="e.g., Severe hepatic impairment, Hypersensitivity..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="side_effects">Side Effects</Label>
              <Textarea
                id="side_effects"
                value={formData.side_effects}
                onChange={(e) => setFormData(prev => ({ ...prev, side_effects: e.target.value }))}
                placeholder="e.g., Rare: Skin rash, Blood disorders..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precautions">Precautions</Label>
              <Textarea
                id="precautions"
                value={formData.precautions}
                onChange={(e) => setFormData(prev => ({ ...prev, precautions: e.target.value }))}
                placeholder="e.g., Use with caution in hepatic impairment..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drug_interactions">Drug Interactions</Label>
              <Textarea
                id="drug_interactions"
                value={formData.drug_interactions}
                onChange={(e) => setFormData(prev => ({ ...prev, drug_interactions: e.target.value }))}
                placeholder="e.g., Warfarin - may enhance anticoagulant effect..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="overdose_info">Overdose Information</Label>
              <Textarea
                id="overdose_info"
                value={formData.overdose_info}
                onChange={(e) => setFormData(prev => ({ ...prev, overdose_info: e.target.value }))}
                placeholder="e.g., N-acetylcysteine is the specific antidote..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pregnancy_category">Pregnancy Category</Label>
                <Select
                  value={formData.pregnancy_category || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pregnancy_category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    {PREGNANCY_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>Category {cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="lactation_info">Lactation Info</Label>
                <Input
                  id="lactation_info"
                  value={formData.lactation_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, lactation_info: e.target.value }))}
                  placeholder="e.g., Compatible with breastfeeding"
                />
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={() => {
          resetForm();
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isFormLoading}>
          {isFormLoading ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Medicine Reference
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the medicine reference database (MedEx-style)
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
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Bulk Import
          </Button>
          <Button variant="secondary" onClick={handleImportFromEdgeFunction} disabled={isImporting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
            Import Sample
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Medicine Reference</DialogTitle>
                <DialogDescription>
                  Add a new medicine with complete MedEx-style details.
                </DialogDescription>
              </DialogHeader>
              <MedicineForm onSubmit={handleAdd} submitLabel="Add Medicine" isFormLoading={createMedicine.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Total Reference Medicines
          </CardDescription>
          <CardTitle className="text-2xl">{medicines.length}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Reference Database</CardTitle>
          <CardDescription>View and manage medicine reference entries with complete clinical data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, generic, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : medicines.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No medicines found</p>
              <p className="text-sm mt-1">Add medicines manually or use bulk import</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead className="hidden md:table-cell">Form</TableHead>
                    <TableHead className="hidden md:table-cell">Strength</TableHead>
                    <TableHead className="hidden lg:table-cell">Manufacturer</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.generic_name || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{medicine.dosage_form || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{medicine.strength || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{medicine.manufacturer_name || '-'}</TableCell>
                      <TableCell className="text-right">
                        {medicine.unit_price ? `৳${medicine.unit_price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {/* Desktop: Dropdown */}
                        <div className="hidden sm:block">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(medicine)}>
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
                        </div>
                        {/* Mobile: Inline buttons */}
                        <div className="flex sm:hidden gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(medicine)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Medicine Reference</DialogTitle>
            <DialogDescription>
              Update medicine details with complete clinical information.
            </DialogDescription>
          </DialogHeader>
          <MedicineForm onSubmit={handleEdit} submitLabel="Save Changes" isFormLoading={updateMedicine.isPending} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMedicine?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
