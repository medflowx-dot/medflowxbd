import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';

type DatePreset = 'last7Days' | 'thisMonth' | 'thisWeek' | 'last30Days' | 'custom';

interface QuickReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onGenerate: (dateRange: { start: Date; end: Date }) => Promise<void>;
}

export function QuickReportDialog({
  open,
  onOpenChange,
  title,
  description,
  onGenerate,
}: QuickReportDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    
    switch (selectedPreset) {
      case 'last7Days':
        return { start: subDays(now, 7), end: now };
      case 'thisWeek':
        return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last30Days':
        return { start: subDays(now, 30), end: now };
      case 'custom':
        return {
          start: customStartDate || startOfMonth(now),
          end: customEndDate || now,
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const dateRange = getDateRange();
      await onGenerate(dateRange);
      onOpenChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value as DatePreset);
    if (value !== 'custom') {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={customStartDate}
                  onDateChange={setCustomStartDate}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={customEndDate}
                  onDateChange={setCustomEndDate}
                  placeholder="End date"
                />
              </div>
            </div>
          )}

          {selectedPreset !== 'custom' && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <span className="font-medium">Selected Period:</span>{' '}
              {format(getDateRange().start, 'MMM dd, yyyy')} -{' '}
              {format(getDateRange().end, 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
