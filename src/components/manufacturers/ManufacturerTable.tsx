import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Pencil, Trash2, Building2 } from 'lucide-react';
import { Manufacturer, useManufacturers } from '@/hooks/useManufacturers';
import { AddManufacturerDialog } from './AddManufacturerDialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ManufacturerTableProps {
  manufacturers: Manufacturer[];
  searchTerm: string;
}

export function ManufacturerTable({ manufacturers, searchTerm }: ManufacturerTableProps) {
  const { t } = useLanguage();
  const { deleteManufacturer } = useManufacturers();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredManufacturers = manufacturers.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteManufacturer.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (filteredManufacturers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{t.manufacturers.noManufacturersFound}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {searchTerm
            ? t.manufacturers.tryAdjustingSearch
            : t.manufacturers.addFirstManufacturer}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.manufacturers.company}</TableHead>
              <TableHead className="w-[80px]">{t.manufacturers.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManufacturers.map((manufacturer) => (
              <TableRow key={manufacturer.id}>
                <TableCell>
                  <div className="font-medium">{manufacturer.name}</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AddManufacturerDialog
                        manufacturer={manufacturer}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t.manufacturers.edit}
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(manufacturer.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.manufacturers.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.manufacturers.deleteManufacturer}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.manufacturers.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.actions.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
