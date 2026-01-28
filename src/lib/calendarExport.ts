/**
 * Calendar Export Utility for 12CP Peak Events
 * Generates ICS files for adding peak alerts to calendars
 */

export interface ScheduledPeakEvent {
  id: string;
  rank: number;
  scheduledDate: Date;
  displayDate: string;
  timeWindow: {
    start: string;
    end: string;
    timezone: string;
  };
  expectedDemandMW: {
    min: number;
    max: number;
    median: number;
  };
  confidenceScore: number;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  weatherCondition: string;
  historicalReference: string;
  daysUntilEvent: number;
  isUpcoming: boolean;
  isPast: boolean;
  monthGroup: 'december' | 'january';
}

/**
 * Format date for ICS (YYYYMMDDTHHmmssZ format)
 */
const formatICSDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Generate ICS content for a single peak event
 */
export const generateICSEvent = (event: ScheduledPeakEvent): string => {
  // Start time: 1 AM MST (UTC-7)
  const startTime = new Date(event.scheduledDate);
  startTime.setUTCHours(8, 0, 0, 0); // 1 AM MST = 8 AM UTC
  
  // End time: 3 AM MST
  const endTime = new Date(event.scheduledDate);
  endTime.setUTCHours(10, 0, 0, 0); // 3 AM MST = 10 AM UTC

  const uid = `12cp-peak-${event.id}@aeso-alerts`;
  const now = new Date();
  
  const description = [
    `HIGH PROBABILITY 12CP PEAK EVENT`,
    ``,
    `Expected Demand: ${event.expectedDemandMW.min.toLocaleString()}-${event.expectedDemandMW.max.toLocaleString()} MW`,
    `Median Forecast: ${event.expectedDemandMW.median.toLocaleString()} MW`,
    `Confidence: ${event.confidenceScore}%`,
    `Risk Level: ${event.riskLevel.toUpperCase()}`,
    ``,
    `Weather Requirement: ${event.weatherCondition}`,
    ``,
    `Historical Reference: ${event.historicalReference}`,
    ``,
    `ACTION: Reduce consumption if possible during this window to minimize transmission costs.`
  ].join('\\n');

  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
SUMMARY:⚡ 12CP Peak Alert #${event.rank} - ${event.expectedDemandMW.median.toLocaleString()} MW
DESCRIPTION:${description}
LOCATION:Alberta Electric System
STATUS:TENTATIVE
TRANSP:OPAQUE
CATEGORIES:12CP Peak,AESO,Energy
PRIORITY:${event.rank <= 3 ? 1 : event.rank <= 6 ? 5 : 9}
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT24H
DESCRIPTION:⚡ 12CP Peak Alert in 24 hours - Rank #${event.rank}
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT1H
DESCRIPTION:⚡ 12CP Peak Alert in 1 hour - Prepare for peak demand
END:VALARM
END:VEVENT`;
};

/**
 * Generate complete ICS calendar file for multiple events
 */
export const generateICSCalendar = (events: ScheduledPeakEvent[]): string => {
  const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AESO 12CP Peak Alerts//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:AESO 12CP Peak Schedule 2026/2027
X-WR-TIMEZONE:America/Edmonton`;

  const footer = `END:VCALENDAR`;

  const eventStrings = events.map(generateICSEvent).join('\n');

  return `${header}\n${eventStrings}\n${footer}`;
};

/**
 * Download ICS file to user's device
 */
export const downloadICSFile = (events: ScheduledPeakEvent[], filename?: string): void => {
  const icsContent = generateICSCalendar(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '12cp-peak-schedule-2026-2027.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download single event as ICS
 */
export const downloadSingleEventICS = (event: ScheduledPeakEvent): void => {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AESO 12CP Peak Alerts//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${generateICSEvent(event)}
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `12cp-peak-${event.rank}-${event.displayDate.replace(/[,\s]/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculate days until event
 */
export const calculateDaysUntil = (targetDate: Date): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Get day name for a date
 */
export const getDayName = (year: number, month: number, day: number): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(year, month, day);
  return dayNames[date.getDay()];
};
