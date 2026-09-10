import { BS_MONTH_DAYS, MAX_BS_YEAR, MIN_BS_YEAR, REFERENCE_AD_DATE } from "./bs-calendar-data"

export { MAX_BS_YEAR, MIN_BS_YEAR }

/** A Bikram Sambat calendar date. `month` is 0-indexed (0 = Baisakh, 11 = Chaitra). */
export interface BsDate {
  year: number
  month: number
  day: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Number of days in the given BS month. Out-of-range years clamp to the supported span. */
export function daysInBsMonth(year: number, month: number): number {
  const clampedYear = clamp(year, MIN_BS_YEAR, MAX_BS_YEAR)
  const clampedMonth = clamp(month, 0, 11)
  return BS_MONTH_DAYS[clampedYear][clampedMonth]
}

/**
 * Cumulative day offset (from {@link REFERENCE_AD_DATE}) of BS `<year>-01-01`,
 * for every supported year, plus one trailing entry for the day after the
 * last supported year - built once at module load.
 */
const yearStartOffsets: number[] = (() => {
  const offsets: number[] = []
  let total = 0
  for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
    offsets.push(total)
    total += BS_MONTH_DAYS[year].reduce((sum, days) => sum + days, 0)
  }
  offsets.push(total)
  return offsets
})()

const TOTAL_SPAN_DAYS = yearStartOffsets[yearStartOffsets.length - 1]

/** Whole calendar days between two local `Date`s, computed via UTC to stay DST-safe. */
function calendarDayDiff(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcA - utcB) / 86_400_000)
}

/** Binary search for the largest index where `yearStartOffsets[index] <= offset`. */
function findYearIndex(offset: number): number {
  let low = 0
  let high = yearStartOffsets.length - 2 // exclude the trailing sentinel
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (yearStartOffsets[mid] <= offset) {
      low = mid
    } else {
      high = mid - 1
    }
  }
  return low
}

/** Converts a Gregorian (AD) `Date` to its Bikram Sambat equivalent. */
export function adToBs(date: Date): BsDate {
  const offset = clamp(calendarDayDiff(date, REFERENCE_AD_DATE), 0, TOTAL_SPAN_DAYS - 1)
  const yearIndex = findYearIndex(offset)
  const year = MIN_BS_YEAR + yearIndex
  let remaining = offset - yearStartOffsets[yearIndex]
  const monthDays = BS_MONTH_DAYS[year]
  let month = 0
  while (remaining >= monthDays[month]) {
    remaining -= monthDays[month]
    month++
  }
  return { year, month, day: remaining + 1 }
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0")
}

/** Formats an AD `Date` as its Bikram Sambat equivalent, `YYYY-MM-DD` (month 01-12). */
export function adToBsIsoString(date: Date): string {
  const { year, month, day } = adToBs(date)
  return `${pad(year, 4)}-${pad(month + 1, 2)}-${pad(day, 2)}`
}

/**
 * Parses a `YYYY-MM-DD` Bikram Sambat string (month 01-12, as produced by
 * {@link adToBsIsoString}) back into an AD `Date`.
 */
export function bsIsoStringToAd(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Invalid BS date string: "${value}" (expected YYYY-MM-DD)`)
  const [, year, month, day] = match
  return bsToAd(Number(year), Number(month) - 1, Number(day))
}

/**
 * Converts a Bikram Sambat date to its Gregorian (AD) equivalent.
 *
 * Out-of-range years/months and overflowing days (e.g. day 32 of a 30-day
 * month) clamp to the nearest valid BS date rather than throwing, since this
 * is called continuously while rendering and navigating the calendar grid.
 */
export function bsToAd(year: number, month: number, day: number): Date {
  const clampedYear = clamp(year, MIN_BS_YEAR, MAX_BS_YEAR)
  const clampedMonth = clamp(month, 0, 11)
  const monthDays = BS_MONTH_DAYS[clampedYear]
  const clampedDay = clamp(day, 1, monthDays[clampedMonth])

  let offset = yearStartOffsets[clampedYear - MIN_BS_YEAR]
  for (let m = 0; m < clampedMonth; m++) offset += monthDays[m]
  offset += clampedDay - 1

  const utcMillis = Date.UTC(
    REFERENCE_AD_DATE.getFullYear(),
    REFERENCE_AD_DATE.getMonth(),
    REFERENCE_AD_DATE.getDate() + offset
  )
  const utcResult = new Date(utcMillis)
  return new Date(utcResult.getUTCFullYear(), utcResult.getUTCMonth(), utcResult.getUTCDate())
}
