import { Pill, Building2, ArrowRightLeft, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MedicineReference, useAlternateBrands } from '@/hooks/useMedicineReference';
import { cn } from '@/lib/utils';

interface MedicineResultCardProps {
  medicine: MedicineReference;
  onViewDetails: (medicine: MedicineReference) => void;
  onViewAlternates: (medicine: MedicineReference) => void;
}

export function MedicineResultCard({
  medicine,
  onViewDetails,
  onViewAlternates,
}: MedicineResultCardProps) {
  const { t } = useLanguage();
  const { data: alternateBrands } = useAlternateBrands(medicine.generic_name, medicine.id);
  
  const alternateCount = alternateBrands?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name & Price Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{medicine.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {medicine.generic_name || '-'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary">
                  ৳{medicine.unit_price?.toFixed(2) || '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.medicineReference?.perUnit || '/unit'}
                </p>
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {medicine.dosage_form || '-'}
              </Badge>
              {medicine.strength && (
                <Badge variant="outline" className="text-xs">
                  {medicine.strength}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {medicine.manufacturer_name || '-'}
              </span>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 flex-1"
                onClick={() => onViewDetails(medicine)}
              >
                <Eye className="h-3 w-3" />
                {t.medicineReference?.viewDetails || 'Details'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 flex-1"
                onClick={() => onViewAlternates(medicine)}
                disabled={alternateCount === 0}
              >
                <ArrowRightLeft className="h-3 w-3" />
                {t.medicineReference?.alternates || 'Alternates'}
                {alternateCount > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs ml-1">
                    {alternateCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
