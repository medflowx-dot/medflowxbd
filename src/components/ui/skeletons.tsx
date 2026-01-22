import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";
import { cn } from "@/lib/utils";

// Stat Card Skeleton - for dashboard quick stats
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shrink-0" />
        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
        <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
      </CardContent>
    </Card>
  );
}

// Multiple Stat Cards Skeleton
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className={cn(
            "h-4",
            i === 0 ? "w-16" : i === columns - 1 ? "w-8" : "w-20"
          )} />
        </td>
      ))}
    </tr>
  );
}

// Full Table Skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 6,
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px]">
        {showHeader && (
          <thead>
            <tr className="border-b bg-muted/30">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = "200px" }: { height?: string }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="w-full h-full flex flex-col justify-end gap-1 px-4">
        <div className="flex items-end justify-between h-full gap-2">
          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md" 
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between pt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Expiry Stats Skeleton (4 badge items)
export function ExpiryStatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-1.5 sm:p-2 md:p-3 rounded-lg bg-muted/50">
          <Skeleton className="h-5 sm:h-7 w-8 sm:w-12 mb-1" />
          <Skeleton className="h-3 w-12 sm:w-16" />
        </div>
      ))}
    </div>
  );
}

// Transaction Item Skeleton
export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 sm:w-32" />
          <Skeleton className="h-3 w-16 sm:w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 sm:w-20" />
    </div>
  );
}

// Transactions List Skeleton
export function TransactionsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Due Alerts Skeleton (for customer/supplier dues)
export function DueAlertsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4">
      {[1, 2].map((section) => (
        <div key={section} className="space-y-1.5 sm:space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30">
                <Skeleton className="h-4 w-16 sm:w-24" />
                <Skeleton className="h-4 w-12 sm:w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-6 sm:h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

// Summary Cards Skeleton (Sales page style)
export function SummaryCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="transition-all duration-300">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-3 w-16 sm:w-20" />
            </div>
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-28 mt-2" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <Skeleton className="h-3 w-12 sm:w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
