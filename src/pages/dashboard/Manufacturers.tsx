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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function Manufacturers() {
  const { manufacturers, isLoading } = useManufacturers();
  const { manufacturers: globalManufacturers, isLoading: globalLoading, copyToLocal } = useGlobalManufacturers();
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const filteredGlobalManufacturers = globalManufacturers.filter(m =>
    m.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  // Check if a global manufacturer is already in local list
  const isAlreadyCopied = (globalMfr: GlobalManufacturer) => {
    return manufacturers.some(m => 
      m.name.toLowerCase() === globalMfr.name.toLowerCase()
    );
  };

  const handleCopy = async (manufacturer: GlobalManufacturer) => {
    if (isAlreadyCopied(manufacturer)) {
      toast.info('This manufacturer is already in your list');
      return;
    }
    await copyToLocal.mutateAsync(manufacturer);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Manufacturers</h1>
          <p className="text-muted-foreground mt-1">
            Manage manufacturer list for medicines
          </p>
        </div>
        <AddManufacturerDialog />
      </div>

      <Tabs defaultValue="my" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my" className="gap-2">
            <Building2 className="h-4 w-4" />
            My Manufacturers ({manufacturers.length})
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            Global Manufacturers ({globalManufacturers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Manufacturers
              </CardDescription>
              <CardTitle className="text-2xl">{manufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Manufacturers</CardTitle>
              <CardDescription>View and manage your manufacturers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search manufacturers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading manufacturers...
                </div>
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
                Available Global Manufacturers
              </CardDescription>
              <CardTitle className="text-2xl">{globalManufacturers.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Manufacturers</CardTitle>
              <CardDescription>
                Browse and copy manufacturers from the master list to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search global manufacturers..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {globalLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading global manufacturers...
                </div>
              ) : filteredGlobalManufacturers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No global manufacturers found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGlobalManufacturers.map((manufacturer) => {
                        const alreadyCopied = isAlreadyCopied(manufacturer);
                        return (
                          <TableRow key={manufacturer.id}>
                            <TableCell className="font-medium">{manufacturer.name}</TableCell>
                            <TableCell>
                              <Button
                                variant={alreadyCopied ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleCopy(manufacturer)}
                                disabled={copyToLocal.isPending || alreadyCopied}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {alreadyCopied ? 'Added' : 'Copy'}
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
