import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

export default function Medicines() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Medicines</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medicine inventory and batches
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>Track all medicines, batches, and expiry dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No medicines yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Start by adding your first medicine to track inventory and batches.
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medicine
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
