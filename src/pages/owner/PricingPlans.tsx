import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePricingPlans, useUpdatePricingPlan, PricingPlan } from '@/hooks/useOwnerData';
import { Loader2, FileText, Edit, Check, X, Crown, Clock, Calendar, Infinity } from 'lucide-react';

export default function PricingPlans() {
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDays, setEditDays] = useState('');
  const [editUserLimit, setEditUserLimit] = useState('');

  const { data: plans, isLoading } = usePricingPlans();
  const updatePlan = useUpdatePricingPlan();

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setEditPrice(plan.price.toString());
    setEditDays(plan.duration_days?.toString() || '');
    setEditUserLimit(plan.user_limit?.toString() || '');
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    
    await updatePlan.mutateAsync({
      planId: editingPlan.id,
      updates: {
        price: parseFloat(editPrice) || 0,
        duration_days: editDays ? parseInt(editDays) : null,
        user_limit: editUserLimit ? parseInt(editUserLimit) : null,
      },
    });
    setEditingPlan(null);
  };

  const handleToggleActive = async (plan: PricingPlan) => {
    await updatePlan.mutateAsync({
      planId: plan.id,
      updates: { is_active: !plan.is_active },
    });
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'trial':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'monthly':
        return <Calendar className="h-6 w-6 text-green-500" />;
      case 'yearly':
        return <Calendar className="h-6 w-6 text-purple-500" />;
      case 'lifetime':
        return <Crown className="h-6 w-6 text-amber-500" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="py-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> Changes made here will auto-sync with the marketing website pricing section.
          </p>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans?.map((plan) => (
          <Card key={plan.id} className={`border-0 shadow-card relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            {!plan.is_active && (
              <Badge className="absolute top-3 right-3 bg-gray-500">Inactive</Badge>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {getPlanIcon(plan.plan_name)}
                <div>
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <CardDescription className="capitalize">{plan.plan_name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">
                  ৳{plan.price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan.duration_days 
                    ? `${plan.duration_days} days`
                    : plan.plan_name === 'lifetime' 
                    ? 'One-time payment'
                    : 'No duration set'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">User Limit</span>
                  <span className="font-medium">
                    {plan.user_limit ? plan.user_limit : <Infinity className="h-4 w-4" />}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {plan.features && Object.entries(plan.features).map(([key, value]) => (
                    <Badge 
                      key={key} 
                      variant="outline" 
                      className={`text-xs ${value ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}
                    >
                      {value ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                      {key.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={plan.is_active} 
                    onCheckedChange={() => handleToggleActive(plan)}
                  />
                  <span className="text-sm">{plan.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingPlan?.display_name}</DialogTitle>
            <DialogDescription>
              Update pricing and settings for this plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Price (BDT)</Label>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                value={editDays}
                onChange={(e) => setEditDays(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">Leave empty for lifetime plans</p>
            </div>
            <div className="space-y-2">
              <Label>User Limit</Label>
              <Input
                type="number"
                value={editUserLimit}
                onChange={(e) => setEditUserLimit(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">Maximum staff members allowed</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updatePlan.isPending}>
              {updatePlan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
