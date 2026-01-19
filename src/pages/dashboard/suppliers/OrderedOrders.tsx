import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package, Eye, PackageCheck, ShoppingCart, Trash2, Undo2, Download, Share2 } from 'lucide-react';
import { useStockShortList } from '@/hooks/useStockShortList';
import { format } from 'date-fns';
import { generateOrderPDF, OrderPDFData } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

export default function OrderedOrders() {
  const { orderedOrders, isLoading, receiveOrder, deleteOrder, revertToPending } = useStockShortList();
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<string | null>(null);
  
  const [receiveForm, setReceiveForm] = useState({
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    notes: '',
  });

  const handleReceive = async (orderId: string) => {
    try {
      await receiveOrder({
        orderId,
        totalAmount: receiveForm.totalAmount,
        paidAmount: receiveForm.paidAmount,
        paymentMethod: receiveForm.paymentMethod,
        notes: receiveForm.notes,
      });
      setReceivingOrder(null);
      setReceiveForm({ totalAmount: 0, paidAmount: 0, paymentMethod: 'cash', notes: '' });
    } catch (error) {
      // handled in hook
    }
  };

  const handleDownloadPDF = (order: typeof orderedOrders[0]) => {
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
      status: 'Ordered',
    };
    
    generateOrderPDF(pdfData);
    toast.success('PDF downloaded successfully');
  };

  const handleShareOrder = async (order: typeof orderedOrders[0]) => {
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
      status: 'Ordered',
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
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Ordered</h1>
        <p className="text-muted-foreground mt-1">
          Orders that have been placed, awaiting delivery
        </p>
      </div>

      {orderedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Ordered Items</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Mark pending orders as "Ordered" to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orderedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Ordered
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Supplier: <span className="font-medium">{order.supplier?.name || 'Unknown'}</span>
                      {' • '}
                      Ordered: {order.ordered_at ? format(new Date(order.ordered_at), 'dd MMM yyyy') : 'N/A'}
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Undo2 className="h-4 w-4 mr-1" />
                          Revert
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revert to Pending?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move order {order.order_number} back to Pending status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revertToPending(order.id)}>
                            Revert
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog 
                      open={receivingOrder === order.id} 
                      onOpenChange={(open) => {
                        setReceivingOrder(open ? order.id : null);
                        if (!open) {
                          setReceiveForm({ totalAmount: 0, paidAmount: 0, paymentMethod: 'cash', notes: '' });
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm">
                          <PackageCheck className="h-4 w-4 mr-1" />
                          Receive
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Receive Order</DialogTitle>
                          <DialogDescription>
                            Enter the bill details for {order.order_number}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Total Bill Amount *</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={receiveForm.totalAmount}
                              onChange={(e) => setReceiveForm({ 
                                ...receiveForm, 
                                totalAmount: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="Enter total amount"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Paid Amount</Label>
                            <Input
                              type="number"
                              min={0}
                              max={receiveForm.totalAmount}
                              step="0.01"
                              value={receiveForm.paidAmount}
                              onChange={(e) => setReceiveForm({ 
                                ...receiveForm, 
                                paidAmount: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="Amount paid now"
                            />
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span>Due Amount:</span>
                              <span className="font-semibold text-destructive">
                                ৳{(receiveForm.totalAmount - receiveForm.paidAmount).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select
                              value={receiveForm.paymentMethod}
                              onValueChange={(value) => setReceiveForm({ ...receiveForm, paymentMethod: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                <SelectItem value="bkash">bKash</SelectItem>
                                <SelectItem value="nagad">Nagad</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                              value={receiveForm.notes}
                              onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                              placeholder="Any notes about this delivery..."
                              rows={2}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setReceivingOrder(null)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleReceive(order.id)}
                              disabled={receiveForm.totalAmount <= 0}
                            >
                              Confirm Received
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

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
                            This will permanently delete order {order.order_number}. This action cannot be undone.
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
