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
          ? `${format(customRange.from, 'dd MMM yyyy')} - ${format(customRange.to, 'dd MMM yyyy')}`
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
            <CardDescription className="text-destructive">{t.expiryMonitoring.expired}</CardDescription>
            <div className="icon-container-danger">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary?.expired.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-due">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-warning">{t.expiryMonitoring.within30Days}</CardDescription>
            <div className="icon-container-warning">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary?.within30Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-warning">{t.expiryMonitoring.within60Days}</CardDescription>
            <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary?.within60Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-info">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-info">{t.expiryMonitoring.within90Days}</CardDescription>
            <div className="icon-container-info">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{summary?.within90Days.count || 0}</div>
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
        <CardHeader className="bg-warning/10">
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
                className="bg-warning hover:bg-warning/90 text-warning-foreground"
              >
                {t.expiryMonitoring.apply}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ExpiryFilter)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t.expiryMonitoring.all}</TabsTrigger>
              <TabsTrigger value="expired" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">{t.expiryMonitoring.expired}</TabsTrigger>
              <TabsTrigger value="30days" className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">{t.expiryMonitoring.days30}</TabsTrigger>
              <TabsTrigger value="60days" className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">{t.expiryMonitoring.days60}</TabsTrigger>
              <TabsTrigger value="90days" className="data-[state=active]:bg-info data-[state=active]:text-info-foreground">{t.expiryMonitoring.days90}</TabsTrigger>
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
                            batch.status === 'expired' && 'bg-destructive/10',
                            batch.status === 'critical' && 'bg-warning/10'
                          )}
                        >
                          <TableCell className="font-medium">{batch.medicine_name}</TableCell>
                          <TableCell className="font-mono text-sm">{batch.batch_number}</TableCell>
                          <TableCell>{batch.category || '-'}</TableCell>
                          <TableCell>{batch.manufacturer || '-'}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
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
