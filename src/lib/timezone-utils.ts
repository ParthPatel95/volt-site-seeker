/**
 * Alberta Timezone Utilities
 * 
 * Alberta observes Mountain Time:
 * - MST (Mountain Standard Time): UTC-7 during winter
 * - MDT (Mountain Daylight Time): UTC-6 during summer
 * 
 * DST transitions:
 * - Starts: Second Sunday of March at 2:00 AM (clocks move forward to 3:00 AM)
 * - Ends: First Sunday of November at 2:00 AM (clocks move back to 1:00 AM)
 */

/**
 * Determines if a given UTC date falls within Daylight Saving Time (MDT) in Alberta.
 * @param utcDate - Date object in UTC
 * @returns true if the date is during MDT (summer), false if MST (winter)
 */
export function isDaylightSavingTime(utcDate: Date): boolean {
  const year = utcDate.getUTCFullYear();
  
  // Calculate second Sunday of March (DST starts)
  const marchFirst = new Date(Date.UTC(year, 2, 1)); // March 1
  const marchFirstDay = marchFirst.getUTCDay();
  const daysUntilFirstSunday = (7 - marchFirstDay) % 7;
  const secondSundayMarch = 1 + daysUntilFirstSunday + 7;
  // DST starts at 2:00 AM MST = 9:00 AM UTC
  const dstStart = new Date(Date.UTC(year, 2, secondSundayMarch, 9, 0, 0));
  
  // Calculate first Sunday of November (DST ends)
  const novFirst = new Date(Date.UTC(year, 10, 1)); // November 1
  const novFirstDay = novFirst.getUTCDay();
  const daysUntilNovSunday = novFirstDay === 0 ? 0 : (7 - novFirstDay);
  const firstSundayNov = 1 + daysUntilNovSunday;
  // DST ends at 2:00 AM MDT = 8:00 AM UTC
  const dstEnd = new Date(Date.UTC(year, 10, firstSundayNov, 8, 0, 0));
  
  // Check if date falls within DST period
  return utcDate >= dstStart && utcDate < dstEnd;
}

/**
 * Gets the UTC offset for Alberta at a given time.
 * @param utcDate - Date object in UTC
 * @returns offset in hours (negative for west of UTC)
 */
export function getAlbertaOffset(utcDate: Date): number {
  return isDaylightSavingTime(utcDate) ? -6 : -7;
}

/**
 * Gets the timezone abbreviation for Alberta at a given time.
 * @param utcDate - Date object in UTC
 * @returns 'MDT' during summer, 'MST' during winter
 */
export function getAlbertaTimezoneAbbr(utcDate: Date): 'MST' | 'MDT' {
  return isDaylightSavingTime(utcDate) ? 'MDT' : 'MST';
}

export interface MountainTimeComponents {
  date: Date;
  hour: number;
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
  year: number;
  timezone: 'MST' | 'MDT';
  utcOffset: number;
}

/**
 * Converts a UTC timestamp to Mountain Time (MST/MDT) date components.
 * Automatically handles daylight saving time transitions.
 * 
 * @param utcTimestamp - ISO 8601 timestamp string or Date object
 * @returns Object with date components in Mountain Time
 */
export function parseToMountainTime(utcTimestamp: string | Date): MountainTimeComponents {
  const utc = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp;
  const offset = getAlbertaOffset(utc);
  const timezone = getAlbertaTimezoneAbbr(utc);
  
  // Apply offset to get Mountain Time
  const mtMs = utc.getTime() + (offset * 60 * 60 * 1000);
  const mt = new Date(mtMs);
  
  return {
    date: mt,
    hour: mt.getUTCHours(),
    dayOfWeek: mt.getUTCDay(),
    dayOfMonth: mt.getUTCDate(),
    month: mt.getUTCMonth(),
    year: mt.getUTCFullYear(),
    timezone,
    utcOffset: offset
  };
}

/**
 * Legacy function name for backwards compatibility.
 * Converts UTC to Mountain Time with DST awareness.
 * 
 * @param utcTimestamp - ISO 8601 timestamp string
 * @returns Object with date components in Mountain Time
 */
export function parseToMST(utcTimestamp: string): MountainTimeComponents {
  return parseToMountainTime(utcTimestamp);
}

/**
 * Formats a UTC timestamp as a Mountain Time string.
 * @param utcTimestamp - ISO 8601 timestamp string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted string in Mountain Time
 */
export function formatMountainTime(
  utcTimestamp: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
): string {
  const utc = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp;
  
  // Use Intl.DateTimeFormat with America/Edmonton timezone for proper DST handling
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'America/Edmonton'
  }).format(utc);
}

/**
 * Gets Hour-Ending (HE) notation used by AESO.
 * AESO uses hour-ending convention: HE1 = 00:00-01:00, HE19 = 18:00-19:00
 * 
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Hour-Ending string (HE1 through HE24)
 */
export function toHourEnding(hour: number): string {
  // HE is 1-indexed: hour 0 (midnight) = HE1, hour 18 = HE19
  return `HE${hour + 1}`;
}
