import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export function AddClientDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [existingClientInfo, setExistingClientInfo] = useState<{ name?: string; pharmacy?: string } | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    pharmacyName: '',
    phone: '',
    planType: 'trial',
  });

  // Debounced email check
  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailExists(null);
      setExistingClientInfo(null);
      return;
    }

    setIsCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-email', {
          body: { email: formData.email },
        });

        if (error) {
          console.error('Error checking email:', error);
          setEmailExists(null);
        } else {
          setEmailExists(data?.exists || false);
          if (data?.exists && data?.profile) {
            setExistingClientInfo({
              name: data.profile.full_name,
              pharmacy: data.profile.pharmacy_name,
            });
          } else {
            setExistingClientInfo(null);
          }
        }
      } catch (err) {
        console.error('Email check failed:', err);
        setEmailExists(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Call the edge function to create the client
      const { data, error } = await supabase.functions.invoke('create-client', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          pharmacyName: formData.pharmacyName,
          phone: formData.phone,
          planType: formData.planType,
        },
      });

      // Parse error from Edge Function response
      const errorData = await parseEdgeFunctionError(error, data);
      
      if (errorData?.error) {
        toast.error(errorData.error);
        setIsLoading(false);
        return;
      }

      toast.success('Client created successfully');
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        pharmacyName: '',
        phone: '',
        planType: 'trial',
      });
      
      // Refresh the clients list
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.message || 'Failed to create client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new pharmacy client account with subscription
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={emailExists ? 'border-destructive pr-10' : emailExists === false ? 'border-green-500 pr-10' : ''}
              />
              {isCheckingEmail && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isCheckingEmail && emailExists === true && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
              {!isCheckingEmail && emailExists === false && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {emailExists && existingClientInfo && (
              <p className="text-sm text-destructive">
                Email already registered: {existingClientInfo.pharmacy || existingClientInfo.name || 'Existing client'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Owner Name</Label>
            <Input
              id="fullName"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pharmacyName">Pharmacy Name</Label>
            <Input
              id="pharmacyName"
              placeholder="Pharmacy name"
              value={formData.pharmacyName}
              onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planType">Subscription Plan</Label>
            <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Free Trial (14 days)</SelectItem>
                <SelectItem value="monthly">Monthly Plan</SelectItem>
                <SelectItem value="yearly">Yearly Plan</SelectItem>
                <SelectItem value="lifetime">Lifetime Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || emailExists === true}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
