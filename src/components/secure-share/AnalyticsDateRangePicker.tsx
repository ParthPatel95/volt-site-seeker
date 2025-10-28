import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AnalyticsDateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export function AnalyticsDateRangePicker({ dateRange, onDateRangeChange }: AnalyticsDateRangePickerProps) {
  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    onDateRangeChange({ from, to });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.days)}
            className={cn(
              dateRange?.from &&
              dateRange?.to &&
              Math.abs(
                (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
              ) === preset.days &&
              "bg-primary text-primary-foreground"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Custom range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {dateRange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateRangeChange(undefined)}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
