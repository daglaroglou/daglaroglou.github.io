import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 sm:flex-row sm:gap-4",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center pt-1 relative",
          defaultClassNames.month_caption,
        ),
        caption_label: cn("text-sm font-medium", defaultClassNames.caption_label),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 px-0",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
          defaultClassNames.button_next,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-center text-[0.8rem] font-normal",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
          defaultClassNames.day_button,
        ),
        range_end: cn("day-range-end", defaultClassNames.range_end),
        range_start: cn("day-range-start", defaultClassNames.range_start),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
          defaultClassNames.selected,
        ),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        range_middle: cn(
          "rounded-none aria-selected:bg-accent aria-selected:text-accent-foreground",
          defaultClassNames.range_middle,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClass, orientation, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-4", chevronClass)} {...chevronProps} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
