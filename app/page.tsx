"use client"

import * as React from "react"
import type { DayButton, DateRange } from "react-day-picker"

import { NepaliCalendar, NepaliCalendarDayButton } from "@/components/ui/nepali-calendar"
import { adToBs, nepaliDate } from "@/lib/nepali-calendar-core"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// BS "year-month-day" keys, month 0-indexed (0 = Baisakh) to match adToBs().
// Bhadra = index 4.
const holidays = new Set(["2083-4-10", "2083-4-20", "2083-4-25"])

function HolidayDayButton(props: React.ComponentProps<typeof DayButton>) {
  const bs = adToBs(props.day.date)
  const isHoliday = holidays.has(`${bs.year}-${bs.month}-${bs.day}`)
  return (
    <NepaliCalendarDayButton {...props}>
      {props.children}
      {isHoliday && (
        <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-destructive" />
      )}
    </NepaliCalendarDayButton>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="rounded-lg border p-3">{children}</div>
    </section>
  )
}

export default function Home() {
  const [single, setSingle] = React.useState<Date | undefined>(new Date())
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [popoverDate, setPopoverDate] = React.useState<Date | undefined>()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Nepali Calendar</h1>
        <p className="text-sm text-muted-foreground">
          A Bikram Sambat calendar built on React DayPicker - selected/onSelect
          stay plain JS Dates, the grid renders in BS.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Section title="Single (Nepali locale, Devanagari numerals - defaults)">
          <NepaliCalendar mode="single" selected={single} onSelect={setSingle} />
          <p className="mt-2 text-xs text-muted-foreground">
            selected (AD): {single?.toDateString() ?? "none"}
          </p>
        </Section>

        <Section title="English locale, Latin numerals">
          <NepaliCalendar
            mode="single"
            selected={single}
            onSelect={setSingle}
            locale="en"
          />
        </Section>

        <Section title="Range selection">
          <NepaliCalendar mode="range" selected={range} onSelect={setRange} />
          <p className="mt-2 text-xs text-muted-foreground">
            {range?.from?.toDateString() ?? "..."} -{" "}
            {range?.to?.toDateString() ?? "..."}
          </p>
        </Section>

        <Section title="Dropdown navigation (month/year, bounded 2060-2090 BS)">
          <NepaliCalendar
            mode="single"
            selected={single}
            onSelect={setSingle}
            captionLayout="dropdown"
            startMonth={nepaliDate(2060, 1, 1)}
            endMonth={nepaliDate(2090, 12, 1)}
          />
        </Section>

        <Section title="Custom day content (NepaliCalendarDayButton composed with a holiday dot)">
          <NepaliCalendar
            mode="single"
            selected={single}
            onSelect={setSingle}
            components={{ DayButton: HolidayDayButton }}
          />
        </Section>

        <Section title="Popover date picker">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {popoverDate ? popoverDate.toDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <NepaliCalendar
                mode="single"
                selected={popoverDate}
                onSelect={setPopoverDate}
              />
            </PopoverContent>
          </Popover>
        </Section>
      </div>
    </div>
  )
}
