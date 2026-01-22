import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddPrescription, useUpdatePrescription, CustomerPrescription } from '@/hooks/useCustomerPrescriptions';
import { useMedicines } from '@/hooks/useMedicines';
import { useLanguage } from '@/contexts/LanguageContext';
import { Pill, Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  prescription?: CustomerPrescription | null;
}

const FREQUENCY_OPTIONS = [
  { value: 'সকাল', label: 'সকাল' },
  { value: 'দুপুর', label: 'দুপুর' },
  { value: 'রাত', label: 'রাত' },
  { value: 'সকাল-রাত', label: 'সকাল-রাত' },
  { value: 'সকাল-দুপুর-রাত', label: 'সকাল-দুপুর-রাত' },
  { value: 'প্রয়োজনে', label: 'প্রয়োজনে' },
];

export function AddPrescriptionDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  prescription,
}: AddPrescriptionDialogProps) {
  const { t } = useLanguage();
  const addPrescription = useAddPrescription();
  const updatePrescription = useUpdatePrescription();
  const { medicines } = useMedicines();

  const [medicineName, setMedicineName] = useState(prescription?.medicine_name || '');
  const [dosage, setDosage] = useState(prescription?.dosage || '');
  const [frequency, setFrequency] = useState(prescription?.frequency || '');
  const [notes, setNotes] = useState(prescription?.notes || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isEditing = !!prescription;

  // Filter medicines based on search
  const filteredMedicines = medicines?.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10) || [];

  const handleSelectMedicine = (name: string) => {
    setMedicineName(name);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicineName.trim()) return;

    if (isEditing && prescription) {
      await updatePrescription.mutateAsync({
        id: prescription.id,
        customer_id: customerId,
        medicine_name: medicineName,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        notes: notes || undefined,
      });
    } else {
      await addPrescription.mutateAsync({
        customer_id: customerId,
        medicine_name: medicineName,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        notes: notes || undefined,
      });
    }

    // Reset form
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setNotes('');
    setSearchTerm('');
    onOpenChange(false);
  };

  const isLoading = addPrescription.isPending || updatePrescription.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            {isEditing 
              ? (t.customerDues?.editPrescription || 'প্রেসক্রিপশন সম্পাদনা')
              : (t.customerDues?.addPrescription || 'প্রেসক্রিপশন যোগ করুন')
            }
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{customerName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Name with Autocomplete */}
          <div className="space-y-2">
            <Label>{t.customerDues?.medicineName || 'ঔষধের নাম'} *</Label>
            <div className="relative">
              <Input
                value={medicineName || searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  if (medicineName) {
                    setMedicineName('');
                  }
                  setSearchTerm(value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t.customerDues?.searchMedicine || 'ঔষধ খুঁজুন বা টাইপ করুন...'}
                className="pr-8"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm && filteredMedicines.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                  <ScrollArea className="max-h-48">
                    {filteredMedicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                        onClick={() => handleSelectMedicine(medicine.name)}
                      >
                        <span className="font-medium">{medicine.name}</span>
                        {medicine.generic_name && (
                          <span className="text-muted-foreground ml-2">
                            ({medicine.generic_name})
                          </span>
                        )}
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            {searchTerm && !medicineName && (
              <p className="text-xs text-muted-foreground">
                {t.customerDues?.typeCustomName || 'নতুন ঔষধ যোগ করতে নাম লিখে Enter দিন'}
              </p>
            )}
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label>{t.customerDues?.dosage || 'ডোজ'}</Label>
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder={t.customerDues?.dosagePlaceholder || 'যেমন: ১০ মিগ্রা, ১ টা করে'}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>{t.customerDues?.frequency || 'কতবার খাবে'}</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder={t.customerDues?.selectFrequency || 'সিলেক্ট করুন'} />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t.customerDues?.prescriptionNotes || 'নোট'}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues?.prescriptionNotesPlaceholder || 'অতিরিক্ত তথ্য...'}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.actions?.cancel || 'বাতিল'}
            </Button>
            <Button
              type="submit"
              disabled={!medicineName.trim() && !searchTerm.trim() || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing
                ? (t.actions?.save || 'আপডেট')
                : (t.actions?.add || 'যোগ করুন')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
