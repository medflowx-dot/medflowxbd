import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Eye, PackageCheck, Download, Share2 } from 'lucide-react';
import { useStockShortList } from '@/hooks/useStockShortList';
import { format } from 'date-fns';
import { generateOrderPDF, OrderPDFData } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

export default function ReceivedOrders() {
  const { receivedOrders, isLoading } = useStockShortList();
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);

  const handleDownloadPDF = (order: typeof receivedOrders[0]) => {
    const pdfData: OrderPDFData = {
      order_number: order.order_number,
      order_date: order.order_date,
      supplier_name: order.supplier?.name || 'Unknown',
      supplier_phone: order.supplier?.phone || null,
      items: order.items?.map(item => ({
        medicine_name: item.medicine_name,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        is_tax_applicable: item.is_tax_applicable,
      })) || [],
      status: 'Received',
      total_amount: order.total_amount,
      paid_amount: order.paid_amount,
      due_amount: order.due_amount,
    };
    
    generateOrderPDF(pdfData);
    toast.success('PDF downloaded successfully');
  };

  const handleShareOrder = async (order: typeof receivedOrders[0]) => {
    const pdfData: OrderPDFData = {
      order_number: order.order_number,
      order_date: order.order_date,
      supplier_name: order.supplier?.name || 'Unknown',
      supplier_phone: order.supplier?.phone || null,
      items: order.items?.map(item => ({
        medicine_name: item.medicine_name,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        is_tax_applicable: item.is_tax_applicable,
      })) || [],
      status: 'Received',
      total_amount: order.total_amount,
      paid_amount: order.paid_amount,
      due_amount: order.due_amount,
    };
    
    const doc = generateOrderPDF(pdfData, false);
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], `order-${order.order_number}.pdf`, { 
      type: 'application/pdf' 
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Order ${order.order_number}`,
          text: `Purchase Order for ${order.supplier?.name}`,
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      doc.save(`order-${order.order_number}.pdf`);
      toast.info('Share not supported - PDF downloaded instead');
    }
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
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Received Orders</h1>
        <p className="text-muted-foreground mt-1">
          Completed orders that have been received
        </p>
      </div>

      {receivedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <PackageCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Received Orders</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Receive ordered items to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receivedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Received
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Supplier: <span className="font-medium">{order.supplier?.name || 'Unknown'}</span>
                      {' • '}
                      Received: {order.received_at ? format(new Date(order.received_at), 'dd MMM yyyy') : 'N/A'}
                    </CardDescription>
                  </div>
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

                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-medium">৳{order.total_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid Amount:</span>
                            <span className="font-medium text-green-600">৳{order.paid_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Due Amount:</span>
                            <span className="font-semibold text-destructive">৳{order.due_amount.toFixed(2)}</span>
                          </div>
                          {order.payment_method && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Payment Method:</span>
                              <span className="capitalize">{order.payment_method}</span>
                            </div>
                          )}
                        </div>

                        {order.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span>
                            <p className="text-muted-foreground mt-1">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(order)}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => handleShareOrder(order)}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{order.items?.length || 0} item(s)</span>
                  </div>
                  <div className="text-muted-foreground">
                    Total: <span className="font-medium text-foreground">৳{order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.due_amount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      Due: ৳{order.due_amount.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
