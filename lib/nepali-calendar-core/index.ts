export {
  adToBs,
  bsToAd,
  adToBsIsoString,
  bsIsoStringToAd,
  daysInBsMonth,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  type BsDate,
} from "./bs-conversion"
export { createNepaliDateLib } from "./bs-date-lib"
export { BS_MONTH_NAMES, BS_WEEKDAY_NAMES, type NepaliLocaleCode } from "./bs-locale"

import { bsToAd } from "./bs-conversion"

/**
 * Convenience helper to get the JS `Date` for a BS calendar date, e.g. for
 * `fromDate`/`toDate` bounds: `nepaliDate(2075, "Baisakh", 1)`.
 *
 * `month` is 1-indexed (1 = Baisakh ... 12 = Chaitra) to match how BS dates
 * are normally written, unlike the DayPicker/DateLib internals (0-indexed).
 */
export function nepaliDate(year: number, month: number, day: number): Date {
  return bsToAd(year, month - 1, day)
}
