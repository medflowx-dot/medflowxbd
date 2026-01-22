import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { 
  Pill, Plus, Pencil, Trash2, ChevronDown, ChevronRight, 
  Loader2, Stethoscope, Calendar, FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useCustomerPrescriptions,
  useDeletePrescription,
  useDeletePrescriptionMedicine,
  useToggleMedicineStatus,
  CustomerPrescription,
  PrescriptionMedicine,
} from '@/hooks/useCustomerPrescriptions';
import { AddPrescriptionDialog } from './AddPrescriptionDialog';
import { AddMedicineDialog } from './AddMedicineDialog';

interface CustomerPrescriptionsProps {
  customerId: string;
  customerName: string;
}

export function CustomerPrescriptions({ customerId, customerName }: CustomerPrescriptionsProps) {
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_prescriptions');
  
  const { data: prescriptions, isLoading } = useCustomerPrescriptions(customerId);
  const deletePrescription = useDeletePrescription();
  const deleteMedicine = useDeletePrescriptionMedicine();
  const toggleMedicineStatus = useToggleMedicineStatus();

  const [addPrescriptionOpen, setAddPrescriptionOpen] = useState(false);
  const [editPrescription, setEditPrescription] = useState<CustomerPrescription | null>(null);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [editMedicine, setEditMedicine] = useState<PrescriptionMedicine | null>(null);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedPrescriptions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedPrescriptions(newSet);
  };

  const handleAddMedicine = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setEditMedicine(null);
    setAddMedicineOpen(true);
  };

  const handleEditMedicine = (medicine: PrescriptionMedicine) => {
    setSelectedPrescriptionId(medicine.prescription_id);
    setEditMedicine(medicine);
    setAddMedicineOpen(true);
  };

  const handleEditPrescription = (prescription: CustomerPrescription) => {
    setEditPrescription(prescription);
    setAddPrescriptionOpen(true);
  };

  const handlePrescriptionDialogClose = (open: boolean) => {
    setAddPrescriptionOpen(open);
    if (!open) {
      setEditPrescription(null);
    }
  };

  const handleMedicineDialogClose = (open: boolean) => {
    setAddMedicineOpen(open);
    if (!open) {
      setEditMedicine(null);
      setSelectedPrescriptionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activePrescriptions = prescriptions?.filter(p => p.is_active) || [];
  const inactivePrescriptions = prescriptions?.filter(p => !p.is_active) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">
            {t.customerDues?.prescriptions || 'প্রেসক্রিপশন'}
          </h3>
          {activePrescriptions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activePrescriptions.length}
            </Badge>
          )}
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setAddPrescriptionOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.customerDues?.newPrescription || 'নতুন প্রেসক্রিপশন'}
          </Button>
        )}
      </div>

      {/* Prescriptions List */}
      {prescriptions?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>{t.customerDues?.noPrescriptions || 'কোনো প্রেসক্রিপশন নেই'}</p>
          <p className="text-sm mt-1">{t.customerDues?.addPrescriptionHint || 'কাস্টমারের প্রেসক্রিপশন যোগ করুন'}</p>
        </div>
      ) : (
        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-3">
            {/* Active Prescriptions */}
            {activePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                customerId={customerId}
                isExpanded={expandedPrescriptions.has(prescription.id)}
                onToggleExpand={() => toggleExpanded(prescription.id)}
                onEdit={() => handleEditPrescription(prescription)}
                onDelete={() => deletePrescription.mutate({ id: prescription.id, customer_id: customerId })}
                onAddMedicine={() => handleAddMedicine(prescription.id)}
                onEditMedicine={handleEditMedicine}
                onDeleteMedicine={(medicineId) => deleteMedicine.mutate({ id: medicineId, customer_id: customerId })}
                onToggleMedicineStatus={(medicineId, isActive) => 
                  toggleMedicineStatus.mutate({ id: medicineId, customer_id: customerId, is_active: isActive })
                }
                t={t}
                canManage={canManage}
              />
            ))}

            {/* Inactive Prescriptions */}
            {inactivePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                customerId={customerId}
                isExpanded={expandedPrescriptions.has(prescription.id)}
                onToggleExpand={() => toggleExpanded(prescription.id)}
                onEdit={() => handleEditPrescription(prescription)}
                onDelete={() => deletePrescription.mutate({ id: prescription.id, customer_id: customerId })}
                onAddMedicine={() => handleAddMedicine(prescription.id)}
                onEditMedicine={handleEditMedicine}
                onDeleteMedicine={(medicineId) => deleteMedicine.mutate({ id: medicineId, customer_id: customerId })}
                onToggleMedicineStatus={(medicineId, isActive) => 
                  toggleMedicineStatus.mutate({ id: medicineId, customer_id: customerId, is_active: isActive })
                }
                t={t}
                isInactive
                canManage={canManage}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Dialogs */}
      <AddPrescriptionDialog
        open={addPrescriptionOpen}
        onOpenChange={handlePrescriptionDialogClose}
        customerId={customerId}
        customerName={customerName}
        prescription={editPrescription}
      />

      <AddMedicineDialog
        open={addMedicineOpen}
        onOpenChange={handleMedicineDialogClose}
        customerId={customerId}
        prescriptionId={selectedPrescriptionId || ''}
        medicine={editMedicine}
      />
    </div>
  );
}

