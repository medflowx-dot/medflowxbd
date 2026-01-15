import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ClipboardList, Send, PackageCheck } from 'lucide-react';
import { useMedicines, MedicineWithBatches } from '@/hooks/useMedicines';
import { useStockOrders } from '@/hooks/useStockOrders';
import { LowStockList } from '@/components/stock-short/LowStockList';
import { OrderNotesList } from '@/components/stock-short/OrderNotesList';
import { PurchaseHistory } from '@/components/stock-short/PurchaseHistory';
import { CreateOrderDialog } from '@/components/stock-short/CreateOrderDialog';

export default function StockShort() {
  const { medicines } = useMedicines();
  const { pendingOrders, submittedOrders, orders } = useStockOrders();
  const receivedOrders = orders.filter((o) => o.status === 'received');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineWithBatches[]>([]);

  const lowStockCount = medicines.filter(
    (m) => m.min_stock_level && m.total_stock <= m.min_stock_level
  ).length;

  const handleCreateOrder = (medicines: MedicineWithBatches[]) => {
    setSelectedMedicines(medicines);
    setCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Stock Short List</h1>
        <p className="text-muted-foreground mt-1">
          Manage manufacturer-based order notes for low stock items
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Items
            </CardDescription>
            <CardTitle className="text-2xl">{lowStockCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Pending Orders
            </CardDescription>
            <CardTitle className="text-2xl">{pendingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submitted Orders
            </CardDescription>
            <CardTitle className="text-2xl">{submittedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4" />
              Received
            </CardDescription>
            <CardTitle className="text-2xl">{receivedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="low-stock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock">
          <LowStockList onCreateOrder={handleCreateOrder} />
        </TabsContent>

        <TabsContent value="orders">
          <OrderNotesList />
        </TabsContent>

        <TabsContent value="history">
          <PurchaseHistory />
        </TabsContent>
      </Tabs>

      <CreateOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        medicines={selectedMedicines}
      />
    </div>
  );
}
