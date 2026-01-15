import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Phone, Search, Users } from 'lucide-react';
import { useManufacturers } from '@/hooks/useManufacturers';
import { AddManufacturerDialog } from '@/components/manufacturers/AddManufacturerDialog';
import { ManufacturerTable } from '@/components/manufacturers/ManufacturerTable';

export default function Manufacturers() {
  const { manufacturers, isLoading } = useManufacturers();
  const [searchTerm, setSearchTerm] = useState('');

  const withPhone = manufacturers.filter((m) => m.phone).length;
  const withEmail = manufacturers.filter((m) => m.email).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Manufacturers</h1>
          <p className="text-muted-foreground mt-1">
            Manage manufacturer contacts for stock orders
          </p>
        </div>
        <AddManufacturerDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              With Phone Number
            </CardDescription>
            <CardTitle className="text-2xl">{withPhone}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              With Contact Person
            </CardDescription>
            <CardTitle className="text-2xl">
              {manufacturers.filter((m) => m.contact_person).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Manufacturers</CardTitle>
          <CardDescription>View and manage your manufacturer contacts</CardDescription>
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
    </div>
  );
}
