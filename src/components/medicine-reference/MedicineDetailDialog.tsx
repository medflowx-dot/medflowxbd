import { useState } from 'react';
import { 
  Pill, Building2, FlaskConical, Package, IndianRupee, Info, ArrowRightLeft,
  Syringe, AlertTriangle, Heart, Baby, Stethoscope, ShieldAlert, Beaker,
  FileWarning, Archive, BookOpen
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { MedicineReference, useAvailableForms, useAlternateBrands } from '@/hooks/useMedicineReference';
import { AlternateBrandsDialog } from './AlternateBrandsDialog';

interface MedicineDetailDialogProps {
  medicine: MedicineReference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper component for detail sections
function DetailSection({ 
  icon: Icon, 
  title, 
  content, 
  variant = 'default' 
}: { 
  icon: React.ElementType; 
  title: string; 
  content: string | null; 
  variant?: 'default' | 'warning' | 'danger';
}) {
  if (!content) return null;
  
  const bgColors = {
    default: 'bg-muted/50',
    warning: 'bg-amber-500/10',
    danger: 'bg-destructive/10',
  };
  
  const iconColors = {
    default: 'text-muted-foreground',
    warning: 'text-amber-600',
    danger: 'text-destructive',
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
        {title}
      </p>
      <div className={`text-sm ${bgColors[variant]} p-3 rounded-lg whitespace-pre-wrap`}>
        {content}
      </div>
    </div>
  );
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
  
  // Check if we have any clinical data to show
  const hasClinicalData = !!(
    medicine.pharmacology || 
    medicine.mode_of_action || 
    medicine.dosage_adult || 
    medicine.dosage_pediatric || 
    medicine.administration
  );
  
  const hasSafetyData = !!(
    medicine.contraindications || 
    medicine.side_effects || 
    medicine.precautions || 
    medicine.drug_interactions || 
    medicine.overdose_info ||
    medicine.pregnancy_category ||
    medicine.lactation_info
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-primary" />
              {medicine.name}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {medicine.generic_name && (
                <span className="flex items-center gap-1">
                  <FlaskConical className="h-3 w-3" />
                  {medicine.generic_name}
                </span>
              )}
              {medicine.manufacturer_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {medicine.manufacturer_name}
                </span>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs">
                  {t.medicineReference?.overview || 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="dosage" className="text-xs" disabled={!hasClinicalData}>
                  {t.medicineReference?.dosage || 'Dosage'}
                </TabsTrigger>
                <TabsTrigger value="safety" className="text-xs" disabled={!hasSafetyData}>
                  {t.medicineReference?.safety || 'Safety'}
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[50vh] px-6 pb-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                  {medicine.drug_class && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        {t.medicineReference?.drugClass || 'Drug Class'}
                      </p>
                      <Badge variant="outline">{medicine.drug_class}</Badge>
                    </div>
                  )}
                  {medicine.therapeutic_class && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        {t.medicineReference?.therapeuticClass || 'Therapeutic Class'}
                      </p>
                      <Badge variant="outline">{medicine.therapeutic_class}</Badge>
                    </div>
                  )}
                </div>

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
                <DetailSection
                  icon={Info}
                  title={t.medicineReference?.indication || 'Indication'}
                  content={medicine.indication}
                />

                {/* Pharmacology */}
                <DetailSection
                  icon={Beaker}
                  title={t.medicineReference?.pharmacology || 'Pharmacology'}
                  content={medicine.pharmacology}
                />

                {/* Mode of Action */}
                <DetailSection
                  icon={BookOpen}
                  title={t.medicineReference?.modeOfAction || 'Mode of Action'}
                  content={medicine.mode_of_action}
                />

                {/* Storage */}
                {medicine.storage && (
                  <DetailSection
                    icon={Archive}
                    title={t.medicineReference?.storage || 'Storage'}
                    content={medicine.storage}
                  />
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
              </TabsContent>

              {/* Dosage Tab */}
              <TabsContent value="dosage" className="mt-4 space-y-4">
                <DetailSection
                  icon={Syringe}
                  title={t.medicineReference?.dosageAdult || 'Adult Dosage'}
                  content={medicine.dosage_adult}
                />
                
                <DetailSection
                  icon={Baby}
                  title={t.medicineReference?.dosagePediatric || 'Pediatric Dosage'}
                  content={medicine.dosage_pediatric}
                />
                
                <DetailSection
                  icon={Stethoscope}
                  title={t.medicineReference?.administration || 'Administration'}
                  content={medicine.administration}
                />
                
                {!hasClinicalData && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Syringe className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>{t.medicineReference?.noDosingInfo || 'No dosing information available'}</p>
                  </div>
                )}
              </TabsContent>

              {/* Safety Tab */}
              <TabsContent value="safety" className="mt-4 space-y-4">
                <DetailSection
                  icon={ShieldAlert}
                  title={t.medicineReference?.contraindications || 'Contraindications'}
                  content={medicine.contraindications}
                  variant="danger"
                />
                
                <DetailSection
                  icon={AlertTriangle}
                  title={t.medicineReference?.sideEffects || 'Side Effects'}
                  content={medicine.side_effects}
                  variant="warning"
                />
                
                <DetailSection
                  icon={FileWarning}
                  title={t.medicineReference?.precautions || 'Precautions'}
                  content={medicine.precautions}
                  variant="warning"
                />
                
                <DetailSection
                  icon={AlertTriangle}
                  title={t.medicineReference?.drugInteractions || 'Drug Interactions'}
                  content={medicine.drug_interactions}
                  variant="warning"
                />
                
                {medicine.overdose_info && (
                  <DetailSection
                    icon={ShieldAlert}
                    title={t.medicineReference?.overdoseInfo || 'Overdose'}
                    content={medicine.overdose_info}
                    variant="danger"
                  />
                )}
                
                {/* Pregnancy & Lactation */}
                {(medicine.pregnancy_category || medicine.lactation_info) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      {t.medicineReference?.pregnancyLactation || 'Pregnancy & Lactation'}
                    </p>
                    <div className="bg-pink-500/10 p-3 rounded-lg space-y-2">
                      {medicine.pregnancy_category && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background">
                            {t.medicineReference?.category || 'Category'} {medicine.pregnancy_category}
                          </Badge>
                        </div>
                      )}
                      {medicine.lactation_info && (
                        <p className="text-sm">{medicine.lactation_info}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {!hasSafetyData && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>{t.medicineReference?.noSafetyInfo || 'No safety information available'}</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="border-t p-4">
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
