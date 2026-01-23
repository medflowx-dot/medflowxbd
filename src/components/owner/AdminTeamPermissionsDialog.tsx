import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Users, CreditCard, Database, Settings, Eye, FileText, Bell, UserCog } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useUpdateAdminTeamPermissions, 
  AdminTeamMemberWithPermissions,
  AdminTeamPermissions,
  defaultAdminPermissions,
  getRoleLabel
} from '@/hooks/useAdminTeam';

interface AdminTeamPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: AdminTeamMemberWithPermissions;
}

type PermissionKey = keyof Omit<AdminTeamPermissions, 'id' | 'team_member_id' | 'created_at' | 'updated_at'>;

interface PermissionModule {
  key: string;
  label: { en: string; bn: string };
  icon: React.ReactNode;
  permissions: { key: PermissionKey; label: { en: string; bn: string } }[];
}

const permissionModules: PermissionModule[] = [
  {
    key: 'dashboard',
    label: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    icon: <Eye className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_dashboard', label: { en: 'View Dashboard', bn: 'ড্যাশবোর্ড দেখুন' } },
    ],
  },
  {
    key: 'clients',
    label: { en: 'Client Management', bn: 'ক্লায়েন্ট ম্যানেজমেন্ট' },
    icon: <Users className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_clients', label: { en: 'View Clients', bn: 'ক্লায়েন্ট দেখুন' } },
      { key: 'can_manage_clients', label: { en: 'Manage Clients', bn: 'ক্লায়েন্ট পরিচালনা' } },
      { key: 'can_delete_clients', label: { en: 'Delete Clients', bn: 'ক্লায়েন্ট মুছুন' } },
    ],
  },
  {
    key: 'subscriptions',
    label: { en: 'Subscriptions', bn: 'সাবস্ক্রিপশন' },
    icon: <CreditCard className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_subscriptions', label: { en: 'View Subscriptions', bn: 'সাবস্ক্রিপশন দেখুন' } },
      { key: 'can_manage_subscriptions', label: { en: 'Manage Subscriptions', bn: 'সাবস্ক্রিপশন পরিচালনা' } },
    ],
  },
  {
    key: 'payments',
    label: { en: 'Payments', bn: 'পেমেন্ট' },
    icon: <CreditCard className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_payments', label: { en: 'View Payments', bn: 'পেমেন্ট দেখুন' } },
      { key: 'can_manage_payments', label: { en: 'Manage Payments', bn: 'পেমেন্ট পরিচালনা' } },
      { key: 'can_process_refunds', label: { en: 'Process Refunds', bn: 'রিফান্ড প্রসেস' } },
    ],
  },
  {
    key: 'pricing',
    label: { en: 'Pricing Plans', bn: 'প্রাইসিং প্ল্যান' },
    icon: <CreditCard className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_pricing', label: { en: 'View Pricing', bn: 'প্রাইসিং দেখুন' } },
      { key: 'can_manage_pricing', label: { en: 'Manage Pricing', bn: 'প্রাইসিং পরিচালনা' } },
    ],
  },
  {
    key: 'master_data',
    label: { en: 'Master Data', bn: 'মাস্টার ডাটা' },
    icon: <Database className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_master_data', label: { en: 'View Master Data', bn: 'মাস্টার ডাটা দেখুন' } },
      { key: 'can_manage_master_data', label: { en: 'Manage Master Data', bn: 'মাস্টার ডাটা পরিচালনা' } },
    ],
  },
  {
    key: 'settings',
    label: { en: 'Settings', bn: 'সেটিংস' },
    icon: <Settings className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_settings', label: { en: 'View Settings', bn: 'সেটিংস দেখুন' } },
      { key: 'can_manage_settings', label: { en: 'Manage Settings', bn: 'সেটিংস পরিচালনা' } },
    ],
  },
  {
    key: 'audit',
    label: { en: 'Audit & Logs', bn: 'অডিট ও লগ' },
    icon: <Eye className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_audit_logs', label: { en: 'View Audit Logs', bn: 'অডিট লগ দেখুন' } },
    ],
  },
  {
    key: 'feature_flags',
    label: { en: 'Feature Flags', bn: 'ফিচার ফ্ল্যাগ' },
    icon: <Shield className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_feature_flags', label: { en: 'View Feature Flags', bn: 'ফিচার ফ্ল্যাগ দেখুন' } },
      { key: 'can_manage_feature_flags', label: { en: 'Manage Feature Flags', bn: 'ফিচার ফ্ল্যাগ পরিচালনা' } },
    ],
  },
  {
    key: 'cms',
    label: { en: 'CMS', bn: 'সিএমএস' },
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_cms', label: { en: 'View CMS', bn: 'সিএমএস দেখুন' } },
      { key: 'can_manage_cms', label: { en: 'Manage CMS', bn: 'সিএমএস পরিচালনা' } },
    ],
  },
  {
    key: 'email_templates',
    label: { en: 'Email Templates', bn: 'ইমেইল টেমপ্লেট' },
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      { key: 'can_view_email_templates', label: { en: 'View Email Templates', bn: 'ইমেইল টেমপ্লেট দেখুন' } },
      { key: 'can_manage_email_templates', label: { en: 'Manage Email Templates', bn: 'ইমেইল টেমপ্লেট পরিচালনা' } },
    ],
  },
  {
    key: 'notifications',
    label: { en: 'Notifications', bn: 'নোটিফিকেশন' },
    icon: <Bell className="h-4 w-4" />,
    permissions: [
      { key: 'can_send_notifications', label: { en: 'Send Notifications', bn: 'নোটিফিকেশন পাঠান' } },
    ],
  },
  {
    key: 'impersonation',
    label: { en: 'Impersonation', bn: 'ইমপারসোনেশন' },
    icon: <UserCog className="h-4 w-4" />,
    permissions: [
      { key: 'can_impersonate_users', label: { en: 'Impersonate Users', bn: 'ইউজার ইমপারসোনেট' } },
    ],
  },
];

