import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pill, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useCustomerPrescriptions,
  useDeletePrescription,
  useTogglePrescriptionStatus,
  CustomerPrescription,
} from '@/hooks/useCustomerPrescriptions';
import { AddPrescriptionDialog } from './AddPrescriptionDialog';

interface CustomerPrescriptionsProps {
  customerId: string;
  customerName: string;
}

export function CustomerPrescriptions({ customerId, customerName }: CustomerPrescriptionsProps) {
  const { t } = useLanguage();
  const { data: prescriptions, isLoading } = useCustomerPrescriptions(customerId);
  const deletePrescription = useDeletePrescription();
  const toggleStatus = useTogglePrescriptionStatus();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editPrescription, setEditPrescription] = useState<CustomerPrescription | null>(null);

  const activePrescriptions = prescriptions?.filter(p => p.is_active) || [];
  const inactivePrescriptions = prescriptions?.filter(p => !p.is_active) || [];

  const handleEdit = (prescription: CustomerPrescription) => {
    setEditPrescription(prescription);
    setAddDialogOpen(true);
  };

  const handleAddClose = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setEditPrescription(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">
            {t.customerDues?.prescriptionMedicines || 'নিয়মিত ঔষধ'}
          </h3>
          {activePrescriptions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activePrescriptions.length}
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t.customerDues?.addMedicine || 'ঔষধ যোগ করুন'}
        </Button>
      </div>

      {/* Prescriptions List */}
      {prescriptions?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
          <Pill className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>{t.customerDues?.noPrescriptions || 'কোনো প্রেসক্রিপশন ঔষধ নেই'}</p>
          <p className="text-sm mt-1">{t.customerDues?.addPrescriptionHint || 'কাস্টমারের নিয়মিত ঔষধ যোগ করুন'}</p>
        </div>
      ) : (
        <ScrollArea className="h-[280px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.customerDues?.medicineName || 'ঔষধ'}</TableHead>
                <TableHead>{t.customerDues?.dosage || 'ডোজ'}</TableHead>
                <TableHead>{t.customerDues?.frequency || 'সময়'}</TableHead>
                <TableHead className="text-center">{t.customerDues?.status || 'স্ট্যাটাস'}</TableHead>
                <TableHead className="text-right w-28">{t.medicines?.actions || 'অ্যাকশন'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Active prescriptions first */}
              {activePrescriptions.map((prescription) => (
                <PrescriptionRow
                  key={prescription.id}
                  prescription={prescription}
                  customerId={customerId}
                  onEdit={handleEdit}
                  onDelete={() => deletePrescription.mutate({ id: prescription.id, customer_id: customerId })}
                  onToggle={() => toggleStatus.mutate({ id: prescription.id, customer_id: customerId, is_active: false })}
                  t={t}
                />
              ))}
              
              {/* Inactive prescriptions */}
              {inactivePrescriptions.map((prescription) => (
                <PrescriptionRow
                  key={prescription.id}
                  prescription={prescription}
                  customerId={customerId}
                  onEdit={handleEdit}
                  onDelete={() => deletePrescription.mutate({ id: prescription.id, customer_id: customerId })}
                  onToggle={() => toggleStatus.mutate({ id: prescription.id, customer_id: customerId, is_active: true })}
                  t={t}
                  isInactive
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {/* Add/Edit Dialog */}
      <AddPrescriptionDialog
        open={addDialogOpen}
        onOpenChange={handleAddClose}
        customerId={customerId}
        customerName={customerName}
        prescription={editPrescription}
      />
    </div>
  );
}

interface PrescriptionRowProps {
  prescription: CustomerPrescription;
  customerId: string;
  onEdit: (p: CustomerPrescription) => void;
  onDelete: () => void;
  onToggle: () => void;
  t: any;
  isInactive?: boolean;
}

function PrescriptionRow({
  prescription,
  onEdit,
  onDelete,
  onToggle,
  t,
  isInactive,
}: PrescriptionRowProps) {
  return (
    <TableRow className={isInactive ? 'opacity-50' : ''}>
      <TableCell>
        <div>
          <span className="font-medium">{prescription.medicine_name}</span>
          {prescription.notes && (
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[150px] truncate" title={prescription.notes}>
              {prescription.notes}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {prescription.dosage || <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        {prescription.frequency || <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell className="text-center">
        {prescription.is_active ? (
          <Badge className="bg-success/20 text-success border-0">
            {t.customerDues?.active || 'সক্রিয়'}
          </Badge>
        ) : (
          <Badge variant="secondary">
            {t.customerDues?.inactive || 'নিষ্ক্রিয়'}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-end gap-0.5">
            {/* Toggle Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onToggle}
                >
                  {prescription.is_active ? (
                    <ToggleRight className="h-4 w-4 text-success" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {prescription.is_active
                  ? (t.customerDues?.deactivate || 'নিষ্ক্রিয় করুন')
                  : (t.customerDues?.activate || 'সক্রিয় করুন')
                }
              </TooltipContent>
            </Tooltip>

            {/* Edit */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={() => onEdit(prescription)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.actions?.edit || 'সম্পাদনা'}</TooltipContent>
            </Tooltip>

            {/* Delete */}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>{t.actions?.delete || 'মুছুন'}</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t.customerDues?.deletePrescription || 'প্রেসক্রিপশন মুছবেন?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.customerDues?.deletePrescriptionConfirm || 'এই ঔষধটি প্রেসক্রিপশন থেকে মুছে ফেলা হবে।'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.actions?.cancel || 'বাতিল'}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t.actions?.delete || 'মুছুন'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
