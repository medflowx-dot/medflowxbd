import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Receipt, ChevronDown, ChevronRight, Zap, ClipboardList } from 'lucide-react';
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
import { useLanguage } from '@/contexts/LanguageContext';

interface SalesTableProps {
  sales: Sale[];
  showEntryType?: boolean;
}

export function SalesTable({ sales, showEntryType = true }: SalesTableProps) {
  const { deleteSale } = useSales();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  const { data: saleItems } = useQuery({
    queryKey: ['sale-items', Array.from(expandedRows)],
    queryFn: async () => {
      if (expandedRows.size === 0) return {};
      
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .in('sale_id', Array.from(expandedRows));
      
      if (error) throw error;
      
      const grouped: Record<string, typeof data> = {};
      data.forEach((item) => {
        if (!grouped[item.sale_id]) grouped[item.sale_id] = [];
        grouped[item.sale_id].push(item);
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
        <h3 className="font-semibold text-lg">{t.sales.noSalesYet}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          {t.sales.createFirstSale}
        </p>
      </div>
    );
  }

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'piece': return t.sales.pcs;
      case 'strip': return t.sales.strip;
      case 'box': return t.sales.box;
      default: return unit;
    }
  };

  return (
    <div className="-mx-3 sm:mx-0 overflow-x-auto">
      <Table className="min-w-[400px]">
        <TableHeader>
          <TableRow>
            {showEntryType && <TableHead className="w-8 hidden sm:table-cell"></TableHead>}
            <TableHead className="text-xs sm:text-sm">{t.sales.id}</TableHead>
            {showEntryType && <TableHead className="hidden md:table-cell text-xs sm:text-sm">{t.sales.type}</TableHead>}
            <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t.sales.date}</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">{t.sales.total}</TableHead>
            <TableHead className="text-right hidden md:table-cell text-xs sm:text-sm">{t.sales.paid}</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">{t.sales.due}</TableHead>
            <TableHead className="hidden lg:table-cell text-xs sm:text-sm">{t.sales.method}</TableHead>
            <TableHead className="text-right w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const isExpanded = expandedRows.has(sale.id);
            const isDetailedSale = sale.entry_type === 'detailed';
            const items = saleItems?.[sale.id] || [];

            return (
              <Collapsible key={sale.id} open={isExpanded} asChild>
                <>
                  <TableRow className={isExpanded ? 'border-b-0' : ''}>
                    {showEntryType && (
                      <TableCell className="py-2 hidden sm:table-cell">
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
                    <TableCell className="font-mono text-xs">
                      {sale.invoice_number.replace('INV-', '')}
                    </TableCell>
                    {showEntryType && (
                      <TableCell className="hidden md:table-cell">
                        {sale.entry_type === 'quick' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            {t.sales.quick}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <ClipboardList className="h-3 w-3" />
                            {t.sales.detailed}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(sale.sale_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ৳{Number(sale.total_amount).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right text-green-600 hidden md:table-cell">
                      ৳{Number(sale.paid_amount).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(sale.due_amount) > 0 ? (
                        <span className="text-orange-600 font-medium">৳{Number(sale.due_amount).toFixed(0)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
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
                              <AlertDialogTitle>{t.sales.deleteSale}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.sales.deleteSaleConfirm} "{sale.invoice_number}"? {t.sales.cannotBeUndone}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSale.mutate(sale.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.actions.delete}
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
                              <p className="text-xs font-medium text-muted-foreground mb-2">{t.sales.saleItems}:</p>
                              {items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>
                                    {item.medicine_name} 
                                    <span className="text-muted-foreground ml-1">
                                      ({item.quantity} {getUnitLabel(item.sale_unit || 'piece')} @ ৳{Number(item.unit_price).toFixed(2)})
                                    </span>
                                  </span>
                                  <span className="font-medium">৳{Number(item.total_price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{t.sales.loadingItems}</p>
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