interface PermissionTemplate {
  id: string;
  label: { en: string; bn: string };
  permissions: Record<PermissionKey, boolean>;
}

const permissionTemplates: PermissionTemplate[] = [
  {
    id: 'full_access',
    label: { en: 'Full Access', bn: 'সম্পূর্ণ এক্সেস' },
    permissions: {
      can_view_dashboard: true,
      can_view_clients: true,
      can_manage_clients: true,
      can_delete_clients: true,
      can_view_subscriptions: true,
      can_manage_subscriptions: true,
      can_view_payments: true,
      can_manage_payments: true,
      can_process_refunds: true,
      can_view_pricing: true,
      can_manage_pricing: true,
      can_view_master_data: true,
      can_manage_master_data: true,
      can_view_settings: true,
      can_manage_settings: true,
      can_view_audit_logs: true,
      can_view_feature_flags: true,
      can_manage_feature_flags: true,
      can_view_cms: true,
      can_manage_cms: true,
      can_view_email_templates: true,
      can_manage_email_templates: true,
      can_send_notifications: true,
      can_impersonate_users: true,
    },
  },
  {
    id: 'manager',
    label: { en: 'Manager', bn: 'ম্যানেজার' },
    permissions: {
      can_view_dashboard: true,
      can_view_clients: true,
      can_manage_clients: true,
      can_delete_clients: false,
      can_view_subscriptions: true,
      can_manage_subscriptions: true,
      can_view_payments: true,
      can_manage_payments: true,
      can_process_refunds: false,
      can_view_pricing: true,
      can_manage_pricing: false,
      can_view_master_data: true,
      can_manage_master_data: false,
      can_view_settings: true,
      can_manage_settings: false,
      can_view_audit_logs: true,
      can_view_feature_flags: false,
      can_manage_feature_flags: false,
      can_view_cms: false,
      can_manage_cms: false,
      can_view_email_templates: false,
      can_manage_email_templates: false,
      can_send_notifications: true,
      can_impersonate_users: false,
    },
  },
  {
    id: 'support',
    label: { en: 'Support', bn: 'সাপোর্ট' },
    permissions: {
      can_view_dashboard: true,
      can_view_clients: true,
      can_manage_clients: true,
      can_delete_clients: false,
      can_view_subscriptions: true,
      can_manage_subscriptions: false,
      can_view_payments: true,
      can_manage_payments: false,
      can_process_refunds: false,
      can_view_pricing: false,
      can_manage_pricing: false,
      can_view_master_data: false,
      can_manage_master_data: false,
      can_view_settings: false,
      can_manage_settings: false,
      can_view_audit_logs: false,
      can_view_feature_flags: false,
      can_manage_feature_flags: false,
      can_view_cms: false,
      can_manage_cms: false,
      can_view_email_templates: false,
      can_manage_email_templates: false,
      can_send_notifications: true,
      can_impersonate_users: false,
    },
  },
  {
    id: 'technical_it',
    label: { en: 'Technical IT', bn: 'টেকনিক্যাল আইটি' },
    permissions: {
      can_view_dashboard: true,
      can_view_clients: false,
      can_manage_clients: false,
      can_delete_clients: false,
      can_view_subscriptions: false,
      can_manage_subscriptions: false,
      can_view_payments: false,
      can_manage_payments: false,
      can_process_refunds: false,
      can_view_pricing: false,
      can_manage_pricing: false,
      can_view_master_data: true,
      can_manage_master_data: true,
      can_view_settings: true,
      can_manage_settings: true,
      can_view_audit_logs: true,
      can_view_feature_flags: true,
      can_manage_feature_flags: true,
      can_view_cms: true,
      can_manage_cms: true,
      can_view_email_templates: true,
      can_manage_email_templates: true,
      can_send_notifications: false,
      can_impersonate_users: true,
    },
  },
  {
    id: 'read_only',
    label: { en: 'Read Only', bn: 'শুধু দেখা' },
    permissions: {
      can_view_dashboard: true,
      can_view_clients: true,
      can_manage_clients: false,
      can_delete_clients: false,
      can_view_subscriptions: true,
      can_manage_subscriptions: false,
      can_view_payments: true,
      can_manage_payments: false,
      can_process_refunds: false,
      can_view_pricing: true,
      can_manage_pricing: false,
      can_view_master_data: true,
      can_manage_master_data: false,
      can_view_settings: true,
      can_manage_settings: false,
      can_view_audit_logs: true,
      can_view_feature_flags: true,
      can_manage_feature_flags: false,
      can_view_cms: true,
      can_manage_cms: false,
      can_view_email_templates: true,
      can_manage_email_templates: false,
      can_send_notifications: false,
      can_impersonate_users: false,
    },
  },
];

