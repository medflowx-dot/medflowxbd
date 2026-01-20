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
                <h4 className="font-medium text-warning flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t.expiryAlerts.expiring30} ({expiring30.length})
                </h4>
                <div className="space-y-2">
                  {expiring30.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-warning/10 border border-warning/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-warning hover:bg-warning/80 text-warning-foreground">
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
                <h4 className="font-medium text-purple flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  {t.expiryAlerts.expiring60} ({expiring60.length})
                </h4>
                <div className="space-y-2">
                  {expiring60.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-purple/10 border border-purple/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-purple hover:bg-purple/80 text-purple-foreground">
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
                <h4 className="font-medium text-info flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  {t.expiryAlerts.expiring90} ({expiring90.length})
                </h4>
                <div className="space-y-2">
                  {expiring90.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-info/10 border border-info/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.expiryAlerts.batch}: {batch.batch_number}
                        </p>
                      </div>
                      <Badge className="bg-info hover:bg-info/80">
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