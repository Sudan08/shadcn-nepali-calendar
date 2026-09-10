"use client"

import * as React from "react"
import type { DayButton, DateRange } from "react-day-picker"

import { NepaliCalendar, NepaliCalendarDayButton } from "@/components/ui/nepali-calendar"
import { adToBs, adToBsIsoString, bsIsoStringToAd, nepaliDate } from "@/lib/nepali-calendar-core"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const REPO_URL = "https://github.com/Sudan08/shadcn-nepali-calendar"
const INSTALL_COMMAND = `pnpm dlx shadcn@latest add ${REPO_URL}/nepali-calendar`

// BS "year-month-day" keys, month 0-indexed (0 = Baisakh) to match adToBs().
// Bhadra = index 4.
const holidays = new Set(["2083-4-10", "2083-4-20", "2083-4-25"])

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.53 10.53 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false)
  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard access denied - nothing to fall back to
    }
  }, [text])
  return { copied, copy }
}

function CopyableCode({ children }: { children: string }) {
  const { copied, copy } = useCopy(children)

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-2.5 font-mono text-xs sm:text-sm">
      <code className="overflow-x-auto whitespace-nowrap">{children}</code>
      <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const { copied, copy } = useCopy(code)

  return (
    <div className="relative mt-3 rounded-lg border bg-muted/40">
      <Button
        variant="outline"
        size="sm"
        onClick={copy}
        className="absolute top-2 right-2"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="overflow-x-auto p-3 pr-20 text-xs leading-relaxed">
        <code className="font-mono">{code.trim()}</code>
      </pre>
    </div>
  )
}

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

function Section({
  title,
  description,
  code,
  children,
}: {
  title: string
  description?: string
  code?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-lg border p-3">{children}</div>
      {code && <CodeBlock code={code} />}
    </section>
  )
}

const SINGLE_CODE = `
const [date, setDate] = useState<Date>()

<NepaliCalendar mode="single" selected={date} onSelect={setDate} />
`

const ENGLISH_LOCALE_CODE = `
<NepaliCalendar
  mode="single"
  selected={date}
  onSelect={setDate}
  locale="en"
/>
`

const RANGE_CODE = `
const [range, setRange] = useState<DateRange>()

<NepaliCalendar mode="range" selected={range} onSelect={setRange} />
`

const DROPDOWN_CODE = `
import { nepaliDate } from "@/lib/nepali-calendar-core"

<NepaliCalendar
  mode="single"
  selected={date}
  onSelect={setDate}
  captionLayout="dropdown"
  startMonth={nepaliDate(2060, 1, 1)}  // BS 2060 Baisakh 1
  endMonth={nepaliDate(2090, 12, 1)}   // BS 2090 Chaitra
/>
`

const CUSTOM_DAY_CODE = `
import type { DayButton } from "react-day-picker"
import { NepaliCalendar, NepaliCalendarDayButton } from "@/components/ui/nepali-calendar"
import { adToBs } from "@/lib/nepali-calendar-core"

// BS "year-month-day" keys, month 0-indexed (0 = Baisakh).
const holidays = new Set(["2083-4-10", "2083-4-20", "2083-4-25"])

function HolidayDayButton(props: React.ComponentProps<typeof DayButton>) {
  const bs = adToBs(props.day.date)
  const isHoliday = holidays.has(\`\${bs.year}-\${bs.month}-\${bs.day}\`)
  return (
    <NepaliCalendarDayButton {...props}>
      {props.children}
      {isHoliday && (
        <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-destructive" />
      )}
    </NepaliCalendarDayButton>
  )
}

<NepaliCalendar
  mode="single"
  selected={date}
  onSelect={setDate}
  components={{ DayButton: HolidayDayButton }}
/>
`

const POPOVER_CODE = `
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { NepaliCalendar } from "@/components/ui/nepali-calendar"

function DatePicker() {
  const [date, setDate] = useState<Date>()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{date ? date.toDateString() : "Pick a date"}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <NepaliCalendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
`