export function AdminTeamPermissionsDialog({ open, onOpenChange, member }: AdminTeamPermissionsDialogProps) {
  const { language } = useLanguage();
  const updatePermissions = useUpdateAdminTeamPermissions();
  
  const [localPermissions, setLocalPermissions] = useState<Record<PermissionKey, boolean>>(
    defaultAdminPermissions as Record<PermissionKey, boolean>
  );

  // Initialize from member's permissions
  useEffect(() => {
    if (member.admin_team_permissions) {
      const perms = { ...defaultAdminPermissions } as Record<PermissionKey, boolean>;
      Object.keys(perms).forEach(key => {
        const k = key as PermissionKey;
        if (member.admin_team_permissions && k in member.admin_team_permissions) {
          perms[k] = member.admin_team_permissions[k] as boolean;
        }
      });
      setLocalPermissions(perms);
    }
  }, [member]);

  const handlePermissionChange = (key: PermissionKey, value: boolean) => {
    setLocalPermissions(prev => {
      const updated = { ...prev, [key]: value };
      
      // If turning on manage, also turn on view
      if (value && key.startsWith('can_manage_')) {
        const viewKey = key.replace('can_manage_', 'can_view_') as PermissionKey;
        if (viewKey in updated) {
          updated[viewKey] = true;
        }
      }
      
      // If turning off view, also turn off manage
      if (!value && key.startsWith('can_view_')) {
        const manageKey = key.replace('can_view_', 'can_manage_') as PermissionKey;
        if (manageKey in updated) {
          updated[manageKey] = false;
        }
        // Also turn off delete for clients
        if (key === 'can_view_clients') {
          updated.can_delete_clients = false;
        }
      }
      
      // If turning off manage clients, also turn off delete
      if (!value && key === 'can_manage_clients') {
        updated.can_delete_clients = false;
      }
      
      return updated;
    });
  };

  const handleTemplateApply = (templateId: string) => {
    const template = permissionTemplates.find(t => t.id === templateId);
    if (template) {
      setLocalPermissions({ ...template.permissions });
    }
  };

  const handleSave = async () => {
    await updatePermissions.mutateAsync({
      teamMemberId: member.id,
      permissions: localPermissions,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'bn' ? 'Permissions সেটিংস' : 'Permission Settings'}
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{member.full_name}</span> 
            <Badge variant="outline" className="ml-2">
              {getRoleLabel(member.team_role, language === 'bn' ? 'bn' : 'en')}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions">
              {language === 'bn' ? 'Permissions' : 'Permissions'}
            </TabsTrigger>
            <TabsTrigger value="templates">
              {language === 'bn' ? 'টেমপ্লেট' : 'Templates'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {permissionTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => handleTemplateApply(template.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">
                      {language === 'bn' ? template.label.bn : template.label.en}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {template.id === 'full_access' && (language === 'bn' ? 'সব permission' : 'All permissions')}
                      {template.id === 'manager' && (language === 'bn' ? 'ক্লায়েন্ট ও পেমেন্ট' : 'Clients & Payments')}
                      {template.id === 'support' && (language === 'bn' ? 'ক্লায়েন্ট সাপোর্ট' : 'Client support')}
                      {template.id === 'technical_it' && (language === 'bn' ? 'সিস্টেম ও সেটিংস' : 'System & Settings')}
                      {template.id === 'read_only' && (language === 'bn' ? 'শুধু দেখা যাবে' : 'View only')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {permissionModules.map(module => (
                  <div key={module.key} className="space-y-3">
                    <div className="flex items-center gap-2 font-medium text-sm border-b pb-2">
                      {module.icon}
                      {language === 'bn' ? module.label.bn : module.label.en}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                      {module.permissions.map(perm => (
                        <div key={perm.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.key}
                            checked={localPermissions[perm.key]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(perm.key, checked as boolean)
                            }
                          />
                          <Label htmlFor={perm.key} className="text-sm cursor-pointer">
                            {language === 'bn' ? perm.label.bn : perm.label.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={updatePermissions.isPending}>
            {updatePermissions.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {language === 'bn' ? 'সেভ করুন' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
