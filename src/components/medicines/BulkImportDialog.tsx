import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useMedicines, CreateMedicineData } from '@/hooks/useMedicines';
import { useManufacturers } from '@/hooks/useManufacturers';

interface ParsedMedicine {
  name: string;
  generic_name?: string;
  category?: string;
  manufacturer?: string;
  unit?: string;
  shelf_location?: string;
  min_stock_level?: number;
  isValid: boolean;
  errors: string[];
}

export function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedMedicine[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bulkCreateMedicines, medicines } = useMedicines();
  const { manufacturers } = useManufacturers();

  const existingNames = new Set(medicines.map((m) => m.name.toLowerCase().trim()));

  const validateRow = (row: Record<string, unknown>): ParsedMedicine => {
    const errors: string[] = [];
    const name = String(row['Name'] || row['name'] || row['Medicine Name'] || '').trim();
    const genericName = String(row['Generic Name'] || row['generic_name'] || '').trim() || undefined;
    const category = String(row['Category'] || row['category'] || '').trim() || undefined;
    const manufacturer = String(row['Manufacturer'] || row['manufacturer'] || '').trim() || undefined;
    const unit = String(row['Unit'] || row['unit'] || 'pcs').trim();
    const shelfLocation = String(row['Shelf Location'] || row['shelf_location'] || row['Location'] || '').trim() || undefined;
    const minStockLevel = Number(row['Min Stock Level'] || row['min_stock_level'] || row['Min Stock'] || 10);

    if (!name) {
      errors.push('Name is required');
    } else if (existingNames.has(name.toLowerCase())) {
      errors.push('Medicine already exists');
    }

    if (minStockLevel && (isNaN(minStockLevel) || minStockLevel < 0)) {
      errors.push('Invalid min stock level');
    }

    return {
      name,
      generic_name: genericName,
      category,
      manufacturer,
      unit,
      shelf_location: shelfLocation,
      min_stock_level: isNaN(minStockLevel) ? 10 : minStockLevel,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsed = jsonData.map((row) => validateRow(row as Record<string, unknown>));
        setParsedData(parsed);
      } catch {
        setParsedData([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    const validMedicines = parsedData.filter((m) => m.isValid);
    if (validMedicines.length === 0) return;

    setIsImporting(true);
    try {
      const dataToImport: CreateMedicineData[] = validMedicines.map((m) => {
        // Find manufacturer_id if manufacturer name matches
        const matchedManufacturer = manufacturers.find(
          (mfr) => mfr.name.toLowerCase() === m.manufacturer?.toLowerCase()
        );

        return {
          name: m.name,
          generic_name: m.generic_name,
          category: m.category,
          manufacturer: m.manufacturer,
          manufacturer_id: matchedManufacturer?.id,
          unit: m.unit,
          shelf_location: m.shelf_location,
          min_stock_level: m.min_stock_level,
        };
      });

      await bulkCreateMedicines.mutateAsync(dataToImport);
      setOpen(false);
      setParsedData([]);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        Name: 'Paracetamol 500mg',
        'Generic Name': 'Paracetamol',
        Category: 'Analgesic',
        Manufacturer: 'ABC Pharma',
        Unit: 'pcs',
        'Shelf Location': 'A1-01',
        'Min Stock Level': 50,
      },
      {
        Name: 'Amoxicillin 250mg',
        'Generic Name': 'Amoxicillin',
        Category: 'Antibiotic',
        Manufacturer: 'XYZ Labs',
        Unit: 'pcs',
        'Shelf Location': 'B2-03',
        'Min Stock Level': 30,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');

    // Set column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(wb, 'medicine_import_template.xlsx');
  };

  const validCount = parsedData.filter((m) => m.isValid).length;
  const invalidCount = parsedData.filter((m) => !m.isValid).length;

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setParsedData([]);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setOpen(isOpen);
  };

  const removeRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Medicines
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import multiple medicines at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-medium text-sm">Need a template?</p>
              <p className="text-xs text-muted-foreground">
                Download our Excel template with the correct column headers
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {fileName || 'Click to upload or drag and drop'}
              </span>
              <span className="text-xs text-muted-foreground">
                Supports Excel (.xlsx, .xls) and CSV files
              </span>
            </label>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {invalidCount} with errors
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Generic Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={!item.isValid ? 'bg-destructive/10' : ''}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{item.name || '-'}</TableCell>
                        <TableCell>{item.generic_name || '-'}</TableCell>
                        <TableCell>{item.category || '-'}</TableCell>
                        <TableCell>{item.manufacturer || '-'}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.min_stock_level}</TableCell>
                        <TableCell>
                          {item.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive">
                                {item.errors.join(', ')}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeRow(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {invalidCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {invalidCount} row(s) have errors and will be skipped during import.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isImporting}
          >
            {isImporting ? 'Importing...' : `Import ${validCount} Medicine${validCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
