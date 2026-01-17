import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, Clock, CalendarIcon, FileDown, Package } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useExpiryMonitoring, useExpirySummary, ExpiryFilter } from '@/hooks/useExpiryMonitoring';
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

  const { data: batches, isLoading } = useExpiryMonitoring(filter, customRange);
  const { data: summary } = useExpirySummary();

  const handleCustomRangeApply = () => {
    if (dateFrom && dateTo) {
      setCustomRange({ from: dateFrom, to: dateTo });
      setFilter('custom');
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">{daysUntilExpiry}d left</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">{daysUntilExpiry}d left</Badge>;
      case 'caution':
        return <Badge className="bg-yellow-500 text-black">{daysUntilExpiry}d left</Badge>;
      default:
        return <Badge variant="outline">{daysUntilExpiry}d left</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Expiry Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track medicine batch expiry dates and manage stock accordingly
          </p>
        </div>
        <Button variant="outline" disabled>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600">Expired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.expired.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">batches</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600">Within 30 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary?.within30Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">batches</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600">Within 60 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary?.within60Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">batches</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600">Within 90 Days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary?.within90Days.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total at Risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summary?.totalAtRisk || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              total batches
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
              Batch Expiry List
            </CardTitle>
            
            {/* Custom Date Range */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateTo ? format(dateTo, 'MMM dd') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button size="sm" onClick={handleCustomRangeApply} disabled={!dateFrom || !dateTo}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ExpiryFilter)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="expired" className="text-red-600">Expired</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="60days">60 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : batches?.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items found for this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch No.</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
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
                          <TableCell className="text-right">
                            {batch.batch_number}
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
