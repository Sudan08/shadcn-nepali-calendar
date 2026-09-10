import { adToBs } from "./bs-conversion"
import { BS_MONTH_NAMES, BS_WEEKDAY_NAMES, type NepaliLocaleCode } from "./bs-locale"

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function weekdayLabel(date: Date, length: number, locale: NepaliLocaleCode): string {
  const names = BS_WEEKDAY_NAMES[locale]
  const index = date.getDay()
  // date-fns convention: `cccc`/`EEEE` (length 4) is the full name; every
  // other run length (`ccc`, `cccccc`, ...) is the abbreviated form.
  return length === 4 ? names.full[index] : names.short[index]
}

function monthLabel(month: number, length: number, locale: NepaliLocaleCode): string {
  const names = BS_MONTH_NAMES[locale]
  if (length >= 4) return names.full[month]
  if (length === 3) return names.short[month]
  return pad2(month + 1)
}

function renderToken(token: string, length: number, date: Date, locale: NepaliLocaleCode): string {
  const { year, month, day } = adToBs(date)

  switch (token) {
    case "y":
      return length === 2 ? pad2(year % 100) : String(year)
    case "M":
    case "L":
      return monthLabel(month, length, locale)
    case "d":
      return length >= 2 ? pad2(day) : String(day)
    case "E":
    case "c":
      return weekdayLabel(date, length, locale)
    default:
      return token.repeat(length)
  }
}

const TOKEN_CHARS = new Set(["y", "M", "L", "d", "E", "c"])

/**
 * Formats a real (Gregorian-instant) `Date` using Bikram Sambat calendar
 * values, for the subset of date-fns format tokens DayPicker actually uses:
 * `y`/`yy`, `M`/`MM`/`MMM`/`MMMM` (and the `L` "standalone" equivalents),
 * `d`/`dd`, and `E`/`c` (weekday, which is calendar-agnostic).
 *
 * `PPPP` (the long localized date DayPicker uses for aria-labels) is
 * special-cased since it isn't decomposable into repeated-letter tokens.
 */
export function formatBs(date: Date, formatStr: string, locale: NepaliLocaleCode): string {
  if (formatStr === "PPPP") {
    const { year, day } = adToBs(date)
    const weekday = weekdayLabel(date, 4, locale)
    const month = monthLabel(adToBs(date).month, 4, locale)
    return `${weekday}, ${month} ${day}, ${year}`
  }

  let result = ""
  let i = 0
  while (i < formatStr.length) {
    const ch = formatStr[i]
    if (TOKEN_CHARS.has(ch)) {
      let j = i
      while (j < formatStr.length && formatStr[j] === ch) j++
      result += renderToken(ch, j - i, date, locale)
      i = j
    } else {
      result += ch
      i++
    }
  }
  return result
}
