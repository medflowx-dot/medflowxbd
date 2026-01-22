import { useState } from 'react';
import { ArrowRightLeft, Building2, ArrowUpDown, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlternateBrands, MedicineReference } from '@/hooks/useMedicineReference';
import { cn } from '@/lib/utils';

interface AlternateBrandsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genericName: string | null;
  currentMedicineId?: string;
  currentStrength?: string | null;
}

type SortBy = 'price-asc' | 'price-desc' | 'name';

export function AlternateBrandsDialog({
  open,
  onOpenChange,
  genericName,
  currentMedicineId,
  currentStrength,
}: AlternateBrandsDialogProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<SortBy>('price-asc');
  const { data: brands, isLoading } = useAlternateBrands(genericName, currentMedicineId);

  // Filter by same strength if available
  const sameStrengthBrands = currentStrength
    ? brands?.filter(b => b.strength === currentStrength)
    : brands;

  const sortedBrands = [...(sameStrengthBrands || [])].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.unit_price || Infinity) - (b.unit_price || Infinity);
      case 'price-desc':
        return (b.unit_price || 0) - (a.unit_price || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Find cheapest price
  const cheapestPrice = sortedBrands.length > 0
    ? Math.min(...sortedBrands.filter(b => b.unit_price).map(b => b.unit_price!))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            {t.medicineReference?.alternateBrands || 'Alternate Brands'}
          </DialogTitle>
          {genericName && (
            <p className="text-sm text-muted-foreground mt-1">
              {genericName}
              {currentStrength && ` - ${currentStrength}`}
            </p>
          )}
        </DialogHeader>

        {/* Sort Options */}
        <div className="flex gap-2 pb-2">
          <Button
            variant={sortBy === 'price-asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price-asc')}
            className="gap-1"
          >
            <TrendingDown className="h-3 w-3" />
            {t.medicineReference?.priceLowHigh || 'Price ↑'}
          </Button>
          <Button
            variant={sortBy === 'price-desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price-desc')}
            className="gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            {t.medicineReference?.priceHighLow || 'Price ↓'}
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
            className="gap-1"
          >
            <ArrowUpDown className="h-3 w-3" />
            {t.medicineReference?.name || 'Name'}
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : sortedBrands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.medicineReference?.noAlternatesFound || 'No alternate brands found'}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBrands.map((brand, index) => {
                const isCheapest = brand.unit_price === cheapestPrice;
                
                return (
                  <div
                    key={brand.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      isCheapest && "bg-success/10 border-success/30"
                    )}
                  >
                    {/* Rank */}
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>

                    {/* Brand Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{brand.name}</p>
                        {isCheapest && (
                          <Badge variant="default" className="bg-success text-success-foreground text-xs">
                            {t.medicineReference?.cheapest || 'Cheapest'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        {brand.manufacturer_name || '-'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "font-bold",
                        isCheapest ? "text-success" : "text-foreground"
                      )}>
                        ৳{brand.unit_price?.toFixed(2) || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.medicineReference?.perUnit || '/unit'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {t.medicineReference?.showingBrands || 'Showing'} {sortedBrands.length} {t.medicineReference?.brands || 'brands'} |{' '}
          {t.medicineReference?.sortedBy || 'Sorted by'}: {
            sortBy === 'price-asc' ? (t.medicineReference?.priceLowHigh || 'Price (Low to High)') :
            sortBy === 'price-desc' ? (t.medicineReference?.priceHighLow || 'Price (High to Low)') :
            (t.medicineReference?.name || 'Name')
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
