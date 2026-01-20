import { useState } from 'react';
import { useAllPaymentRequests, useVerifyPaymentRequest, PaymentRequestWithUser } from '@/hooks/usePaymentRequests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard,
  Smartphone,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentRequests() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestWithUser | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requests = [], isLoading } = useAllPaymentRequests(activeTab);
  const verifyPayment = useVerifyPaymentRequest();

  const filteredRequests = requests.filter(req => {
    const searchLower = search.toLowerCase();
    const profile = req.profiles as { full_name?: string; pharmacy_name?: string; phone?: string } | undefined;
    return (
      req.transaction_id.toLowerCase().includes(searchLower) ||
      req.payment_method.toLowerCase().includes(searchLower) ||
      (profile?.pharmacy_name?.toLowerCase().includes(searchLower)) ||
      (profile?.full_name?.toLowerCase().includes(searchLower))
    );
  });

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const totalPendingAmount = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const handleVerify = async (request: PaymentRequestWithUser) => {
    await verifyPayment.mutateAsync({
      requestId: request.id,
      action: 'verify',
    });
    setSelectedRequest(null);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    await verifyPayment.mutateAsync({
      requestId: selectedRequest.id,
      action: 'reject',
      rejectionReason,
    });
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bkash':
        return <span className="text-pink-500">bKash</span>;
      case 'nagad':
        return <span className="text-orange-500">Nagad</span>;
      case 'rocket':
        return <span className="text-purple-500">Rocket</span>;
      default:
        return <span>{method}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payment Requests</h1>
        <p className="text-muted-foreground">
          ক্লায়েন্টদের পেমেন্ট রিকোয়েস্ট ভেরিফাই করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">৳{totalPendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Verification
              </CardTitle>
              <CardDescription>
                bKash/Nagad Transaction ID ভেরিফাই করে সাবস্ক্রিপশন অ্যাক্টিভ করুন
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by TrxID, pharmacy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-1">
                <Clock className="h-3.5 w-3.5" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="verified" className="gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1">
                <XCircle className="h-3.5 w-3.5" />
                Rejected
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          কোনো রিকোয়েস্ট পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => {
                        const profile = request.profiles as { full_name?: string; pharmacy_name?: string; phone?: string } | undefined;
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{profile?.pharmacy_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {request.plan_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">৳{Number(request.amount).toLocaleString()}</TableCell>
                            <TableCell>{getPaymentMethodIcon(request.payment_method)}</TableCell>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {request.transaction_id}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(request.submitted_at), 'dd MMM yyyy HH:mm')}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-right">
                              {request.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleVerify(request)}
                                    disabled={verifyPayment.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setRejectDialogOpen(true);
                                    }}
                                    disabled={verifyPayment.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {request.status === 'rejected' && request.rejection_reason && (
                                <span className="text-xs text-muted-foreground">
                                  {request.rejection_reason}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান
            </DialogTitle>
            <DialogDescription>
              কেন এই রিকোয়েস্ট প্রত্যাখ্যান করছেন তা উল্লেখ করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>প্রত্যাখ্যানের কারণ</Label>
              <Textarea
                placeholder="যেমন: Transaction ID মিলছে না, ভুল পরিমাণ পাঠানো হয়েছে..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || verifyPayment.isPending}
            >
              {verifyPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                'প্রত্যাখ্যান করুন'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
