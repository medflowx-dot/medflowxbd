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
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
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
                className={`capitalize ${analytics?.systemStatus === 'healthy' ? 'border-green-500 text-green-600' : analytics?.systemStatus === 'warning' ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}
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
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active plans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.trialUsers || 0}</div>
            <p className="text-xs text-muted-foreground">On free trial</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Users</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{analytics?.lifetimeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Issues Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ৳{analytics?.monthlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-green-600/80">From monthly plans</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              ৳{analytics?.yearlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600/80">From yearly & lifetime</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Accounts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {analytics?.expiredAccounts || 0}
            </div>
            <p className="text-xs text-orange-600/80">Needs renewal</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Accounts</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {analytics?.suspendedAccounts || 0}
            </div>
            <p className="text-xs text-red-600/80">Currently suspended</p>
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
