import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertTriangle, Clock, FileDown, Package, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExpiryMonitoring, useExpirySummary, ExpiryFilter } from '@/hooks/useExpiryMonitoring';
import { generateExpiryReportPDF } from '@/lib/pdfGenerator';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ExpiryMonitoring() {
  const [filter, setFilter] = useState<ExpiryFilter>('all');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [exporting, setExporting] = useState(false);
  const { t } = useLanguage();

  const { data: batches, isLoading } = useExpiryMonitoring(filter, customRange);
  const { data: summary } = useExpirySummary();

  const handleCustomRangeApply = () => {
    if (dateFrom && dateTo) {
      setCustomRange({ from: dateFrom, to: dateTo });
      setFilter('custom');
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'all': return t.expiryMonitoring.allBatchesAtRisk;
      case 'expired': return t.expiryMonitoring.expiredBatches;
      case '30days': return t.expiryMonitoring.expiringWithin30Days;
      case '60days': return t.expiryMonitoring.expiringWithin60Days;
      case '90days': return t.expiryMonitoring.expiringWithin90Days;
      case 'custom': 
        return customRange 
          ? `${format(customRange.from, 'MMM dd, yyyy')} - ${format(customRange.to, 'MMM dd, yyyy')}`
          : t.expiryMonitoring.customRange;
      default: return t.expiryMonitoring.allBatchesAtRisk;
    }
  };

  const handleExportPDF = () => {
    if (!batches || batches.length === 0) return;
    setExporting(true);
    
    try {
      generateExpiryReportPDF(batches, getFilterLabel());
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    switch (status) {
      case 'expired':
        return <Badge className="expiry-badge-expired">{t.expiryMonitoring.expired}</Badge>;
      case 'critical':
        return <Badge className="expiry-badge-critical">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      case 'warning':
        return <Badge className="expiry-badge-warning">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      case 'caution':
        return <Badge className="expiry-badge-caution">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      default:
        return <Badge variant="outline" className="expiry-badge-safe">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-primary">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.expiryMonitoring.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.expiryMonitoring.subtitle}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleExportPDF}
          disabled={!batches || batches.length === 0 || exporting}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          {t.expiryMonitoring.exportPDF}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="stat-card-expense">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-red-600 dark:text-red-400">{t.expiryMonitoring.expired}</CardDescription>
            <div className="icon-container-danger">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary?.expired.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-due">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-orange-600 dark:text-orange-400">{t.expiryMonitoring.within30Days}</CardDescription>
            <div className="icon-container-warning">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary?.within30Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200/50 dark:border-yellow-800/30 bg-gradient-to-br from-yellow-50/80 to-amber-50/50 dark:from-yellow-950/30 dark:to-amber-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-yellow-600 dark:text-yellow-400">{t.expiryMonitoring.within60Days}</CardDescription>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary?.within60Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-info">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-blue-600 dark:text-blue-400">{t.expiryMonitoring.within90Days}</CardDescription>
            <div className="icon-container-info">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary?.within90Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 dark:border-destructive/50 bg-gradient-to-br from-destructive/10 to-destructive/5 dark:from-destructive/20 dark:to-destructive/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription>{t.expiryMonitoring.totalAtRisk}</CardDescription>
            <div className="icon-container-danger">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summary?.totalAtRisk || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.expiryMonitoring.totalBatches}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="icon-container-warning">
                <Package className="h-4 w-4" />
              </div>
              <CardTitle>{t.expiryMonitoring.batchExpiryList}</CardTitle>
            </div>
            
            {/* Custom Date Range */}
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder={t.expiryMonitoring.from}
                className="w-[130px]"
              />
              <span className="text-muted-foreground">{t.expiryMonitoring.to}</span>
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder={t.expiryMonitoring.to}
                className="w-[130px]"
              />
              <Button 
                size="sm" 
                onClick={handleCustomRangeApply} 
                disabled={!dateFrom || !dateTo}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {t.expiryMonitoring.apply}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ExpiryFilter)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white">{t.expiryMonitoring.all}</TabsTrigger>
              <TabsTrigger value="expired" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">{t.expiryMonitoring.expired}</TabsTrigger>
              <TabsTrigger value="30days" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">{t.expiryMonitoring.days30}</TabsTrigger>
              <TabsTrigger value="60days" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-400 data-[state=active]:text-white">{t.expiryMonitoring.days60}</TabsTrigger>
              <TabsTrigger value="90days" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">{t.expiryMonitoring.days90}</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t.expiryMonitoring.loading}</div>
              ) : batches?.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.expiryMonitoring.noItemsFound}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.expiryMonitoring.medicine}</TableHead>
                        <TableHead>{t.expiryMonitoring.batchNo}</TableHead>
                        <TableHead>{t.expiryMonitoring.category}</TableHead>
                        <TableHead>{t.expiryMonitoring.manufacturer}</TableHead>
                        <TableHead>{t.expiryMonitoring.expiryDate}</TableHead>
                        <TableHead className="text-center">{t.expiryMonitoring.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches?.map((batch) => (
                        <TableRow 
                          key={batch.id}
                          className={cn(
                            batch.status === 'expired' && 'bg-red-50 dark:bg-red-950/30',
                            batch.status === 'critical' && 'bg-orange-50 dark:bg-orange-950/30'
                          )}
                        >
                          <TableCell className="font-medium">{batch.medicine_name}</TableCell>
                          <TableCell className="font-mono text-sm">{batch.batch_number}</TableCell>
                          <TableCell>{batch.category || '-'}</TableCell>
                          <TableCell>{batch.manufacturer || '-'}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(batch.expiry_date), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(batch.status, batch.daysUntilExpiry)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
