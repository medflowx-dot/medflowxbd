import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  placeholder = "dd/mm/yyyy",
  disabled,
  className,
  align = "start",
  showClearButton = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(
    date ? format(date, "dd/MM/yyyy") : ""
  );

  // Sync input value when date prop changes
  React.useEffect(() => {
    setInputValue(date ? format(date, "dd/MM/yyyy") : "");
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, "dd/MM/yyyy"));
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-format with slashes
    if (value.length === 2 && !value.includes("/")) {
      setInputValue(value + "/");
    } else if (value.length === 5 && value.split("/").length === 2) {
      setInputValue(value + "/");
    }

    // Try to parse the date when complete (dd/mm/yyyy = 10 chars)
    if (value.length === 10) {
      const parsedDate = parse(value, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onDateChange(parsedDate);
      }
    }
  };

  const handleInputBlur = () => {
    // Try to parse on blur
    if (inputValue.length === 10) {
      const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onDateChange(parsedDate);
      } else {
        // Reset to current date value if invalid
        setInputValue(date ? format(date, "dd/MM/yyyy") : "");
      }
    } else if (inputValue.length === 0) {
      onDateChange(undefined);
    } else {
      // Reset to current date value if incomplete
      setInputValue(date ? format(date, "dd/MM/yyyy") : "");
    }
  };

  const handleClear = () => {
    onDateChange(undefined);
    setInputValue("");
    setOpen(false);
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {/* Text Input for typing date */}
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        maxLength={10}
        className="flex-1"
      />
      
      {/* Calendar Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          {/* Header showing selected date */}
          <div className="bg-primary p-4 text-primary-foreground rounded-t-md">
            <p className="text-sm opacity-80">
              {date ? format(date, "yyyy") : new Date().getFullYear()}
            </p>
            <p className="text-xl font-semibold">
              {date ? format(date, "EEE, MMM d") : "Select date"}
            </p>
          </div>

          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
            className="p-3 pointer-events-auto"
          />

          {/* Action buttons */}
          {showClearButton && date && (
            <div className="flex items-center justify-center p-3 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
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
