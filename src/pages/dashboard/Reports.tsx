import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, Users, Truck, Wallet } from 'lucide-react';

export default function Reports() {
  const reportTypes = [
    { 
      icon: TrendingUp, 
      title: 'Sales Report', 
      description: 'Daily, weekly, monthly sales analysis',
      color: 'bg-green-500'
    },
    { 
      icon: Users, 
      title: 'Customer Due Report', 
      description: 'Outstanding customer balances',
      color: 'bg-blue-500'
    },
    { 
      icon: Truck, 
      title: 'Supplier Report', 
      description: 'Supplier payments and dues',
      color: 'bg-purple-500'
    },
    { 
      icon: Wallet, 
      title: 'Daily Cash Report', 
      description: 'Cash flow analysis',
      color: 'bg-amber-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export detailed reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${report.color} text-white`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No reports generated</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Generate your first report to see it here. All reports are exported as PDF.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
