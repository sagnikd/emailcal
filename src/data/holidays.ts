export type HolidayCountry = 'US' | 'IN'

export interface Holiday {
  date: string // YYYY-MM-DD
  name: string
  country: HolidayCountry
}

export const HOLIDAYS: Holiday[] = [
  // ─── US Federal Holidays 2025 ────────────────────────────────────────────
  { date: '2025-01-01', name: "New Year's Day",       country: 'US' },
  { date: '2025-01-20', name: 'MLK Day',              country: 'US' },
  { date: '2025-02-17', name: "Presidents' Day",      country: 'US' },
  { date: '2025-05-26', name: 'Memorial Day',         country: 'US' },
  { date: '2025-06-19', name: 'Juneteenth',           country: 'US' },
  { date: '2025-07-04', name: 'Independence Day',     country: 'US' },
  { date: '2025-09-01', name: 'Labor Day',            country: 'US' },
  { date: '2025-10-13', name: 'Columbus Day',         country: 'US' },
  { date: '2025-11-11', name: "Veterans Day",         country: 'US' },
  { date: '2025-11-27', name: 'Thanksgiving',         country: 'US' },
  { date: '2025-12-25', name: 'Christmas Day',        country: 'US' },

  // ─── India Public Holidays 2025 ──────────────────────────────────────────
  { date: '2025-01-14', name: 'Makar Sankranti',      country: 'IN' },
  { date: '2025-01-26', name: 'Republic Day',         country: 'IN' },
  { date: '2025-03-14', name: 'Holi',                 country: 'IN' },
  { date: '2025-03-31', name: 'Eid al-Fitr',          country: 'IN' },
  { date: '2025-04-14', name: 'Ambedkar Jayanti',     country: 'IN' },
  { date: '2025-04-18', name: 'Good Friday',          country: 'IN' },
  { date: '2025-05-01', name: 'Labour Day',           country: 'IN' },
  { date: '2025-06-07', name: 'Eid al-Adha',         country: 'IN' },
  { date: '2025-08-15', name: 'Independence Day',     country: 'IN' },
  { date: '2025-10-02', name: 'Gandhi Jayanti',       country: 'IN' },
  { date: '2025-10-02', name: 'Dussehra',             country: 'IN' },
  { date: '2025-10-20', name: 'Diwali',               country: 'IN' },
  { date: '2025-11-05', name: 'Guru Nanak Jayanti',   country: 'IN' },
  { date: '2025-12-25', name: 'Christmas Day',        country: 'IN' },

  // ─── US Federal Holidays 2026 ────────────────────────────────────────────
  { date: '2026-01-01', name: "New Year's Day",       country: 'US' },
  { date: '2026-01-19', name: 'MLK Day',              country: 'US' },
  { date: '2026-02-16', name: "Presidents' Day",      country: 'US' },
  { date: '2026-05-25', name: 'Memorial Day',         country: 'US' },
  { date: '2026-06-19', name: 'Juneteenth',           country: 'US' },
  { date: '2026-07-04', name: 'Independence Day (US)',country: 'US' },
  { date: '2026-09-07', name: 'Labor Day',            country: 'US' },
  { date: '2026-10-12', name: 'Columbus Day',         country: 'US' },
  { date: '2026-11-11', name: "Veterans Day",         country: 'US' },
  { date: '2026-11-26', name: 'Thanksgiving',         country: 'US' },
  { date: '2026-12-25', name: 'Christmas Day',        country: 'US' },

  // ─── India Public Holidays 2026 ──────────────────────────────────────────
  { date: '2026-01-14', name: 'Makar Sankranti',      country: 'IN' },
  { date: '2026-01-26', name: 'Republic Day',         country: 'IN' },
  { date: '2026-03-03', name: 'Holi',                 country: 'IN' },
  { date: '2026-03-20', name: 'Eid al-Fitr',          country: 'IN' },
  { date: '2026-04-03', name: 'Good Friday',          country: 'IN' },
  { date: '2026-04-14', name: 'Ambedkar Jayanti',     country: 'IN' },
  { date: '2026-05-01', name: 'Labour Day',           country: 'IN' },
  { date: '2026-05-27', name: 'Eid al-Adha',         country: 'IN' },
  { date: '2026-08-15', name: 'Independence Day',     country: 'IN' },
  { date: '2026-10-02', name: 'Gandhi Jayanti',       country: 'IN' },
  { date: '2026-10-20', name: 'Dussehra',             country: 'IN' },
  { date: '2026-11-08', name: 'Diwali',               country: 'IN' },
  { date: '2026-11-25', name: 'Guru Nanak Jayanti',   country: 'IN' },
  { date: '2026-12-25', name: 'Christmas Day',        country: 'IN' },

  // ─── US Federal Holidays 2027 ────────────────────────────────────────────
  { date: '2027-01-01', name: "New Year's Day",       country: 'US' },
  { date: '2027-01-18', name: 'MLK Day',              country: 'US' },
  { date: '2027-02-15', name: "Presidents' Day",      country: 'US' },
  { date: '2027-05-31', name: 'Memorial Day',         country: 'US' },
  { date: '2027-06-19', name: 'Juneteenth',           country: 'US' },
  { date: '2027-07-04', name: 'Independence Day (US)',country: 'US' },
  { date: '2027-09-06', name: 'Labor Day',            country: 'US' },
  { date: '2027-10-11', name: 'Columbus Day',         country: 'US' },
  { date: '2027-11-11', name: "Veterans Day",         country: 'US' },
  { date: '2027-11-25', name: 'Thanksgiving',         country: 'US' },
  { date: '2027-12-25', name: 'Christmas Day',        country: 'US' },

  // ─── India Public Holidays 2027 ──────────────────────────────────────────
  { date: '2027-01-14', name: 'Makar Sankranti',      country: 'IN' },
  { date: '2027-01-26', name: 'Republic Day',         country: 'IN' },
  { date: '2027-03-22', name: 'Holi',                 country: 'IN' },
  { date: '2027-03-09', name: 'Eid al-Fitr',          country: 'IN' },
  { date: '2027-03-26', name: 'Good Friday',          country: 'IN' },
  { date: '2027-04-14', name: 'Ambedkar Jayanti',     country: 'IN' },
  { date: '2027-05-01', name: 'Labour Day',           country: 'IN' },
  { date: '2027-05-17', name: 'Eid al-Adha',         country: 'IN' },
  { date: '2027-08-15', name: 'Independence Day',     country: 'IN' },
  { date: '2027-10-02', name: 'Gandhi Jayanti',       country: 'IN' },
  { date: '2027-10-09', name: 'Dussehra',             country: 'IN' },
  { date: '2027-10-29', name: 'Diwali',               country: 'IN' },
  { date: '2027-11-14', name: 'Guru Nanak Jayanti',   country: 'IN' },
  { date: '2027-12-25', name: 'Christmas Day',        country: 'IN' },
]

/** Returns holidays for a given YYYY-MM-DD date string */
export function getHolidaysForDate(dateStr: string): Holiday[] {
  return HOLIDAYS.filter(h => h.date === dateStr)
}
