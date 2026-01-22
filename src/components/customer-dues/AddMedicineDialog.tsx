import { useState, useEffect } from 'react';
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
import { 
  useAddPrescriptionMedicine, 
  useUpdatePrescriptionMedicine, 
  PrescriptionMedicine 
} from '@/hooks/useCustomerPrescriptions';
import { useMedicines } from '@/hooks/useMedicines';
import { useLanguage } from '@/contexts/LanguageContext';
import { Pill, Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  prescriptionId: string;
  medicine?: PrescriptionMedicine | null;
}

const FREQUENCY_OPTIONS = [
  { value: 'সকাল', label: 'সকাল' },
  { value: 'দুপুর', label: 'দুপুর' },
  { value: 'রাত', label: 'রাত' },
  { value: 'সকাল-রাত', label: 'সকাল-রাত' },
  { value: 'সকাল-দুপুর-রাত', label: 'সকাল-দুপুর-রাত' },
  { value: 'প্রয়োজনে', label: 'প্রয়োজনে' },
];

const DURATION_OPTIONS = [
  { value: '৭ দিন', label: '৭ দিন' },
  { value: '১৫ দিন', label: '১৫ দিন' },
  { value: '১ মাস', label: '১ মাস' },
  { value: '৩ মাস', label: '৩ মাস' },
  { value: 'চলমান', label: 'চলমান (নিয়মিত)' },
];

export function AddMedicineDialog({
  open,
  onOpenChange,
  customerId,
  prescriptionId,
  medicine,
}: AddMedicineDialogProps) {
  const { t } = useLanguage();
  const addMedicine = useAddPrescriptionMedicine();
  const updateMedicine = useUpdatePrescriptionMedicine();
  const { medicines: inventoryMedicines } = useMedicines();

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isEditing = !!medicine;

  // Reset form when dialog opens/closes or medicine changes
  useEffect(() => {
    if (open) {
      if (medicine) {
        setMedicineName(medicine.medicine_name);
        setDosage(medicine.dosage || '');
        setFrequency(medicine.frequency || '');
        setDuration(medicine.duration || '');
        setNotes(medicine.notes || '');
      } else {
        setMedicineName('');
        setDosage('');
        setFrequency('');
        setDuration('');
        setNotes('');
      }
      setSearchTerm('');
      setShowSuggestions(false);
    }
  }, [open, medicine]);

  // Filter medicines based on search
  const filteredMedicines = inventoryMedicines?.filter(m =>
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
    
    const name = medicineName || searchTerm.trim();
    if (!name) return;

    if (isEditing && medicine) {
      await updateMedicine.mutateAsync({
        id: medicine.id,
        customer_id: customerId,
        medicine_name: name,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        duration: duration || undefined,
        notes: notes || undefined,
      });
    } else {
      await addMedicine.mutateAsync({
        customer_id: customerId,
        prescription_id: prescriptionId,
        medicine_name: name,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        duration: duration || undefined,
        notes: notes || undefined,
      });
    }

    // Reset and close
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setNotes('');
    setSearchTerm('');
    onOpenChange(false);
  };

  const isLoading = addMedicine.isPending || updateMedicine.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            {isEditing 
              ? (t.customerDues?.editMedicine || 'ঔষধ সম্পাদনা')
              : (t.customerDues?.addMedicine || 'ঔষধ যোগ করুন')
            }
          </DialogTitle>
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
                    {filteredMedicines.map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                        onClick={() => handleSelectMedicine(med.name)}
                      >
                        <span className="font-medium">{med.name}</span>
                        {med.generic_name && (
                          <span className="text-muted-foreground ml-2">
                            ({med.generic_name})
                          </span>
                        )}
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
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

          {/* Duration */}
          <div className="space-y-2">
            <Label>{t.customerDues?.duration || 'কতদিন খাবে'}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder={t.customerDues?.selectDuration || 'সিলেক্ট করুন'} />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t.customerDues?.medicineNotes || 'নোট'}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDues?.medicineNotesPlaceholder || 'বিশেষ নির্দেশনা...'}
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
              disabled={(!medicineName && !searchTerm.trim()) || isLoading}
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
