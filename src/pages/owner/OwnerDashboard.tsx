import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOwnerAnalytics } from '@/hooks/useOwnerData';
import { Loader2, Users, CreditCard, Clock, AlertTriangle, Crown, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OwnerDashboard() {
  const { data: analytics, isLoading } = useOwnerAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'critical':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-dark">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">
              Business & System Overview
            </p>
          </div>
        </div>
        
        {/* System Status */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 py-3 px-4">
            {getSystemStatusIcon(analytics?.systemStatus || 'healthy')}
            <div>
              <p className="text-sm font-medium">System Status</p>
              <Badge 
                variant="outline" 
                className={`capitalize ${analytics?.systemStatus === 'healthy' ? 'border-success text-success' : analytics?.systemStatus === 'warning' ? 'border-warning text-warning' : 'border-destructive text-destructive'}`}
              >
                {analytics?.systemStatus || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">All registered pharmacies</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{analytics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active plans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{analytics?.trialUsers || 0}</div>
            <p className="text-xs text-muted-foreground">On free trial</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Users</CardTitle>
            <Crown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{analytics?.lifetimeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Issues Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-card bg-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ৳{analytics?.monthlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-success/80">From monthly plans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              ৳{analytics?.yearlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-info/80">From yearly & lifetime</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Accounts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {analytics?.expiredAccounts || 0}
            </div>
            <p className="text-xs text-warning/80">Needs renewal</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Accounts</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {analytics?.suspendedAccounts || 0}
            </div>
            <p className="text-xs text-destructive/80">Currently suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
          <CardDescription>High-level business metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-3xl font-bold">{analytics?.pendingPayments || 0}</p>
              <p className="text-xs text-muted-foreground">Accounts awaiting payment</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold">
                {analytics?.totalClients && analytics?.trialUsers
                  ? Math.round(((analytics.totalClients - analytics.trialUsers) / analytics.totalClients) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Trial to paid conversion</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Rate</p>
              <p className="text-3xl font-bold">
                {analytics?.totalClients && analytics?.activeSubscriptions
                  ? Math.round((analytics.activeSubscriptions / analytics.totalClients) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Currently active accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
