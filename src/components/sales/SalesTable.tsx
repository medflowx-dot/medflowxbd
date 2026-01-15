import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Receipt, ChevronDown, ChevronRight, Zap, ClipboardList, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSales, type Sale } from '@/hooks/useSales';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SalesTableProps {
  sales: Sale[];
  showEntryType?: boolean;
}

export function SalesTable({ sales, showEntryType = true }: SalesTableProps) {
  const { deleteSale } = useSales();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch sale items for expanded rows
  const { data: saleItems } = useQuery({
    queryKey: ['sale-items', Array.from(expandedRows)],
    queryFn: async () => {
      if (expandedRows.size === 0) return {};
      
      const { data, error } = await supabase
        .from('sale_items')
        .select('*, medicine_batches:batch_id(purchase_price)')
        .in('sale_id', Array.from(expandedRows));
      
      if (error) throw error;
      
      // Group by sale_id and include purchase_price
      const grouped: Record<string, Array<typeof data[number] & { purchase_price: number }>> = {};
      data.forEach((item) => {
        const purchasePrice = item.purchase_price || (item.medicine_batches as any)?.purchase_price || 0;
        const itemWithPrice = { ...item, purchase_price: purchasePrice };
        if (!grouped[item.sale_id]) grouped[item.sale_id] = [];
        grouped[item.sale_id].push(itemWithPrice);
      });
      return grouped;
    },
    enabled: expandedRows.size > 0,
  });

  const toggleRow = (saleId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedRows(newExpanded);
  };

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No sales yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          Create your first sale to start tracking transactions.
        </p>
      </div>
    );
  }

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'piece': return 'Pcs';
      case 'strip': return 'Strip';
      case 'box': return 'Box';
      default: return unit;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showEntryType && <TableHead className="w-10"></TableHead>}
            <TableHead>Entry ID</TableHead>
            {showEntryType && <TableHead>Type</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const isExpanded = expandedRows.has(sale.id);
            const isDetailedSale = sale.entry_type === 'detailed';
            const items = saleItems?.[sale.id] || [];
            
            // Calculate profit for detailed sales
            const totalCost = items.reduce((sum, item) => sum + (Number(item.purchase_price) * item.quantity), 0);
            const saleProfit = isDetailedSale && items.length > 0 ? Number(sale.total_amount) - totalCost : null;

            return (
              <Collapsible key={sale.id} open={isExpanded} asChild>
                <>
                  <TableRow className={isExpanded ? 'border-b-0' : ''}>
                    {showEntryType && (
                      <TableCell className="py-2">
                        {isDetailedSale && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRow(sale.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">
                      {sale.invoice_number}
                    </TableCell>
                    {showEntryType && (
                      <TableCell>
                        {sale.entry_type === 'quick' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Quick
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <ClipboardList className="h-3 w-3" />
                            Detailed
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {format(new Date(sale.sale_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ৳{Number(sale.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ৳{Number(sale.paid_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(sale.due_amount) > 0 ? (
                        <span className="text-orange-600 font-medium">৳{Number(sale.due_amount).toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sale.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete entry "{sale.invoice_number}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSale.mutate(sale.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isDetailedSale && (
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={showEntryType ? 9 : 7} className="py-2 px-6">
                          {items.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Sale Items:</p>
                              {items.map((item) => {
                                const itemProfit = Number(item.total_price) - (Number(item.purchase_price) * item.quantity);
                                return (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span>
                                      {item.medicine_name} 
                                      <span className="text-muted-foreground ml-1">
                                        ({item.quantity} {getUnitLabel(item.sale_unit || 'piece')} @ ৳{Number(item.unit_price).toFixed(2)})
                                      </span>
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium">৳{Number(item.total_price).toFixed(2)}</span>
                                      {Number(item.purchase_price) > 0 && (
                                        <span className={`text-xs ${itemProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          ({itemProfit >= 0 ? '+' : ''}৳{itemProfit.toFixed(2)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {saleProfit !== null && totalCost > 0 && (
                                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                  <span className="flex items-center gap-1 font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    Total Profit
                                  </span>
                                  <span className={`font-bold ${saleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {saleProfit >= 0 ? '+' : ''}৳{saleProfit.toFixed(2)}
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({((saleProfit / totalCost) * 100).toFixed(1)}% margin)
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading items...</p>
                          )}
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  )}
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
