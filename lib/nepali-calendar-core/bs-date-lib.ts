import type { DateLib } from "react-day-picker"

import { adToBs, bsToAd, daysInBsMonth } from "./bs-conversion"
import { formatBs } from "./bs-format"
import type { NepaliLocaleCode } from "./bs-locale"

interface Interval {
  start: Date | number | string
  end: Date | number | string
}

function monthsBetween(a: Date, b: Date): number {
  const bsA = adToBs(a)
  const bsB = adToBs(b)
  return (bsA.year - bsB.year) * 12 + (bsA.month - bsB.month)
}

function addBsMonths(date: Date, amount: number): Date {
  const { year, month, day } = adToBs(date)
  const total = month + amount
  const nextYear = year + Math.floor(total / 12)
  const nextMonth = ((total % 12) + 12) % 12
  return bsToAd(nextYear, nextMonth, day)
}

/**
 * `react-day-picker` `DateLib` overrides that make a `DayPicker` render and
 * navigate using the Bikram Sambat calendar while every `Date` it hands back
 * (via `selected`/`onSelect`) stays a normal Gregorian-instant JS `Date`.
 *
 * Only the functions that are actually calendar-dependent are overridden -
 * day-level arithmetic (`addDays`, `isSameDay`, `startOfWeek`, ...) is
 * identical in both calendars, so those fall through to DateLib's defaults.
 *
 * `locale` only controls which script month/weekday names render in
 * (English transliteration vs Devanagari) - it's separate from `numerals`
 * (Latin vs Devanagari digits, set via DayPicker's own `numerals` prop) and
 * from the BS calendar itself, which is always in effect.
 */
export function createNepaliDateLib(locale: NepaliLocaleCode): Partial<DateLib> {
  return {
    newDate: (year, monthIndex, date) => bsToAd(year, monthIndex, date),

    getYear: (date) => adToBs(date).year,
    getMonth: (date) => adToBs(date).month,

    setYear: (date, year) => {
      const { month, day } = adToBs(date)
      return bsToAd(year, month, day)
    },
    setMonth: (date, month) => {
      const { year, day } = adToBs(date)
      return bsToAd(year, month, day)
    },

    addMonths: (date, amount) => addBsMonths(date, amount),
    addYears: (date, amount) => addBsMonths(date, amount * 12),

    startOfMonth: (date) => {
      const { year, month } = adToBs(date)
      return bsToAd(year, month, 1)
    },
    endOfMonth: (date) => {
      const { year, month } = adToBs(date)
      return bsToAd(year, month, daysInBsMonth(year, month))
    },
    startOfYear: (date) => bsToAd(adToBs(date).year, 0, 1),
    endOfYear: (date) => {
      const { year } = adToBs(date)
      return bsToAd(year, 11, daysInBsMonth(year, 11))
    },

    isSameMonth: (a, b) => {
      const bsA = adToBs(a)
      const bsB = adToBs(b)
      return bsA.year === bsB.year && bsA.month === bsB.month
    },
    isSameYear: (a, b) => adToBs(a).year === adToBs(b).year,
    differenceInCalendarMonths: (a, b) => monthsBetween(a, b),

    eachMonthOfInterval: ({ start, end }: Interval) => {
      const from = adToBs(new Date(start))
      const to = adToBs(new Date(end))
      const months: Date[] = []
      let cursor = from.year * 12 + from.month
      const last = to.year * 12 + to.month
      const step = cursor <= last ? 1 : -1
      while (step > 0 ? cursor <= last : cursor >= last) {
        months.push(bsToAd(Math.floor(cursor / 12), ((cursor % 12) + 12) % 12, 1))
        cursor += step
      }
      return step > 0 ? months : months.reverse()
    },

    eachYearOfInterval: ({ start, end }: Interval) => {
      const from = adToBs(new Date(start)).year
      const to = adToBs(new Date(end)).year
      const years: Date[] = []
      const step = from <= to ? 1 : -1
      for (let year = from; step > 0 ? year <= to : year >= to; year += step) {
        years.push(bsToAd(year, 0, 1))
      }
      return step > 0 ? years : years.reverse()
    },

    format: (date, formatStr) => formatBs(date, formatStr, locale),
  }
}
