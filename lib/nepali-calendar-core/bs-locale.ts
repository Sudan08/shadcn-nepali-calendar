/** Language used to render Bikram Sambat month/weekday names. Independent of numerals. */
export type NepaliLocaleCode = "en" | "ne"

export const BS_MONTH_NAMES: Record<NepaliLocaleCode, { full: string[]; short: string[] }> = {
  ne: {
    full: [
      "बैशाख",
      "जेठ",
      "असार",
      "साउन",
      "भदौ",
      "असोज",
      "कार्तिक",
      "मंसिर",
      "पुष",
      "माघ",
      "फागुन",
      "चैत",
    ],
    short: [
      "बैशाख",
      "जेठ",
      "असार",
      "साउन",
      "भदौ",
      "असोज",
      "कार्तिक",
      "मंसिर",
      "पुष",
      "माघ",
      "फागुन",
      "चैत",
    ],
  },
  en: {
    full: [
      "Baisakh",
      "Jestha",
      "Ashadh",
      "Shrawan",
      "Bhadra",
      "Ashwin",
      "Kartik",
      "Mangsir",
      "Poush",
      "Magh",
      "Falgun",
      "Chaitra",
    ],
    short: ["Bai", "Jes", "Asd", "Shr", "Bha", "Asw", "Kar", "Man", "Pou", "Mag", "Fal", "Cha"],
  },
}

export const BS_WEEKDAY_NAMES: Record<NepaliLocaleCode, { full: string[]; short: string[] }> = {
  ne: {
    full: ["आइतबार", "सोमबार", "मङ्गलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"],
    short: ["आइत", "सोम", "मङ्गल", "बुध", "बिहि", "शुक्र", "शनि"],
  },
  en: {
    full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  },
}
