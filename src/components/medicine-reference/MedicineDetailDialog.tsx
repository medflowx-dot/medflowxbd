import { useState } from 'react';
import { Pill, Building2, FlaskConical, Package, IndianRupee, Info, ArrowRightLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { MedicineReference, useAvailableForms, useAlternateBrands } from '@/hooks/useMedicineReference';
import { AlternateBrandsDialog } from './AlternateBrandsDialog';
import { cn } from '@/lib/utils';

interface MedicineDetailDialogProps {
  medicine: MedicineReference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicineDetailDialog({
  medicine,
  open,
  onOpenChange,
}: MedicineDetailDialogProps) {
  const { t } = useLanguage();
  const [showAlternates, setShowAlternates] = useState(false);
  
  const { data: availableForms } = useAvailableForms(medicine?.generic_name || null, medicine?.dosage_form || undefined);
  const { data: alternateBrands } = useAlternateBrands(medicine?.generic_name || null, medicine?.id);

  if (!medicine) return null;

  const alternateCount = alternateBrands?.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {medicine.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  {t.medicineReference?.generic || 'Generic Name'}
                </p>
                <p className="font-medium">{medicine.generic_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  {t.medicineReference?.manufacturer || 'Manufacturer'}
                </p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {medicine.manufacturer_name || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  {t.medicineReference?.dosageForm || 'Dosage Form'}
                </p>
                <Badge variant="secondary">{medicine.dosage_form || '-'}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  {t.medicineReference?.strength || 'Strength'}
                </p>
                <p className="font-medium">{medicine.strength || '-'}</p>
              </div>
            </div>

            {medicine.drug_class && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <FlaskConical className="h-3 w-3" />
                  {t.medicineReference?.drugClass || 'Drug Class'}
                </p>
                <Badge variant="outline">{medicine.drug_class}</Badge>
              </div>
            )}

            <Separator />

            {/* Price Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">
                    {t.medicineReference?.priceInfo || 'Price Information'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ৳{medicine.unit_price?.toFixed(2) || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.medicineReference?.perUnit || 'Per Unit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ৳{medicine.strip_price?.toFixed(2) || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.medicineReference?.perStrip || 'Per Strip'}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-muted-foreground">
                      {medicine.pack_size || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.medicineReference?.packSize || 'Pack Size'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indication */}
            {medicine.indication && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  {t.medicineReference?.indication || 'Indication'}
                </p>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {medicine.indication}
                </p>
              </div>
            )}

            {/* Available Forms */}
            {availableForms && availableForms.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t.medicineReference?.alsoAvailableAs || 'Also Available As'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableForms
                    .filter(f => f.form !== medicine.dosage_form)
                    .map((formGroup) => (
                      <Badge
                        key={formGroup.form}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        {formGroup.form}
                        {formGroup.medicines.length > 1 && ` (${formGroup.medicines.length})`}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Alternate Brands Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAlternates(true)}
              disabled={alternateCount === 0}
            >
              <ArrowRightLeft className="h-4 w-4" />
              {t.medicineReference?.viewAlternateBrands || 'View Alternate Brands'}
              {alternateCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {alternateCount}
                </Badge>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlternateBrandsDialog
        open={showAlternates}
        onOpenChange={setShowAlternates}
        genericName={medicine.generic_name}
        currentMedicineId={medicine.id}
        currentStrength={medicine.strength}
      />
    </>
  );
}
