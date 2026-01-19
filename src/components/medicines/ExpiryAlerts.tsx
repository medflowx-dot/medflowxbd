import { format } from 'date-fns';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpiryAlerts } from '@/hooks/useMedicines';
import { useLanguage } from '@/contexts/LanguageContext';

export function ExpiryAlerts() {
  const { expired, expiring30, expiring60, expiring90 } = useExpiryAlerts();
  const { t } = useLanguage();

  const hasAlerts = expired.length > 0 || expiring30.length > 0 || expiring60.length > 0 || expiring90.length > 0;

  if (!hasAlerts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t.expiryAlerts.title}
          </CardTitle>
          <CardDescription>{t.expiryAlerts.noAlerts}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.expiryAlerts.allSafe}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t.expiryAlerts.title}
        </CardTitle>
        <CardDescription>
          {t.expiryAlerts.expiringSoon}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {/* Expired Items */}
            {expired.length > 0 && (
              <div>
                <h4 className="font-medium text-destructive flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  {t.expiryAlerts.expired} ({expired.length})
                </h4>
                <div className="space-y-2">
                  {expired.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring in 30 Days */}
            {expiring30.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-600 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t.expiryAlerts.expiring30} ({expiring30.length})
                </h4>
                <div className="space-y-2">
                  {expiring30.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring in 60 Days */}
            {expiring60.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  {t.expiryAlerts.expiring60} ({expiring60.length})
                </h4>
                <div className="space-y-2">
                  {expiring60.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                        {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring in 90 Days */}
            {expiring90.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  {t.expiryAlerts.expiring90} ({expiring90.length})
                </h4>
                <div className="space-y-2">
                  {expiring90.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        {format(new Date(batch.expiry_date), 'dd MMM yyyy')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}