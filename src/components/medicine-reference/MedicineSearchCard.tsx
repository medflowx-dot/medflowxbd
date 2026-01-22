import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMedicineReferenceFilters } from '@/hooks/useMedicineReference';
import { cn } from '@/lib/utils';

interface MedicineSearchCardProps {
  search: string;
  onSearchChange: (value: string) => void;
  dosageForm: string;
  onDosageFormChange: (value: string) => void;
  drugClass: string;
  onDrugClassChange: (value: string) => void;
  manufacturer: string;
  onManufacturerChange: (value: string) => void;
  onClearFilters: () => void;
}

export function MedicineSearchCard({
  search,
  onSearchChange,
  dosageForm,
  onDosageFormChange,
  drugClass,
  onDrugClassChange,
  manufacturer,
  onManufacturerChange,
  onClearFilters,
}: MedicineSearchCardProps) {
  const { t } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { dosageForms, drugClasses, manufacturers, isLoading } = useMedicineReferenceFilters();

  const hasActiveFilters = dosageForm !== 'all' || drugClass !== 'all' || manufacturer !== 'all';
  const activeFilterCount = [dosageForm, drugClass, manufacturer].filter(f => f !== 'all').length;

  const popularSearches = ['Napa', 'Seclo', 'Zimax', 'Ace Plus', 'Omidon', 'Monas'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.medicineReference?.searchPlaceholder || 'Search medicine name or generic...'}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-10 h-12 text-base"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Popular Searches (when no search) */}
      {!search && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t.medicineReference?.popularSearches || 'Popular:'}
          </span>
          {popularSearches.map((term) => (
            <Badge
              key={term}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => onSearchChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>
      )}

      {/* Filters Collapsible */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {t.medicineReference?.filters || 'Filters'}
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              {t.medicineReference?.clearFilters || 'Clear'}
            </Button>
          )}
        </div>

        <CollapsibleContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dosage Form */}
            <Select value={dosageForm} onValueChange={onDosageFormChange}>
              <SelectTrigger className={cn(dosageForm !== 'all' && 'border-primary')}>
                <SelectValue placeholder={t.medicineReference?.allForms || 'All Forms'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.medicineReference?.allForms || 'All Forms'}</SelectItem>
                {dosageForms.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Drug Class */}
            <Select value={drugClass} onValueChange={onDrugClassChange}>
              <SelectTrigger className={cn(drugClass !== 'all' && 'border-primary')}>
                <SelectValue placeholder={t.medicineReference?.allClasses || 'All Classes'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.medicineReference?.allClasses || 'All Classes'}</SelectItem>
                {drugClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manufacturer */}
            <Select value={manufacturer} onValueChange={onManufacturerChange}>
              <SelectTrigger className={cn(manufacturer !== 'all' && 'border-primary')}>
                <SelectValue placeholder={t.medicineReference?.allManufacturers || 'All Manufacturers'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.medicineReference?.allManufacturers || 'All Manufacturers'}</SelectItem>
                {manufacturers.map((mfg) => (
                  <SelectItem key={mfg} value={mfg}>
                    {mfg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