const ISO_STRING_CODE = `
import { adToBsIsoString, bsIsoStringToAd } from "@/lib/nepali-calendar-core"

adToBsIsoString(date)          // Date -> "2082-05-06" (BS, zero-padded YYYY-MM-DD)
bsIsoStringToAd("2082-05-06")  // "2082-05-06" -> Date, e.g. to seed \`selected\` from a saved value
`

const PROP_ROWS: {
  prop: string
  type: string
  defaultValue: string
  note: string
}[] = [
  {
    prop: "locale",
    type: '"en" | "ne"',
    defaultValue: '"ne"',
    note: "Script for month/weekday names. Independent of numerals and the calendar system (always BS).",
  },
  {
    prop: "numerals",
    type: 'DayPicker’s Numerals ("latn" | "deva" | ...)',
    defaultValue: '"deva" if locale="ne", else "latn"',
    note: "Digit script for the rendered grid. Mixable with locale.",
  },
  {
    prop: "buttonVariant",
    type: "shadcn Button variant",
    defaultValue: '"ghost"',
    note: "Styling for the prev/next nav buttons.",
  },
  {
    prop: "mode",
    type: '"single" | "multiple" | "range"',
    defaultValue: '"single"',
    note: "Selection mode - a real DayPicker prop, changes the shape of selected/onSelect.",
  },
  {
    prop: "selected / onSelect",
    type: "Date | Date[] | DateRange (matches mode)",
    defaultValue: "-",
    note: "Always plain Gregorian-instant JS Dates, regardless of locale/numerals.",
  },
  {
    prop: "captionLayout",
    type: '"label" | "dropdown" | "dropdown-months" | "dropdown-years"',
    defaultValue: '"label"',
    note: "Static caption text vs. BS month/year dropdown navigation.",
  },
  {
    prop: "startMonth / endMonth",
    type: "Date",
    defaultValue: "-",
    note: 'Navigation bounds. Build with nepaliDate(year, month, day) (1-indexed month) to bound in BS terms.',
  },
  {
    prop: "showOutsideDays",
    type: "boolean",
    defaultValue: "true",
    note: "Show leading/trailing days from adjacent BS months.",
  },
  {
    prop: "numberOfMonths",
    type: "number",
    defaultValue: "1",
    note: "Render multiple BS months side by side.",
  },
  {
    prop: "disabled",
    type: "Matcher | Matcher[]",
    defaultValue: "-",
    note: "Disable individual days, e.g. by comparing against adToBs(date).",
  },
  {
    prop: "components",
    type: "DayPicker CustomComponents",
    defaultValue: "-",
    note: "Swap in a custom DayButton (e.g. wrapping NepaliCalendarDayButton) for badges/dots per day.",
  },
  {
    prop: "className / classNames",
    type: "string / DayPicker ClassNames",
    defaultValue: "-",
    note: "Merged with the component's own Tailwind classes via cn().",
  },
]

