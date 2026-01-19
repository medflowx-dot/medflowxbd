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
        return <Badge variant="destructive">{t.expiryMonitoring.expired}</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      case 'caution':
        return <Badge className="bg-yellow-500 text-black">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
      default:
        return <Badge variant="outline">{daysUntilExpiry}{t.expiryMonitoring.daysLeft}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.expiryMonitoring.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.expiryMonitoring.subtitle}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportPDF}
          disabled={!batches || batches.length === 0 || exporting}
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
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600">{t.expiryMonitoring.expired}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.expired.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600">{t.expiryMonitoring.within30Days}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary?.within30Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600">{t.expiryMonitoring.within60Days}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary?.within60Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600">{t.expiryMonitoring.within90Days}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary?.within90Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.expiryMonitoring.batches}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.expiryMonitoring.totalAtRisk}</CardDescription>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.expiryMonitoring.batchExpiryList}
            </CardTitle>
            
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
              <Button size="sm" onClick={handleCustomRangeApply} disabled={!dateFrom || !dateTo}>
                {t.expiryMonitoring.apply}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ExpiryFilter)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all">{t.expiryMonitoring.all}</TabsTrigger>
              <TabsTrigger value="expired" className="text-red-600">{t.expiryMonitoring.expired}</TabsTrigger>
              <TabsTrigger value="30days">{t.expiryMonitoring.days30}</TabsTrigger>
              <TabsTrigger value="60days">{t.expiryMonitoring.days60}</TabsTrigger>
              <TabsTrigger value="90days">{t.expiryMonitoring.days90}</TabsTrigger>
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
