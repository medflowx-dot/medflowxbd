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
        <Badge variant="destructive" className="text-xs">
          {t.alerts.expiredBadge}
        </Badge>
      );
    }
    
    const bgColor = 
      daysUntilExpiry <= 30 ? 'bg-red-500 hover:bg-red-600' :
      daysUntilExpiry <= 60 ? 'bg-orange-500 hover:bg-orange-600' :
      'bg-yellow-500 hover:bg-yellow-600 text-black';
    
    return (
      <Badge className={`text-xs ${bgColor}`}>
        {daysUntilExpiry}{t.alerts.daysLeft}
      </Badge>
    );
  };

  const renderBatchGroup = (
    title: string, 
    batches: typeof expiredBatches, 
    icon: React.ReactNode,
    colorClass: string
  ) => {
    if (batches.length === 0) return null;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 text-lg ${colorClass}`}>
            {icon}
            {title} ({batches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.alerts.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.alerts.subtitle}
          </p>
        </div>
        <Button onClick={handleGenerateAlerts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t.alerts.generateAlerts}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">{t.alerts.expired}</span>
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {summaryLoading ? '...' : summary?.expired.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600">{t.alerts.within30Days}</span>
            </CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {summaryLoading ? '...' : summary?.within30Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-yellow-600">{t.alerts.within60Days}</span>
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {summaryLoading ? '...' : summary?.within60Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">{t.alerts.within90Days}</span>
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {summaryLoading ? '...' : summary?.within90Days.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t.alerts.pending}
            </CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : summary?.totalAtRisk || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="expiring">{t.alerts.expiringBatches}</TabsTrigger>
          <TabsTrigger value="history">{t.alerts.alertHistory}</TabsTrigger>
        </TabsList>

        <TabsContent value="expiring">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t.alerts.loadingAlerts}
              </CardContent>
            </Card>
          ) : (allBatches?.length || 0) === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
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
                'text-red-600'
              )}
              {renderBatchGroup(
                t.alerts.criticalGroup,
                criticalBatches,
                <AlertCircle className="h-5 w-5" />,
                'text-orange-600'
              )}
              {renderBatchGroup(
                t.alerts.warningGroup,
                warningBatches,
                <Clock className="h-5 w-5" />,
                'text-yellow-600'
              )}
              {renderBatchGroup(
                t.alerts.cautionGroup,
                cautionBatches,
                <Clock className="h-5 w-5" />,
                'text-blue-600'
              )}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t.alerts.alertHistoryTitle}
              </CardTitle>
              <CardDescription>
                {t.alerts.alertHistoryDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t.alerts.alertHistoryComingSoon}</p>
                <p className="text-sm mt-2">
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