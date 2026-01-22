import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Package, ShoppingCart, Users, Truck, Factory, Wallet, ClipboardList, BarChart3 } from 'lucide-react';
import { useStaffPermissions, useUpdateStaffPermissions, defaultStaffPermissions, StaffPermissions } from '@/hooks/useStaffPermissions';
import { useLanguage } from '@/contexts/LanguageContext';

interface StaffPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffUserId: string;
  staffName: string;
}

type PermissionKey = keyof Omit<StaffPermissions, 'id' | 'staff_user_id' | 'pharmacy_owner_id' | 'created_at' | 'updated_at'>;

interface PermissionModule {
  key: string;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  viewKey: PermissionKey | null;
  manageKey: PermissionKey | null;
}

const permissionModules: PermissionModule[] = [
  {
    key: 'medicines',
    label: 'Medicines',
    labelBn: 'ঔষধ',
    icon: <Package className="h-4 w-4" />,
    viewKey: 'can_view_medicines',
    manageKey: 'can_manage_medicines',
  },
  {
    key: 'sales',
    label: 'Sales',
    labelBn: 'বিক্রয়',
    icon: <ShoppingCart className="h-4 w-4" />,
    viewKey: 'can_view_sales',
    manageKey: 'can_manage_sales',
  },
  {
    key: 'customer_dues',
    label: 'Customer Dues',
    labelBn: 'গ্রাহক বাকি',
    icon: <Users className="h-4 w-4" />,
    viewKey: 'can_view_customer_dues',
    manageKey: 'can_manage_customer_dues',
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    labelBn: 'সরবরাহকারী',
    icon: <Truck className="h-4 w-4" />,
    viewKey: 'can_view_suppliers',
    manageKey: 'can_manage_suppliers',
  },
  {
    key: 'manufacturers',
    label: 'Manufacturers',
    labelBn: 'প্রস্তুতকারক',
    icon: <Factory className="h-4 w-4" />,
    viewKey: 'can_view_manufacturers',
    manageKey: null,
  },
  {
    key: 'daily_cash',
    label: 'Daily Cash',
    labelBn: 'দৈনিক ক্যাশ',
    icon: <Wallet className="h-4 w-4" />,
    viewKey: 'can_view_daily_cash',
    manageKey: 'can_manage_daily_cash',
  },
  {
    key: 'stock_short',
    label: 'Stock Short List',
    labelBn: 'স্টক শর্ট লিস্ট',
    icon: <ClipboardList className="h-4 w-4" />,
    viewKey: 'can_view_stock_short',
    manageKey: null,
  },
  {
    key: 'reports',
    label: 'Reports',
    labelBn: 'রিপোর্ট',
    icon: <BarChart3 className="h-4 w-4" />,
    viewKey: 'can_view_reports',
    manageKey: null,
  },
];

type PermissionState = Omit<StaffPermissions, 'id' | 'staff_user_id' | 'pharmacy_owner_id' | 'created_at' | 'updated_at'>;

export function StaffPermissionsDialog({ open, onOpenChange, staffUserId, staffName }: StaffPermissionsDialogProps) {
  const { language } = useLanguage();
  const { data: permissions, isLoading } = useStaffPermissions(staffUserId);
  const updatePermissions = useUpdateStaffPermissions();
  
  const [localPermissions, setLocalPermissions] = useState<PermissionState>(defaultStaffPermissions);

  useEffect(() => {
    if (permissions) {
      setLocalPermissions({
        can_view_medicines: permissions.can_view_medicines,
        can_manage_medicines: permissions.can_manage_medicines,
        can_view_sales: permissions.can_view_sales,
        can_manage_sales: permissions.can_manage_sales,
        can_view_customer_dues: permissions.can_view_customer_dues,
        can_manage_customer_dues: permissions.can_manage_customer_dues,
        can_view_suppliers: permissions.can_view_suppliers,
        can_manage_suppliers: permissions.can_manage_suppliers,
        can_view_manufacturers: permissions.can_view_manufacturers,
        can_view_daily_cash: permissions.can_view_daily_cash,
        can_manage_daily_cash: permissions.can_manage_daily_cash,
        can_view_stock_short: permissions.can_view_stock_short,
        can_view_reports: permissions.can_view_reports,
      });
    } else {
      setLocalPermissions(defaultStaffPermissions);
    }
  }, [permissions]);

  const handlePermissionChange = (key: keyof PermissionState, value: boolean) => {
    setLocalPermissions(prev => {
      const updated = { ...prev, [key]: value };
      
      // If view is disabled, also disable manage
      if (key.startsWith('can_view_') && !value) {
        const manageKey = key.replace('can_view_', 'can_manage_') as keyof PermissionState;
        if (manageKey in updated) {
          updated[manageKey] = false;
        }
      }
      
      // If manage is enabled, also enable view
      if (key.startsWith('can_manage_') && value) {
        const viewKey = key.replace('can_manage_', 'can_view_') as keyof PermissionState;
        if (viewKey in updated) {
          updated[viewKey] = true;
        }
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    updatePermissions.mutate(
      { staffUserId, permissions: localPermissions },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'bn' ? 'স্টাফ পারমিশন' : 'Staff Permissions'}: {staffName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {permissionModules.map((module) => (
              <div key={module.key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-0.5 text-muted-foreground">
                  {module.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-sm">
                    {language === 'bn' ? module.labelBn : module.label}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {module.viewKey && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${module.key}-view`}
                          checked={localPermissions[module.viewKey] as boolean}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.viewKey!, !!checked)
                          }
                        />
                        <Label htmlFor={`${module.key}-view`} className="text-sm text-muted-foreground cursor-pointer">
                          {language === 'bn' ? 'দেখতে পারবে' : 'View'}
                        </Label>
                      </div>
                    )}
                    {module.manageKey && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${module.key}-manage`}
                          checked={localPermissions[module.manageKey] as boolean}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.manageKey!, !!checked)
                          }
                          disabled={module.viewKey ? !localPermissions[module.viewKey] : false}
                        />
                        <Label 
                          htmlFor={`${module.key}-manage`} 
                          className={`text-sm cursor-pointer ${
                            module.viewKey && !localPermissions[module.viewKey] 
                              ? 'text-muted-foreground/50' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {language === 'bn' ? 'পরিচালনা করতে পারবে' : 'Manage'}
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={updatePermissions.isPending}>
            {updatePermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
