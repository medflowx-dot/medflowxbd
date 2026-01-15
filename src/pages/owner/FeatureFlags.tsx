import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeatureFlags, useUpdateFeatureFlag, useBulkUpdateFeatureFlags } from '@/hooks/useFeatureFlags';
import { Loader2, Search, ToggleLeft, Save, Package, ShoppingCart, Truck, FileText, Settings, Bell, AlertTriangle, Wallet, ClipboardList, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  medicines: Package,
  batches: Package,
  expiry_monitor: AlertTriangle,
  alerts: Bell,
  sales: ShoppingCart,
  customer_dues: Users,
  suppliers: Truck,
  manufacturers: Building2,
  daily_cash: Wallet,
  stock_short: ClipboardList,
  reports: FileText,
  settings: Settings,
};

export default function FeatureFlags() {
  const [search, setSearch] = useState('');
  const { data: flags, isLoading } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  const bulkUpdate = useBulkUpdateFeatureFlags();

  const filteredFlags = flags?.filter(flag =>
    flag.display_name.toLowerCase().includes(search.toLowerCase()) ||
    flag.feature_key.toLowerCase().includes(search.toLowerCase()) ||
    flag.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: string, currentValue: boolean) => {
    updateFlag.mutate({ id, is_enabled: !currentValue });
  };

  const handleEnableAll = () => {
    if (!flags) return;
    const updates = flags.map(f => ({ id: f.id, is_enabled: true }));
    bulkUpdate.mutate(updates);
  };

  const handleDisableAll = () => {
    if (!flags) return;
    const updates = flags.map(f => ({ id: f.id, is_enabled: false }));
    bulkUpdate.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enabledCount = flags?.filter(f => f.is_enabled).length || 0;
  const totalCount = flags?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ToggleLeft className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Feature Flags</h1>
            <p className="text-muted-foreground">Enable or disable features globally</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEnableAll}>
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisableAll}>
            Disable All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{enabledCount}</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">{totalCount - enabledCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Feature Flags List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFlags?.map((flag) => {
          const IconComponent = featureIcons[flag.feature_key] || Package;
          
          return (
            <Card key={flag.id} className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${flag.is_enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <IconComponent className={`h-4 w-4 ${flag.is_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{flag.display_name}</CardTitle>
                      <CardDescription className="text-xs">{flag.feature_key}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={() => handleToggle(flag.id, flag.is_enabled)}
                    disabled={updateFlag.isPending}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {flag.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                    {flag.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated {format(new Date(flag.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFlags?.length === 0 && (
        <Card className="border-0 shadow-card">
          <CardContent className="py-12 text-center">
            <ToggleLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No features found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
