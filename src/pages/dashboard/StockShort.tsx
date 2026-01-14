import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';

export default function StockShort() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Stock Short List</h1>
          <p className="text-muted-foreground mt-1">
            Manage manufacturer-based order notes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Order Note
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submitted Orders</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

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
              Create order notes to track low stock items and submit to manufacturers.
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Order Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
