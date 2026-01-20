import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { useExpiryMonitoring, useExpirySummary } from '@/hooks/useExpiryMonitoring';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('expiring');
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  const { data: allBatches, isLoading } = useExpiryMonitoring('all');
  const { data: summary, isLoading: summaryLoading } = useExpirySummary();

  // Group batches by status
  const expiredBatches = allBatches?.filter(b => b.status === 'expired') || [];
  const criticalBatches = allBatches?.filter(b => b.status === 'critical') || [];
  const warningBatches = allBatches?.filter(b => b.status === 'warning') || [];
  const cautionBatches = allBatches?.filter(b => b.status === 'caution') || [];

  const handleGenerateAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['expiry-monitoring'] });
    queryClient.invalidateQueries({ queryKey: ['expiry-summary'] });
    toast({
      title: t.alerts.alertsRefreshed,
      description: t.alerts.alertsRefreshedDesc,
    });
  };

  const getDaysLeftBadge = (daysUntilExpiry: number, status: string) => {
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white">
          {t.alerts.expiredBadge}
        </span>
      );
    }
    
    const badgeClass = 
      daysUntilExpiry <= 30 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
      daysUntilExpiry <= 60 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' :
      'bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900';
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {daysUntilExpiry}{t.alerts.daysLeft}
      </span>
    );
  };

  const renderBatchGroup = (
    title: string, 
    batches: typeof expiredBatches, 
    icon: React.ReactNode,
    colorClass: string,
    gradientClass: string
  ) => {
    if (batches.length === 0) return null;
    
    return (
      <Card className="mb-4 overflow-hidden">
        <CardHeader className={`pb-3 ${gradientClass}`}>
          <CardTitle className={`flex items-center gap-2 text-lg ${colorClass}`}>
            {icon}
            {title} ({batches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-medium">{batch.medicine_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.alerts.batch}: {batch.batch_number}
                  </div>
                </div>
                <div className="text-right">
                  {getDaysLeftBadge(batch.daysUntilExpiry, batch.status)}
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(new Date(batch.expiry_date), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-warning">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.alerts.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.alerts.subtitle}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleGenerateAlerts} 
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t.alerts.generateAlerts}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="stat-card-expense overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <div className="icon-container-danger">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <span>{t.alerts.expired}</span>
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
              {summaryLoading ? '...' : summary?.expired.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="stat-card-due overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <div className="icon-container-warning">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span>{t.alerts.within30Days}</span>
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {summaryLoading ? '...' : summary?.within30Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50/50 dark:from-yellow-950/30 dark:to-amber-950/20 border-yellow-200/50 dark:border-yellow-800/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span>{t.alerts.within60Days}</span>
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {summaryLoading ? '...' : summary?.within60Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="stat-card-info overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <div className="icon-container-info">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span>{t.alerts.within90Days}</span>
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {summaryLoading ? '...' : summary?.within90Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/20 border-slate-200/50 dark:border-slate-800/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500 text-white">
                <Bell className="h-3.5 w-3.5" />
              </div>
              {t.alerts.pending}
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {summaryLoading ? '...' : summary?.totalAtRisk || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger 
            value="expiring"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            {t.alerts.expiringBatches}
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            {t.alerts.alertHistory}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="animate-card-enter">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t.alerts.loadingAlerts}
              </CardContent>
            </Card>
          ) : (allBatches?.length || 0) === 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.alerts.allClear}</h3>
                <p className="text-muted-foreground">
                  {t.alerts.noExpiringBatches}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)] pr-4">
              {renderBatchGroup(
                t.alerts.expiredGroup,
                expiredBatches,
                <AlertTriangle className="h-5 w-5" />,
                'text-red-600',
                'bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/30'
              )}
              {renderBatchGroup(
                t.alerts.criticalGroup,
                criticalBatches,
                <AlertCircle className="h-5 w-5" />,
                'text-orange-600',
                'bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30'
              )}
              {renderBatchGroup(
                t.alerts.warningGroup,
                warningBatches,
                <Clock className="h-5 w-5" />,
                'text-yellow-600',
                'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/30'
              )}
              {renderBatchGroup(
                t.alerts.cautionGroup,
                cautionBatches,
                <Clock className="h-5 w-5" />,
                'text-blue-600',
                'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30'
              )}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history" className="animate-card-enter">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
              <div className="flex items-center gap-3">
                <div className="icon-container-info">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>{t.alerts.alertHistoryTitle}</CardTitle>
                  <CardDescription>
                    {t.alerts.alertHistoryDesc}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="py-10 text-center rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-dashed border-blue-200 dark:border-blue-800/50">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-medium">{t.alerts.alertHistoryComingSoon}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t.alerts.alertHistoryNote}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}