import { useState, useMemo } from 'react';
import { Book, Pill, FlaskConical, Building2, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useMedicineReference,
  useMedicineReferenceStats,
  MedicineReference as MedicineReferenceType,
} from '@/hooks/useMedicineReference';
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
  
  // Dialog State
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineReferenceType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [alternatesOpen, setAlternatesOpen] = useState(false);
  
  // Data
  const { data: stats, isLoading: statsLoading } = useMedicineReferenceStats();
  const { data: medicines, isLoading: medicinesLoading } = useMedicineReference({
    search,
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
    setDosageForm('all');
    setDrugClass('all');
    setManufacturer('all');
  };

  const hasFilters = search || dosageForm !== 'all' || drugClass !== 'all' || manufacturer !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Book className="h-6 w-6 text-primary" />
          {t.medicineReference?.title || 'Medicine Reference'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.medicineReference?.subtitle || 'Search medicine prices, generics, and alternate brands'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalMedicines.toLocaleString() || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t.medicineReference?.totalMedicines || 'Total Medicines'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-info" />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalGenerics.toLocaleString() || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t.medicineReference?.totalGenerics || 'Generics'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalManufacturers || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t.medicineReference?.manufacturers || 'Manufacturers'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t.medicineReference?.searchTitle || 'Search Medicines'}
          </CardTitle>
          <CardDescription>
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
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {medicinesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <p className="text-muted-foreground mt-1">
                {t.medicineReference?.noResultsDesc || 'Try adjusting your search or filters'}
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
