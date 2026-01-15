import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ClipboardList,
  ChevronDown,
  MoreVertical,
  Send,
  PackageCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useStockOrders, StockOrder } from '@/hooks/useStockOrders';

const statusColors: Record<StockOrder['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function OrderNotesList() {
  const { orders, isLoading, updateOrderStatus, deleteOrder } = useStockOrders();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOrder.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading orders...
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Notes</CardTitle>
          <CardDescription>Track stock orders by manufacturer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No order notes</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Select low stock items above to create order notes for manufacturers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Notes</CardTitle>
          <CardDescription>Track stock orders by manufacturer</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {orders.map((order) => (
                <Collapsible
                  key={order.id}
                  open={expandedOrders.includes(order.id)}
                  onOpenChange={() => toggleExpand(order.id)}
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-3">
                      <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedOrders.includes(order.id) ? 'rotate-180' : ''
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.manufacturer}</span>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'PPp')}
                            {order.items && ` • ${order.items.length} item(s)`}
                          </p>
                        </div>
                      </CollapsibleTrigger>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus.mutate({ id: order.id, status: 'submitted' })
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Submitted
                            </DropdownMenuItem>
                          )}
                          {order.status === 'submitted' && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus.mutate({ id: order.id, status: 'received' })
                              }
                            >
                              <PackageCheck className="h-4 w-4 mr-2" />
                              Mark as Received
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'pending' || order.status === 'submitted') && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus.mutate({ id: order.id, status: 'cancelled' })
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(order.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t px-3 py-2 bg-muted/30">
                        {order.notes && (
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            "{order.notes}"
                          </p>
                        )}
                        <div className="space-y-1">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm py-1"
                            >
                              <span>{item.medicine_name}</span>
                              <span className="text-muted-foreground">
                                Order: {item.quantity_to_order} {item.unit}
                                <span className="mx-2">•</span>
                                Current: {item.current_stock}
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.submitted_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted: {format(new Date(order.submitted_at), 'PPp')}
                          </p>
                        )}
                        {order.received_at && (
                          <p className="text-xs text-muted-foreground">
                            Received: {format(new Date(order.received_at), 'PPp')}
                          </p>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
