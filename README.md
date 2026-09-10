# shadcn Nepali Calendar

A Bikram Sambat (BS) calendar for [shadcn/ui](https://ui.shadcn.com), built the same way shadcn's own Persian calendar is: a [React DayPicker](https://daypicker.dev) `DateLib` adapter, not a standalone widget.

- `selected` / `onSelect` stay plain JS `Date`s (the real Gregorian instant) - only the rendered grid, month/year navigation, and labels are Bikram Sambat.
- Distributed as source via the [shadcn registry](https://ui.shadcn.com/docs/registry) - `shadcn add` copies the component and its calendar engine straight into your project. No runtime npm dependency for the BS calendar math.
- LTR, Nepali (Devanagari) or English month/weekday names, Devanagari or Latin numerals - all independently switchable.
- Supports every `DayPicker` mode (`single`, `multiple`, `range`) and `captionLayout` (`label`, `dropdown`), because it's a real `DayPicker`, not a reimplementation.

## Install

```bash
pnpm dlx shadcn@latest add https://github.com/Sudan08/shadcn-nepali-calendar/nepali-calendar
```

This pulls in two registry items:

- `nepali-calendar-core` → `lib/nepali-calendar-core/*.ts` - the BS↔AD conversion engine and the `DateLib` overrides. No UI, no React.
- `nepali-calendar` → `components/ui/nepali-calendar.tsx` - the component itself, plus `button` if you don't already have it.

## Usage

```tsx
import { useState } from "react"
import { NepaliCalendar } from "@/components/ui/nepali-calendar"

export function Example() {
  const [date, setDate] = useState<Date>()
  return <NepaliCalendar mode="single" selected={date} onSelect={setDate} />
}
```

`date` is a normal JS `Date` the whole time - it round-trips through `<Popover>` + `<Button>`, `date-fns`, form libraries, and APIs exactly like the stock shadcn `Calendar`.

### English instead of Devanagari

```tsx
<NepaliCalendar mode="single" selected={date} onSelect={setDate} locale="en" />
// Bhadra 2083 / Sun Mon Tue ...
```

`locale` only controls the script for month/weekday names. It defaults to `"ne"`.

### Numerals independent of locale

```tsx
<NepaliCalendar locale="en" numerals="deva" /> {/* "Bhadra २०८३" */}
<NepaliCalendar locale="ne" numerals="latn" /> {/* "भदौ 2083" */}
```

`numerals` is DayPicker's own prop (`"latn" | "deva" | ...`). It defaults to `"deva"` when `locale="ne"` and `"latn"` when `locale="en"`, but you can mix them.

### Range selection

```tsx
const [range, setRange] = useState<DateRange>()
<NepaliCalendar mode="range" selected={range} onSelect={setRange} />
```

### Month/year dropdowns, bounded by BS year

```tsx
import { nepaliDate } from "@/lib/nepali-calendar-core"

<NepaliCalendar
  captionLayout="dropdown"
  startMonth={nepaliDate(2060, 1, 1)}  // BS 2060 Baisakh 1
  endMonth={nepaliDate(2090, 12, 1)}   // BS 2090 Chaitra
/>
```

`startMonth`/`endMonth` (and any other DayPicker prop that takes a `Date`) work exactly like on the stock `Calendar` - build the bound with `nepaliDate(year, month, day)` (1-indexed month) so it reads as a BS date instead of doing AD arithmetic in your head.

### Date picker (Popover + Button)

```tsx
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
```

## Why a `DateLib` adapter, not a new component

shadcn's Persian calendar works by swapping `react-day-picker`'s date engine (via the `dateLib` prop, backed by `date-fns-jalali`) while keeping the same `Calendar` UI. There's no equivalent `date-fns-nepali`, so `nepali-calendar-core` implements the same seam by hand:

```
NepaliCalendar (components/ui/nepali-calendar.tsx)
  └── DayPicker (react-day-picker)
        └── dateLib = createNepaliDateLib(locale)   ← lib/nepali-calendar-core
              ├── BS ⇄ AD conversion (bs-conversion.ts)
              ├── BS month-length table (bs-calendar-data.ts)
              ├── month/weekday names (bs-locale.ts)
              └── BS-aware date-fns format tokens (bs-format.ts)
```

Only the calendar-dependent `DateLib` methods are overridden (`getYear`, `getMonth`, `setMonth`/`setYear`, `addMonths`/`addYears`, `startOfMonth`/`endOfMonth`, `startOfYear`/`endOfYear`, `isSameMonth`/`isSameYear`, `differenceInCalendarMonths`, `eachMonthOfInterval`/`eachYearOfInterval`, `format`, `newDate`). Day-level arithmetic (`addDays`, `isSameDay`, `startOfWeek`, ...) is identical in both calendars and falls through to DayPicker's defaults.

### The calendar data

Bikram Sambat month lengths aren't computable from a formula the way Gregorian or even Jalali months are - they're published year by year. `lib/nepali-calendar-core/bs-calendar-data.ts` vendors the same widely-mirrored BS 1978-2099 table used across the Nepali-date-conversion ecosystem, sourced from the MIT-licensed [`sbmdkl/nepali-date-converter`](https://github.com/sbmdkl/nepali-date-converter). It's data, not a dependency - no npm package is required at runtime, and there's one documented exception (BS 2096, a provisional far-future year that's one day short in the source table - see the comment in that file).

Conversion (`bs-conversion.ts`) is O(log n) per call (binary search over precomputed year-start offsets, then a linear scan of 12 months) so it's cheap to call on every rendered day cell.

## Props

`NepaliCalendarProps` is `React.ComponentProps<typeof DayPicker>` (so every DayPicker prop - `mode`, `selected`, `onSelect`, `showOutsideDays`, `disabled`, `startMonth`/`endMonth`, `numberOfMonths`, ... - works as documented at [daypicker.dev](https://daypicker.dev)), plus:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `locale` | `"en" \| "ne"` | `"ne"` | Script for month/weekday names. |
| `numerals` | DayPicker's `Numerals` | `"deva"` if `locale="ne"`, else `"latn"` | Digit script. |
| `buttonVariant` | shadcn `Button` variant | `"ghost"` | Nav button styling. |

`locale` and `dateLib` are the only stock DayPicker props that are *not* passed through as-is - `locale` is replaced with the simplified `"en" | "ne"` union above, and `dateLib` is always the Bikram Sambat adapter.

## Development

```bash
pnpm install
pnpm test   # vitest - BS↔AD conversion, round-trip across the full 1978-2099 range
pnpm dev    # demo app at app/page.tsx
```

## License

MIT. The vendored calendar data in `bs-calendar-data.ts` is adapted from the MIT-licensed [`sbmdkl/nepali-date-converter`](https://github.com/sbmdkl/nepali-date-converter).
