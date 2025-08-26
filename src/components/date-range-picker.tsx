
"use client"

import * as React from "react"
import { format, subDays, startOfYear, subMonths } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon } from "lucide-react"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange;
  onDateChange: (dateRange: DateRange) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelectChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case "last-7-days":
        onDateChange({ from: subDays(now, 6), to: now });
        break;
      case "last-30-days":
        onDateChange({ from: subDays(now, 29), to: now });
        break;
      case "this-year":
        onDateChange({ from: startOfYear(now), to: now });
        break;
      case "last-month":
        onDateChange({ from: subMonths(now, 1), to: now });
        break;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
      <Select onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last-7-days">Last 7 days</SelectItem>
          <SelectItem value="last-30-days">Last 30 days</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This year</SelectItem>
        </SelectContent>
      </Select>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => range && onDateChange(range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      </div>
    </div>
  )
}
