import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, CheckCircle, Eye, Trash2, Clock, Package } from 'lucide-react';
import { useStockShortList } from '@/hooks/useStockShortList';
import { format } from 'date-fns';

export default function PendingOrders() {
  const { pendingOrders, isLoading, markAsOrdered, deleteOrder } = useStockShortList();
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);

  const handleWhatsAppSend = (order: typeof pendingOrders[0]) => {
    if (!order.supplier?.whatsapp_number) {
      alert('No WhatsApp number set for this supplier');
      return;
    }

    // Format order message
    let message = `🏪 *Order from Pharmacy*\n`;
    message += `📋 Order #: ${order.order_number}\n`;
    message += `📅 Date: ${format(new Date(order.order_date), 'dd MMM yyyy')}\n\n`;
    message += `📦 *Items:*\n`;
    
    order.items?.forEach((item, index) => {
      message += `${index + 1}. ${item.medicine_name} - ${item.quantity} ${item.unit}`;
      if (item.is_tax_applicable) message += ` (Tax applicable)`;
      message += `\n`;
    });

    message += `\n_Please confirm this order._`;

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${order.supplier.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Pending Orders</h1>
        <p className="text-muted-foreground mt-1">
          Orders waiting to be sent to suppliers
        </p>
      </div>

      {pendingOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Pending Orders</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Create orders from Stock Short List to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Supplier: <span className="font-medium">{order.supplier?.name || 'Unknown'}</span>
                      {' • '}
                      {format(new Date(order.order_date), 'dd MMM yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Dialog open={viewingOrder === order.id} onOpenChange={(open) => setViewingOrder(open ? order.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                          <DialogDescription>
                            Supplier: {order.supplier?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-center">Tax</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items?.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    {item.medicine_name}
                                    <span className="text-muted-foreground text-xs ml-1">
                                      ({item.unit})
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-center">
                                    {item.is_tax_applicable ? 'Yes' : 'No'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWhatsAppSend(order)}
                      disabled={!order.supplier?.whatsapp_number}
                      title={order.supplier?.whatsapp_number ? 'Send to WhatsApp' : 'No WhatsApp number'}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Ordered
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark as Ordered?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This confirms that the order has been placed with the supplier.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => markAsOrdered(order.id)}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this order.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteOrder(order.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{order.items?.length || 0} item(s)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
