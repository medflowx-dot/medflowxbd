import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Loader2, Search, Bell, Mail, MessageSquare, CheckCircle2, XCircle, 
  RefreshCw, Filter, CalendarIcon, Clock, AlertTriangle, TrendingUp, Play
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: string;
  channel: string;
  sent_at: string;
  days_before_expiry: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
  profiles?: {
    pharmacy_name: string | null;
    full_name: string | null;
  };
}

// Fetch notification logs with profile info
async function fetchNotificationLogs(startDate?: Date, endDate?: Date) {
  let query = supabase
    .from('notification_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(500);

  if (startDate) {
    query = query.gte('sent_at', startOfDay(startDate).toISOString());
  }
  if (endDate) {
    query = query.lte('sent_at', endOfDay(endDate).toISOString());
  }

  const { data: logs, error } = await query;
  if (error) throw error;

  // Fetch profiles separately for each unique user_id
  const userIds = [...new Set(logs?.map(l => l.user_id) || [])];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, pharmacy_name, full_name')
    .in('user_id', userIds);

  // Map profiles to logs
  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
  
  return logs?.map(log => ({
    ...log,
    profiles: profileMap.get(log.user_id) || null,
  })) as NotificationLog[];
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getChannelBadge(channel: string) {
  switch (channel) {
    case 'email':
      return <Badge variant="outline" className="text-info border-info gap-1"><Mail className="h-3 w-3" />Email</Badge>;
    case 'sms':
      return <Badge variant="outline" className="text-purple border-purple gap-1"><MessageSquare className="h-3 w-3" />SMS</Badge>;
    default:
      return <Badge variant="outline">{channel}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return <Badge className="bg-success/20 text-success gap-1"><CheckCircle2 className="h-3 w-3" />Sent</Badge>;
    case 'failed':
      return <Badge className="bg-destructive/20 text-destructive gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getNotificationTypeBadge(type: string) {
  switch (type) {
    case 'subscription_expiry_reminder':
      return <Badge variant="outline" className="text-warning border-warning gap-1"><AlertTriangle className="h-3 w-3" />Expiry Reminder</Badge>;
    case 'subscription_expired':
      return <Badge variant="outline" className="text-destructive border-destructive gap-1"><XCircle className="h-3 w-3" />Expired</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default function NotificationLogs() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isRunning, setIsRunning] = useState(false);

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['notification-logs', dateRange],
    queryFn: () => fetchNotificationLogs(dateRange.from, dateRange.to),
  });

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-expiry-notifications');
      
      if (error) throw error;
      
      const results = data?.results || {};
      toast.success(
        `নোটিফিকেশন সম্পন্ন: ${results.emailsSent || 0} Email, ${results.smsSent || 0} SMS পাঠানো হয়েছে। প্রসেস: ${results.processed || 0}, স্কিপ: ${results.skipped || 0}`,
        { duration: 5000 }
      );
      
      // Refresh the logs
      setTimeout(() => refetch(), 1000);
    } catch (error: any) {
      console.error('Error running notifications:', error);
      toast.error(error.message || 'নোটিফিকেশন রান করতে সমস্যা হয়েছে');
    } finally {
      setIsRunning(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!logs) return { total: 0, emails: 0, sms: 0, sent: 0, failed: 0 };
    
    return {
      total: logs.length,
      emails: logs.filter(l => l.channel === 'email').length,
      sms: logs.filter(l => l.channel === 'sms').length,
      sent: logs.filter(l => l.status === 'sent').length,
      failed: logs.filter(l => l.status === 'failed').length,
    };
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs?.filter(log => {
      const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
      const matchesSearch = 
        profile?.pharmacy_name?.toLowerCase().includes(search.toLowerCase()) ||
        profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.notification_type.toLowerCase().includes(search.toLowerCase());
      
      const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      
      return matchesSearch && matchesChannel && matchesStatus;
    }) || [];
  }, [logs, search, channelFilter, statusFilter]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Logs</h1>
            <p className="text-muted-foreground">Track all email & SMS notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRunNow} 
            disabled={isRunning}
            className="bg-success hover:bg-success/90"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Now
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold">{stats.emails}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple" />
              <span className="text-2xl font-bold">{stats.sms}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-success">{stats.sent}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{stats.failed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pharmacy or notification type..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateRange.from, 'dd MMM')} - {format(dateRange.to, 'dd MMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Days Before Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.sent_at), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {profile?.pharmacy_name || profile?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{getNotificationTypeBadge(log.notification_type)}</TableCell>
                    <TableCell>{getChannelBadge(log.channel)}</TableCell>
                    <TableCell>
                      {log.days_before_expiry !== null ? (
                        <Badge variant="outline">
                          {log.days_before_expiry > 0 
                            ? `${log.days_before_expiry} days before`
                            : log.days_before_expiry === 0 
                              ? 'Expiry day'
                              : `${Math.abs(log.days_before_expiry)} days after`
                          }
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.error_message ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="cursor-help truncate max-w-[150px]">
                                {log.error_message}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{log.error_message}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notification logs found</p>
                    <p className="text-xs">Notifications will appear here when sent</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
