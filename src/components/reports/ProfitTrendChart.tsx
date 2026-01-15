import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfitTrendReport, ReportDateRange } from '@/hooks/useReports';
import { Loader2, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';

interface ProfitTrendChartProps {
  dateRange: ReportDateRange;
}

export function ProfitTrendChart({ dateRange }: ProfitTrendChartProps) {
  const { data, isLoading } = useProfitTrendReport(dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.dailyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            No profit data available for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  const { dailyData, comparison, summary } = data;

  const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Profit Trends
        </CardTitle>
        <CardDescription>
          Daily profit analysis with period comparison
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Comparison Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-primary/10 space-y-1">
            <p className="text-sm text-muted-foreground">Current Period Profit</p>
            <p className={`text-2xl font-bold ${summary.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.currentProfit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {dailyData.length} day{dailyData.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted space-y-1">
            <p className="text-sm text-muted-foreground">Previous Period</p>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.previousProfit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {comparison.previousPeriod.length} day{comparison.previousPeriod.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted space-y-1">
            <p className="text-sm text-muted-foreground">Change</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${summary.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(summary.changePercent)}
              </p>
              {summary.changePercent >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <Badge variant={summary.changePercent >= 0 ? 'default' : 'destructive'}>
              {summary.changePercent >= 0 ? 'Growth' : 'Decline'}
            </Badge>
          </div>
          
          <div className="p-4 rounded-lg bg-muted space-y-1">
            <p className="text-sm text-muted-foreground">Avg Daily Profit</p>
            <p className={`text-2xl font-bold ${summary.avgDailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.avgDailyProfit)}
            </p>
            <p className="text-xs text-muted-foreground">
              vs {formatCurrency(summary.avgPreviousDailyProfit)} prev
            </p>
          </div>
        </div>

        <Tabs defaultValue="line" className="space-y-4">
          <TabsList>
            <TabsTrigger value="line">Trend Line</TabsTrigger>
            <TabsTrigger value="bar">Daily Bars</TabsTrigger>
            <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="line" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => format(new Date(label), 'EEEE, MMM dd, yyyy')}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(142 76% 36%)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                  labelFormatter={(label) => format(new Date(label), 'EEEE, MMM dd, yyyy')}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="comparison" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparison.currentPeriod}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dayIndex"
                  tickFormatter={(value) => `Day ${value + 1}`}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Current Period"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {comparison.previousPeriod.length > 0 && (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart
                    data={comparison.previousPeriod}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="dayIndex"
                      tickFormatter={(value) => `Day ${value + 1}`}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Previous Period']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Previous Period"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
