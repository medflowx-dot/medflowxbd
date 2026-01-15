import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DailySummaryReportView } from '@/components/reports/DailySummaryReport';
import { SalesReportView } from '@/components/reports/SalesReport';
import { SupplierDueReportView } from '@/components/reports/SupplierDueReport';
import { getDateRangePresets, ReportDateRange } from '@/hooks/useReports';
import { CalendarIcon, FileText, TrendingUp, Truck, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
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
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, 'MMM dd, yyyy') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => handleCustomDateChange(date, customEndDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, 'MMM dd, yyyy') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => handleCustomDateChange(customStartDate, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="daily-summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
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
          <TabsTrigger value="supplier-due" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Supplier Due</span>
            <span className="sm:hidden">Supplier</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-summary">
          <DailySummaryReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesReportView dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="supplier-due">
          <SupplierDueReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
