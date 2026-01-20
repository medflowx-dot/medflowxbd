import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Search, Copy, Globe } from 'lucide-react';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useGlobalManufacturers, GlobalManufacturer } from '@/hooks/useGlobalManufacturers';
import { AddManufacturerDialog } from '@/components/manufacturers/AddManufacturerDialog';
import { ManufacturerTable } from '@/components/manufacturers/ManufacturerTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Manufacturers() {
  const { t } = useLanguage();
  const { manufacturers, isLoading } = useManufacturers();
  const { manufacturers: globalManufacturers, isLoading: globalLoading, copyToLocal, bulkCopyToLocal } = useGlobalManufacturers();
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredGlobalManufacturers = globalManufacturers.filter(m =>
    m.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const isAlreadyCopied = (globalMfr: GlobalManufacturer) => {
    return manufacturers.some(m => m.name.toLowerCase() === globalMfr.name.toLowerCase());
  };

  // Get manufacturers that can be copied (not already in local list)
  const copyableManufacturers = filteredGlobalManufacturers.filter(m => !isAlreadyCopied(m));
  const allCopyableSelected = copyableManufacturers.length > 0 && 
    copyableManufacturers.every(m => selectedIds.has(m.id));

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (allCopyableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(copyableManufacturers.map(m => m.id)));
    }
  };

  const handleCopy = async (manufacturer: GlobalManufacturer) => {
    if (isAlreadyCopied(manufacturer)) {
      toast.info(t.manufacturers.alreadyInList);
      return;
    }
    await copyToLocal.mutateAsync(manufacturer);
  };

  const handleBulkCopy = async () => {
    const selectedManufacturers = globalManufacturers.filter(m => 
      selectedIds.has(m.id) && !isAlreadyCopied(m)
    );
    if (selectedManufacturers.length === 0) {
      toast.info(t.manufacturers.noNewSelected);
      return;
    }
    await bulkCopyToLocal.mutateAsync(selectedManufacturers);
    setSelectedIds(new Set());
  };

  const selectedCount = Array.from(selectedIds).filter(id => {
    const mfr = globalManufacturers.find(m => m.id === id);
    return mfr && !isAlreadyCopied(mfr);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.manufacturers.title}</h1>
            <p className="text-muted-foreground mt-1">{t.manufacturers.subtitle}</p>
          </div>
        </div>
        <AddManufacturerDialog />
      </div>

      <Tabs defaultValue="my" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger 
            value="my" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground"
          >
            <Building2 className="h-4 w-4" />
            {t.manufacturers.myManufacturers} ({manufacturers.length})
          </TabsTrigger>
          <TabsTrigger 
            value="global" 
            className="gap-2 data-[state=active]:bg-info data-[state=active]:text-info-foreground"
          >
            <Globe className="h-4 w-4" />
            {t.manufacturers.globalManufacturers} ({globalManufacturers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-6 animate-card-enter">
          <Card className="stat-card-info">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="icon-container-info">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                {t.manufacturers.totalManufacturers}
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{manufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
              <div className="flex items-center gap-3">
                <div className="icon-container-info">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>{t.manufacturers.myManufacturers}</CardTitle>
                  <CardDescription>{t.manufacturers.viewAndManage}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.manufacturers.searchManufacturers} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">{t.manufacturers.loadingManufacturers}</div>
              ) : (
                <ManufacturerTable manufacturers={manufacturers} searchTerm={searchTerm} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-6 animate-card-enter">
          <Card className="stat-card-sales">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <div className="icon-container-success">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                {t.manufacturers.availableGlobal}
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{globalManufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-container-success">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>{t.manufacturers.globalManufacturers}</CardTitle>
                    <CardDescription>{t.manufacturers.browseAndCopy}</CardDescription>
                  </div>
                </div>
                {selectedCount > 0 && (
                  <Button 
                    onClick={handleBulkCopy} 
                    disabled={bulkCopyToLocal.isPending}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {bulkCopyToLocal.isPending ? t.manufacturers.copying : `${t.manufacturers.copySelected} (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.manufacturers.searchGlobalManufacturers} value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-9" />
              </div>

              {globalLoading ? (
                <div className="py-8 text-center text-muted-foreground">{t.manufacturers.loading}</div>
              ) : filteredGlobalManufacturers.length === 0 ? (
                <div className="py-10 text-center rounded-xl bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-dashed border-teal-200 dark:border-teal-800/50">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-teal-500" />
                  </div>
                  <p className="text-muted-foreground">{t.manufacturers.noGlobalFound}</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allCopyableSelected && copyableManufacturers.length > 0}
                            onCheckedChange={toggleSelectAll}
                            disabled={copyableManufacturers.length === 0}
                          />
                        </TableHead>
                        <TableHead>{t.manufacturers.companyName}</TableHead>
                        <TableHead className="w-[120px]">{t.manufacturers.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGlobalManufacturers.map((manufacturer) => {
                        const alreadyCopied = isAlreadyCopied(manufacturer);
                        return (
                          <TableRow key={manufacturer.id} className="hover:bg-muted/30">
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(manufacturer.id)}
                                onCheckedChange={() => toggleSelect(manufacturer.id)}
                                disabled={alreadyCopied}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{manufacturer.name}</TableCell>
                            <TableCell>
                              {alreadyCopied ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/50 dark:to-teal-900/50 dark:text-emerald-300">
                                  ✓ {t.manufacturers.added}
                                </span>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopy(manufacturer)}
                                  disabled={copyToLocal.isPending}
                                  className="hover:bg-gradient-to-r hover:from-teal-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {t.manufacturers.copy}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
