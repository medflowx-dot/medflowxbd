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
import { useAddPrescription, useUpdatePrescription, CustomerPrescription } from '@/hooks/useCustomerPrescriptions';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Loader2, Stethoscope, Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface AddPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  prescription?: CustomerPrescription | null;
}

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

  const [doctorName, setDoctorName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  const isEditing = !!prescription;

  // Reset form when dialog opens/closes or prescription changes
  useEffect(() => {
    if (open) {
      if (prescription) {
        setDoctorName(prescription.doctor_name || '');
        setPrescriptionDate(new Date(prescription.prescription_date));
        setNotes(prescription.notes || '');
      } else {
        setDoctorName('');
        setPrescriptionDate(new Date());
        setNotes('');
      }
    }
  }, [open, prescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && prescription) {
      await updatePrescription.mutateAsync({
        id: prescription.id,
        customer_id: customerId,
        doctor_name: doctorName || undefined,
        prescription_date: prescriptionDate.toISOString().split('T')[0],
        notes: notes || undefined,
      });
    } else {
      await addPrescription.mutateAsync({
        customer_id: customerId,
        doctor_name: doctorName || undefined,
        prescription_date: prescriptionDate.toISOString().split('T')[0],
        notes: notes || undefined,
      });
    }

    onOpenChange(false);
  };

  const isLoading = addPrescription.isPending || updatePrescription.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isEditing 
              ? (t.customerDues?.editPrescription || 'প্রেসক্রিপশন সম্পাদনা')
              : (t.customerDues?.newPrescription || 'নতুন প্রেসক্রিপশন')
            }
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{customerName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              {t.customerDues?.doctorName || 'ডাক্তারের নাম'}
            </Label>
            <Input
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder={t.customerDues?.doctorNamePlaceholder || 'যেমন: ডা. মোহাম্মদ আলী'}
            />
          </div>

          {/* Prescription Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {t.customerDues?.prescriptionDate || 'প্রেসক্রিপশনের তারিখ'}
            </Label>
            <DatePicker
              date={prescriptionDate}
              onDateChange={(date) => date && setPrescriptionDate(date)}
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing
                ? (t.actions?.save || 'আপডেট')
                : (t.customerDues?.createAndAddMedicines || 'তৈরি করুন')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
