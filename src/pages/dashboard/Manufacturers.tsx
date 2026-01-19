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
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.manufacturers.title}</h1>
          <p className="text-muted-foreground mt-1">{t.manufacturers.subtitle}</p>
        </div>
        <AddManufacturerDialog />
      </div>

      <Tabs defaultValue="my" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t.manufacturers.myManufacturers} ({manufacturers.length})
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            {t.manufacturers.globalManufacturers} ({globalManufacturers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t.manufacturers.totalManufacturers}
              </CardDescription>
              <CardTitle className="text-2xl">{manufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.manufacturers.myManufacturers}</CardTitle>
              <CardDescription>{t.manufacturers.viewAndManage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t.manufacturers.availableGlobal}
              </CardDescription>
              <CardTitle className="text-2xl">{globalManufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.manufacturers.globalManufacturers}</CardTitle>
                  <CardDescription>{t.manufacturers.browseAndCopy}</CardDescription>
                </div>
                {selectedCount > 0 && (
                  <Button onClick={handleBulkCopy} disabled={bulkCopyToLocal.isPending}>
                    <Copy className="h-4 w-4 mr-2" />
                    {bulkCopyToLocal.isPending ? t.manufacturers.copying : `${t.manufacturers.copySelected} (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.manufacturers.searchGlobalManufacturers} value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="pl-9" />
              </div>

              {globalLoading ? (
                <div className="py-8 text-center text-muted-foreground">{t.manufacturers.loading}</div>
              ) : filteredGlobalManufacturers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>{t.manufacturers.noGlobalFound}</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                          <TableRow key={manufacturer.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(manufacturer.id)}
                                onCheckedChange={() => toggleSelect(manufacturer.id)}
                                disabled={alreadyCopied}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{manufacturer.name}</TableCell>
                            <TableCell>
                              <Button
                                variant={alreadyCopied ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleCopy(manufacturer)}
                                disabled={copyToLocal.isPending || alreadyCopied}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {alreadyCopied ? t.manufacturers.added : t.manufacturers.copy}
                              </Button>
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
