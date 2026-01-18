import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  align?: "start" | "center" | "end";
  showClearButton?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  className,
  align = "start",
  showClearButton = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);

  // Sync temp date when date prop changes
  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setTempDate(selectedDate);
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setOpen(false);
  };

  const handleClear = () => {
    setTempDate(undefined);
    onDateChange(undefined);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        {/* Header showing selected date */}
        <div className="bg-primary p-4 text-primary-foreground rounded-t-md">
          <p className="text-sm opacity-80">
            {tempDate ? format(tempDate, "yyyy") : new Date().getFullYear()}
          </p>
          <p className="text-xl font-semibold">
            {tempDate ? format(tempDate, "EEE, MMM d") : "Select date"}
          </p>
        </div>

        {/* Calendar */}
        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          className="p-3 pointer-events-auto"
        />

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 p-3 border-t">
          {showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleConfirm}
            className="text-primary font-medium"
          >
            Set
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Form-compatible version
interface FormDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function FormDatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: FormDatePickerProps) {
  return (
    <DatePicker
      date={value}
      onDateChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
