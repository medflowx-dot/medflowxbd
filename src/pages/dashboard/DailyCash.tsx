import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CashFlowSummary } from '@/components/daily-cash/CashFlowSummary';
import { DailyTransactionsList } from '@/components/daily-cash/DailyTransactionsList';
import { AddCostDialog } from '@/components/daily-cash/AddCostDialog';
import { SetOpeningCashDialog } from '@/components/daily-cash/SetOpeningCashDialog';
import { CalendarIcon, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DailyCash() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daily Cash</h1>
            <p className="text-muted-foreground">
              Auto-calculated cash flow from all transactions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <SetOpeningCashDialog date={selectedDate} />
          <AddCostDialog date={selectedDate} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Cash flow is auto-calculated from sales, due collections, supplier payments, and daily costs. 
          Only <strong>cash transactions</strong> are counted. You can only manually set the opening cash and add daily costs.
        </p>
      </div>

      {/* Cash Flow Summary Cards */}
      <CashFlowSummary date={selectedDate} />

      {/* Transactions List */}
      <DailyTransactionsList date={selectedDate} />
    </div>
  );
}
