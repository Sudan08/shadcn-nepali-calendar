import { describe, expect, it } from "vitest"

import {
  adToBs,
  adToBsIsoString,
  bsIsoStringToAd,
  bsToAd,
  daysInBsMonth,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
} from "../lib/nepali-calendar-core/bs-conversion"

describe("bsToAd / adToBs anchor points", () => {
  it("epoch: BS 1978-01-01 = AD 1921-04-13", () => {
    expect(bsToAd(1978, 0, 1)).toEqual(new Date(1921, 3, 13))
    expect(adToBs(new Date(1921, 3, 13))).toEqual({ year: 1978, month: 0, day: 1 })
  })

  it("well-known modern new year: BS 2080-01-01 = AD 2023-04-14", () => {
    expect(bsToAd(2080, 0, 1)).toEqual(new Date(2023, 3, 14))
    expect(adToBs(new Date(2023, 3, 14))).toEqual({ year: 2080, month: 0, day: 1 })
  })

  it("well-known modern new year: BS 2081-01-01 = AD 2024-04-13", () => {
    expect(bsToAd(2081, 0, 1)).toEqual(new Date(2024, 3, 13))
  })

  it("well-known modern new year: BS 2082-01-01 = AD 2025-04-14", () => {
    expect(bsToAd(2082, 0, 1)).toEqual(new Date(2025, 3, 14))
  })
})

describe("round-trip conversion across the whole supported range", () => {
  it("adToBs(bsToAd(y, m, d)) is the identity for every valid BS date", () => {
    for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
      for (let month = 0; month < 12; month++) {
        const days = daysInBsMonth(year, month)
        for (let day = 1; day <= days; day++) {
          const ad = bsToAd(year, month, day)
          const back = adToBs(ad)
          expect(back).toEqual({ year, month, day })
        }
      }
    }
  })

  it("every BS year sums to 365 or 366 days, except the one documented upstream quirk", () => {
    // BS 2096 is a known one-day-short year inherited from the source dataset -
    // see the comment in bs-calendar-data.ts.
    const KNOWN_EXCEPTIONS = new Set([2096])
    for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
      if (KNOWN_EXCEPTIONS.has(year)) continue
      let total = 0
      for (let month = 0; month < 12; month++) total += daysInBsMonth(year, month)
      expect(total).toBeGreaterThanOrEqual(365)
      expect(total).toBeLessThanOrEqual(366)
    }
  })

  it("consecutive AD days convert to consecutive BS days (no gaps/overlaps)", () => {
    let cursor = new Date(1978 <= MIN_BS_YEAR ? 1921 : 1921, 3, 13)
    let prevBs = adToBs(cursor)
    for (let i = 0; i < 5000; i++) {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
      const bs = adToBs(cursor)
      const isNextDay = bs.year === prevBs.year && bs.month === prevBs.month && bs.day === prevBs.day + 1
      const isNextMonth = bs.day === 1 && (bs.month === prevBs.month + 1 || (bs.month === 0 && prevBs.month === 11))
      expect(isNextDay || isNextMonth).toBe(true)
      prevBs = bs
    }
  })
})

describe("BS ISO string round-trip", () => {
  it("formats AD 2025-04-14 as BS 2082-01-01", () => {
    expect(adToBsIsoString(new Date(2025, 3, 14))).toBe("2082-01-01")
  })

  it("pads single-digit months/days", () => {
    expect(adToBsIsoString(bsToAd(2082, 4, 6))).toBe("2082-05-06")
  })

  it("parses back to the same AD date", () => {
    expect(bsIsoStringToAd("2082-05-06")).toEqual(bsToAd(2082, 4, 6))
  })

  it("throws on a malformed string", () => {
    expect(() => bsIsoStringToAd("2082-5-6")).toThrow()
    expect(() => bsIsoStringToAd("not-a-date")).toThrow()
  })
})

describe("out-of-range clamping", () => {
  it("clamps years below the supported range", () => {
    const result = adToBs(new Date(1800, 0, 1))
    expect(result.year).toBe(MIN_BS_YEAR)
  })

  it("clamps years above the supported range", () => {
    const result = adToBs(new Date(2100, 0, 1))
    expect(result.year).toBe(MAX_BS_YEAR)
  })

  it("clamps an overflowing day to the last valid day of the month", () => {
    const days = daysInBsMonth(2082, 0)
    expect(bsToAd(2082, 0, 32)).toEqual(bsToAd(2082, 0, days))
  })
})
