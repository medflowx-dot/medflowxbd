import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackageCheck, ChevronDown, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useStockOrders, StockOrder } from '@/hooks/useStockOrders';
import { useMedicines } from '@/hooks/useMedicines';

export function PurchaseHistory() {
  const { orders, isLoading } = useStockOrders();
  const { medicines } = useMedicines();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const receivedOrders = orders.filter((order) => order.status === 'received');

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Get batch details for a medicine
  const getMedicineBatches = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    return medicine?.batches || [];
  };

  // Find the most recent batch added after the order was received
  const getRecentBatch = (medicineId: string, receivedAt: string) => {
    const batches = getMedicineBatches(medicineId);
    const receivedDate = new Date(receivedAt);
    
    // Find batches created after or around the received time
    const recentBatches = batches.filter((batch) => {
      const batchCreated = new Date(batch.created_at);
      // Within 24 hours of receiving the order
      const timeDiff = Math.abs(batchCreated.getTime() - receivedDate.getTime());
      return timeDiff < 24 * 60 * 60 * 1000;
    });

    return recentBatches[0];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading purchase history...
        </CardContent>
      </Card>
    );
  }

  if (receivedOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>View all received orders with batch details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <PackageCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No purchase history</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Received orders will appear here with their batch details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              Purchase History
            </CardTitle>
            <CardDescription>
              {receivedOrders.length} received order{receivedOrders.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {receivedOrders.map((order) => (
              <Collapsible
                key={order.id}
                open={expandedOrders.includes(order.id)}
                onOpenChange={() => toggleExpand(order.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedOrders.includes(order.id) ? 'rotate-180' : ''
                          }`}
                        />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.manufacturer}</span>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Received
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Ordered: {format(new Date(order.created_at), 'PP')}
                            </span>
                            {order.received_at && (
                              <span className="flex items-center gap-1">
                                <PackageCheck className="h-3 w-3" />
                                Received: {format(new Date(order.received_at), 'PP')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {order.items?.length || 0} items
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-4">
                      {order.notes && (
                        <p className="text-sm text-muted-foreground mb-4 italic border-l-2 border-primary pl-3">
                          "{order.notes}"
                        </p>
                      )}

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead className="text-center">Ordered Qty</TableHead>
                            <TableHead className="text-center">Stock Before</TableHead>
                            <TableHead>Batch Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items?.map((item) => {
                            const recentBatch = order.received_at
                              ? getRecentBatch(item.medicine_id, order.received_at)
                              : null;

                            return (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {item.medicine_name}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.quantity_to_order} {item.unit}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {item.current_stock} {item.unit}
                                </TableCell>
                                <TableCell>
                                  {recentBatch ? (
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                          {recentBatch.batch_number}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          Qty: {recentBatch.quantity}
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Exp: {format(new Date(recentBatch.expiry_date), 'PP')}
                                        {recentBatch.supplier_name && (
                                          <> • {recentBatch.supplier_name}</>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      No batch linked
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {order.submitted_at && (
                        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
                          <p>Submitted: {format(new Date(order.submitted_at), 'PPp')}</p>
                          {order.received_at && (
                            <p>Received: {format(new Date(order.received_at), 'PPp')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
