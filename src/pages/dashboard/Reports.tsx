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
import { FileText, TrendingUp, Truck, BarChart3, Users, Package } from 'lucide-react';

export default function Reports() {
  const presets = getDateRangePresets();
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');
  const [dateRange, setDateRange] = useState<ReportDateRange>({
    start: presets.thisMonth.start,
    end: presets.thisMonth.end,
  });
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

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
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Generate and export detailed reports with PDF
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last7Days">Last 7 Days</SelectItem>
              <SelectItem value="last30Days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {selectedPreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                date={customStartDate}
                onDateChange={(date) => handleCustomDateChange(date, customEndDate)}
                placeholder="Start date"
                className="w-[160px]"
              />
              <span className="text-muted-foreground">to</span>
              <DatePicker
                date={customEndDate}
                onDateChange={(date) => handleCustomDateChange(customStartDate, date)}
                placeholder="End date"
                className="w-[160px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="daily-summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily-summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Summary</span>
            <span className="sm:hidden">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Sales Report</span>
            <span className="sm:hidden">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="supplier-reports" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Supplier Reports</span>
            <span className="sm:hidden">Supplier</span>
          </TabsTrigger>
          <TabsTrigger value="supplier-due" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Supplier Due</span>
            <span className="sm:hidden">Due</span>
          </TabsTrigger>
          <TabsTrigger value="customer-due" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Customer Due</span>
            <span className="sm:hidden">Customer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-summary">
          <DailySummaryReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="supplier-reports">
          <SupplierReportsView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="supplier-due">
          <SupplierDueReportView />
        </TabsContent>

        <TabsContent value="customer-due">
          <CustomerDuesReportView dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
