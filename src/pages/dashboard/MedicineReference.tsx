import { useState, useEffect } from 'react';
import { Book, Pill, Search, Loader2, Globe, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useMedicineReference,
  MedicineReference as MedicineReferenceType,
} from '@/hooks/useMedicineReference';
import { useFetchFromMedEx } from '@/hooks/useFetchFromMedEx';
import {
  MedicineSearchCard,
  MedicineDetailDialog,
  AlternateBrandsDialog,
  MedicineResultCard,
} from '@/components/medicine-reference';

export default function MedicineReference() {
  const { t } = useLanguage();
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [dosageForm, setDosageForm] = useState('all');
  const [drugClass, setDrugClass] = useState('all');
  const [manufacturer, setManufacturer] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Dialog State
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineReferenceType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [alternatesOpen, setAlternatesOpen] = useState(false);
  
  // MedEx Fetch
  const { fetchFromMedEx, isFetching, lastFetchedTerm } = useFetchFromMedEx();
  
  // Debounce search for auto-fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Data
  const { data: medicines, isLoading: medicinesLoading, refetch } = useMedicineReference({
    search: debouncedSearch,
    dosageForm,
    drugClass,
    manufacturer,
    limit: 100,
  });

  const handleViewDetails = (medicine: MedicineReferenceType) => {
    setSelectedMedicine(medicine);
    setDetailOpen(true);
  };

  const handleViewAlternates = (medicine: MedicineReferenceType) => {
    setSelectedMedicine(medicine);
    setAlternatesOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDosageForm('all');
    setDrugClass('all');
    setManufacturer('all');
  };

  const handleFetchFromMedEx = () => {
    if (search.trim()) {
      fetchFromMedEx(search.trim());
    }
  };

  const hasFilters = debouncedSearch || dosageForm !== 'all' || drugClass !== 'all' || manufacturer !== 'all';
  const showNoResults = hasFilters && medicines && medicines.length === 0 && !medicinesLoading;
  const canFetchFromMedEx = search.trim().length >= 2 && !isFetching;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          {t.medicineReference?.title || 'Medicine Reference'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.medicineReference?.subtitle || 'Search medicine prices, generics, and alternate brands'}
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t.medicineReference?.searchTitle || 'Search Medicines'}
          </CardTitle>
          <CardDescription className="text-xs">
            {t.medicineReference?.searchDescription || 'Find medicine by name, generic, or filter by form and manufacturer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicineSearchCard
            search={search}
            onSearchChange={setSearch}
            dosageForm={dosageForm}
            onDosageFormChange={setDosageForm}
            drugClass={drugClass}
            onDrugClassChange={setDrugClass}
            manufacturer={manufacturer}
            onManufacturerChange={setManufacturer}
            onClearFilters={handleClearFilters}
          />
          
          {/* Fetch from MedEx Button - show when searching */}
          {search.trim().length >= 2 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchFromMedEx}
                disabled={!canFetchFromMedEx}
                className="w-full sm:w-auto gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MedEx থেকে খুঁজছে...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    MedEx থেকে "{search}" আনুন
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                ডাটাবেসে না পেলে MedEx থেকে সরাসরি তথ্য আনতে পারবেন
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {medicinesLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {isFetching && (
              <p className="text-sm text-muted-foreground">MedEx থেকে তথ্য আনা হচ্ছে...</p>
            )}
          </div>
        ) : !hasFilters ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">
                {t.medicineReference?.startSearching || 'Start Searching'}
              </h3>
              <p className="text-muted-foreground mt-1">
                {t.medicineReference?.searchPrompt || 'Type a medicine name or use filters to find medicines'}
              </p>
            </CardContent>
          </Card>
        ) : medicines && medicines.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t.medicineReference?.showingResults || 'Showing'} {medicines.length} {t.medicineReference?.results || 'results'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {medicines.map((medicine) => (
                <MedicineResultCard
                  key={medicine.id}
                  medicine={medicine}
                  onViewDetails={handleViewDetails}
                  onViewAlternates={handleViewAlternates}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">
                {t.medicineReference?.noResults || 'No Medicines Found'}
              </h3>
              <p className="text-muted-foreground mt-1 mb-4">
                "{search}" ডাটাবেসে পাওয়া যায়নি
              </p>
              
              {/* Prominent MedEx fetch button when no results */}
              <Button
                onClick={handleFetchFromMedEx}
                disabled={!canFetchFromMedEx}
                className="gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MedEx থেকে খুঁজছে...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    MedEx থেকে "{search}" আনুন
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                MedEx.com.bd থেকে সরাসরি ওষুধের তথ্য ডাউনলোড করুন
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <MedicineDetailDialog
        medicine={selectedMedicine}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AlternateBrandsDialog
        open={alternatesOpen}
        onOpenChange={setAlternatesOpen}
        genericName={selectedMedicine?.generic_name || null}
        currentMedicineId={selectedMedicine?.id}
        currentStrength={selectedMedicine?.strength}
      />
    </div>
  );
}