export default function Home() {
  // Each demo below gets its own state - sharing one Date between sections
  // made selecting in one calendar visibly move the selection in the others.
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(new Date())
  const [englishDate, setEnglishDate] = React.useState<Date | undefined>(new Date())
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [dropdownDate, setDropdownDate] = React.useState<Date | undefined>(new Date())
  const [customDayDate, setCustomDayDate] = React.useState<Date | undefined>(new Date())
  const [popoverDate, setPopoverDate] = React.useState<Date | undefined>()
  const [savedBsDate, setSavedBsDate] = React.useState("2082-05-06")
  const [loadedDate, setLoadedDate] = React.useState<Date | undefined>()
  const [loadError, setLoadError] = React.useState<string | null>(null)

  function handleLoad() {
    try {
      setLoadedDate(bsIsoStringToAd(savedBsDate))
      setLoadError(null)
    } catch (error) {
      setLoadedDate(undefined)
      setLoadError(error instanceof Error ? error.message : "Invalid date")
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Nepali Calendar</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              A Bikram Sambat (BS) calendar for shadcn/ui, built on React
              DayPicker - selected/onSelect stay plain JS Dates, the grid
              renders in BS.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <GitHubIcon className="size-4" />
              View on GitHub
            </a>
          </Button>
        </div>
        <CopyableCode>{INSTALL_COMMAND}</CopyableCode>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Section
          title="Single (Nepali locale, Devanagari numerals - defaults)"
          code={SINGLE_CODE}
        >
          <NepaliCalendar mode="single" selected={singleDate} onSelect={setSingleDate} />
          <p className="mt-2 text-xs text-muted-foreground">
            selected (AD): {singleDate?.toDateString() ?? "none"}
          </p>
        </Section>

        <Section title="English locale, Latin numerals" code={ENGLISH_LOCALE_CODE}>
          <NepaliCalendar
            mode="single"
            selected={englishDate}
            onSelect={setEnglishDate}
            locale="en"
          />
        </Section>

        <Section title="Range selection" code={RANGE_CODE}>
          <NepaliCalendar mode="range" selected={range} onSelect={setRange} />
          <p className="mt-2 text-xs text-muted-foreground">
            {range?.from?.toDateString() ?? "..."} -{" "}
            {range?.to?.toDateString() ?? "..."}
          </p>
        </Section>

        <Section
          title="Dropdown navigation (month/year, bounded 2060-2090 BS)"
          code={DROPDOWN_CODE}
        >
          <NepaliCalendar
            mode="single"
            selected={dropdownDate}
            onSelect={setDropdownDate}
            captionLayout="dropdown"
            startMonth={nepaliDate(2060, 1, 1)}
            endMonth={nepaliDate(2090, 12, 1)}
          />
        </Section>

        <Section
          title="Custom day content (NepaliCalendarDayButton composed with a holiday dot)"
          code={CUSTOM_DAY_CODE}
        >
          <NepaliCalendar
            mode="single"
            selected={customDayDate}
            onSelect={setCustomDayDate}
            components={{ DayButton: HolidayDayButton }}
          />
        </Section>

        <Section title="Popover date picker" code={POPOVER_CODE}>
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

      <Section
        title="Sending/loading a BS date as YYYY-MM-DD"
        description="adToBsIsoString / bsIsoStringToAd convert at the boundary - an API payload, a form field, a DB column - while selected/onSelect stay plain AD Dates."
        code={ISO_STRING_CODE}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              adToBsIsoString(singleDate):
            </p>
            <code className="text-sm font-medium">
              {singleDate ? adToBsIsoString(singleDate) : "none"}
            </code>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              bsIsoStringToAd(&quot;{savedBsDate}&quot;) - try editing the string
              (e.g. to <code>2082-5-6</code>) to see it throw:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={savedBsDate}
                onChange={(event) => setSavedBsDate(event.target.value)}
                placeholder="YYYY-MM-DD"
                className="h-8 w-40 rounded-md border bg-background px-2 font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleLoad}>
                Parse
              </Button>
              {loadedDate && (
                <span className="text-xs text-muted-foreground">
                  -&gt; {loadedDate.toDateString()}
                </span>
              )}
              {loadError && (
                <span className="text-xs text-destructive">{loadError}</span>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Props"
        description={
          'NepaliCalendarProps = React.ComponentProps<typeof DayPicker> (minus locale/dateLib) plus the three below. Every other DayPicker prop - mode, selected, onSelect, disabled, footer, ISOWeek, ... - works as documented at daypicker.dev.'
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Prop</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Default</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {PROP_ROWS.map((row) => (
                <tr key={row.prop} className="border-b last:border-0">
                  <td className="py-2 pr-4 align-top font-mono text-xs">
                    {row.prop}
                  </td>
                  <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">
                    {row.type}
                  </td>
                  <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">
                    {row.defaultValue}
                  </td>
                  <td className="py-2 align-top text-xs text-muted-foreground">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground">
        <span>MIT License</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <GitHubIcon className="size-3.5" />
          Sudan08/shadcn-nepali-calendar
        </a>
      </footer>
    </div>
  )
}
