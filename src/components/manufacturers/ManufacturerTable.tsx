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

interface ManufacturerTableProps {
  manufacturers: Manufacturer[];
  searchTerm: string;
}

export function ManufacturerTable({ manufacturers, searchTerm }: ManufacturerTableProps) {
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
        <h3 className="font-semibold text-lg">No manufacturers found</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {searchTerm
            ? 'Try adjusting your search term.'
            : 'Add your first manufacturer to get started.'}
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
              <TableHead>Company</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
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
                            Edit
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(manufacturer.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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
            <AlertDialogTitle>Delete Manufacturer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manufacturer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