interface PrescriptionCardProps {
  prescription: CustomerPrescription;
  customerId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedicine: () => void;
  onEditMedicine: (medicine: PrescriptionMedicine) => void;
  onDeleteMedicine: (medicineId: string) => void;
  onToggleMedicineStatus: (medicineId: string, isActive: boolean) => void;
  t: any;
  isInactive?: boolean;
  canManage?: boolean;
}

function PrescriptionCard({
  prescription,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddMedicine,
  onEditMedicine,
  onDeleteMedicine,
  t,
  isInactive,
  canManage,
}: PrescriptionCardProps) {
  const medicineCount = prescription.medicines?.length || 0;
  const activeMedicineCount = prescription.medicines?.filter(m => m.is_active).length || 0;

  return (
    <Card className={`overflow-hidden ${isInactive ? 'opacity-60' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        {/* Prescription Header */}
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-left flex-1 min-w-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {prescription.doctor_name && (
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      {prescription.doctor_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(prescription.prescription_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Pill className="h-3 w-3" />
                    {activeMedicineCount}/{medicineCount} {t.customerDues?.medicines || 'ঔষধ'}
                  </Badge>
                  {isInactive && (
                    <Badge variant="secondary" className="text-xs">
                      {t.customerDues?.inactive || 'নিষ্ক্রিয়'}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          </CollapsibleTrigger>

          {canManage && (
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-0.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t.actions?.edit || 'সম্পাদনা'}</TooltipContent>
                </Tooltip>

                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.stopPropagation()}
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
                        {t.customerDues?.deletePrescriptionConfirm || 'এই প্রেসক্রিপশন এবং এর সব ঔষধ মুছে যাবে।'}
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
          )}
        </div>

        {/* Medicines List */}
        <CollapsibleContent>
          <div className="p-3 pt-2 space-y-2 border-t">
            {/* Add Medicine Button */}
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-dashed"
                onClick={onAddMedicine}
              >
                <Plus className="h-4 w-4" />
                {t.customerDues?.addMedicine || 'ঔষধ যোগ করুন'}
              </Button>
            )}

            {/* Medicines */}
            {prescription.medicines?.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-2">
                {t.customerDues?.noMedicinesYet || 'এখনো কোনো ঔষধ যোগ হয়নি'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {prescription.medicines?.map((medicine) => (
                  <MedicineRow
                    key={medicine.id}
                    medicine={medicine}
                    onEdit={() => onEditMedicine(medicine)}
                    onDelete={() => onDeleteMedicine(medicine.id)}
                    t={t}
                    canManage={canManage}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface MedicineRowProps {
  medicine: PrescriptionMedicine;
  onEdit: () => void;
  onDelete: () => void;
  t: any;
  canManage?: boolean;
}

function MedicineRow({ medicine, onEdit, onDelete, t, canManage }: MedicineRowProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-md bg-background border ${!medicine.is_active ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Pill className={`h-3.5 w-3.5 shrink-0 ${medicine.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="font-medium text-sm truncate">{medicine.medicine_name}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground ml-5">
          {medicine.dosage && <span>{medicine.dosage}</span>}
          {medicine.dosage && medicine.frequency && <span>•</span>}
          {medicine.frequency && <span>{medicine.frequency}</span>}
          {medicine.duration && (
            <>
              <span>•</span>
              <span>{medicine.duration}</span>
            </>
          )}
        </div>
      </div>

      {canManage && (
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-0.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-primary/10"
                  onClick={onEdit}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.actions?.edit || 'সম্পাদনা'}</TooltipContent>
            </Tooltip>

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>{t.actions?.delete || 'মুছুন'}</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t.customerDues?.deleteMedicine || 'ঔষধ মুছবেন?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.customerDues?.deleteMedicineConfirm || 'এই ঔষধটি প্রেসক্রিপশন থেকে মুছে যাবে।'}
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
      )}
    </div>
  );
}
