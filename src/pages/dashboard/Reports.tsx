import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailySummaryReportView } from '@/components/reports/DailySummaryReport';
import { SalesReportView } from '@/components/reports/SalesReport';
import { SupplierDueReportView } from '@/components/reports/SupplierDueReport';
import { CustomerDuesReportView } from '@/components/reports/CustomerDuesReport';
import { SupplierReportsView } from '@/components/reports/SupplierReports';
import { getDateRangePresets, ReportDateRange } from '@/hooks/useReports';
import { DatePicker } from '@/components/ui/date-picker';
import { FileText, TrendingUp, Truck, BarChart3, Users, Package, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function Reports() {
  const presets = getDateRangePresets();
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');
  const [dateRange, setDateRange] = useState<ReportDateRange>({
    start: presets.thisMonth.start,
    end: presets.thisMonth.end,
  });
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const { t } = useLanguage();

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'custom') {
      if (customStartDate && customEndDate) {
        setDateRange({ start: customStartDate, end: customEndDate });
      }
    } else {
      const presetData = presets[preset as keyof typeof presets];
      if (presetData) {
        setDateRange({ start: presetData.start, end: presetData.end });
      }
    }
  };

  const handleCustomDateChange = (start?: Date, end?: Date) => {
    if (start) setCustomStartDate(start);
    if (end) setCustomEndDate(end);
    if (start && end) {
      setDateRange({ start, end });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="icon-container-primary p-2.5">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.reports.title}</h1>
            <p className="text-muted-foreground">
              {t.reports.subtitle}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
          <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px] sm:w-[150px] bg-background">
              <SelectValue placeholder={t.reports.selectPeriod} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t.reports.today}</SelectItem>
              <SelectItem value="thisWeek">{t.reports.thisWeek}</SelectItem>
              <SelectItem value="thisMonth">{t.reports.thisMonth}</SelectItem>
              <SelectItem value="last7Days">{t.reports.last7Days}</SelectItem>
              <SelectItem value="last30Days">{t.reports.last30Days}</SelectItem>
              <SelectItem value="custom">{t.reports.customRange}</SelectItem>
            </SelectContent>
          </Select>

          {selectedPreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                date={customStartDate}
                onDateChange={(date) => handleCustomDateChange(date, customEndDate)}
                placeholder={t.reports.startDate}
                className="w-[140px] sm:w-[160px]"
              />
              <span className="text-muted-foreground text-sm">{t.reports.to}</span>
              <DatePicker
                date={customEndDate}
                onDateChange={(date) => handleCustomDateChange(customStartDate, date)}
                placeholder={t.reports.endDate}
                className="w-[140px] sm:w-[160px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="daily-summary" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:grid sm:grid-cols-5 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="daily-summary" 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80",
                "data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{t.reports.dailySummary}</span>
              <span className="sm:hidden text-xs">{t.reports.summary}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600",
                "data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{t.reports.salesReport}</span>
              <span className="sm:hidden text-xs">{t.reports.sales}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="supplier-reports" 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600",
                "data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{t.reports.supplierReports}</span>
              <span className="sm:hidden text-xs">{t.reports.supplier}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="supplier-due" 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600",
                "data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{t.reports.supplierDue}</span>
              <span className="sm:hidden text-xs">{t.reports.due}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="customer-due" 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600",
                "data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{t.reports.customerDue}</span>
              <span className="sm:hidden text-xs">{t.reports.customer}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="daily-summary" className="animate-card-enter">
          <DailySummaryReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="sales" className="animate-card-enter">
          <SalesReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="supplier-reports" className="animate-card-enter">
          <SupplierReportsView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="supplier-due" className="animate-card-enter">
          <SupplierDueReportView />
        </TabsContent>

        <TabsContent value="customer-due" className="animate-card-enter">
          <CustomerDuesReportView dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
