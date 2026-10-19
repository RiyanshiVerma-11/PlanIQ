import type { RunOfShowBlock } from '../types/blueprint.ts';

/**
 * Format date-time for iCalendar RFC 5545 (YYYYMMDDTHHMMSS)
 */
function formatICSDateTime(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Parse human time string like "08:00 AM", "04:15 PM" into hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return { hours: 9, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3];

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Generate standard RFC 5545 .ics iCalendar file string from Run of Show blocks
 */
export function generateRunOfShowICS(
  runOfShow: RunOfShowBlock[],
  eventTitle: string,
  eventLocation: string
): string {
  // Use a targeted weekend date 3 months in the future as realistic anchor
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 90);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanIQ//Event Strategy & Logistics Director//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${eventTitle.replace(/[,;]/g, '')} - Run of Show`,
    'X-WR-TIMEZONE:UTC',
  ];

  runOfShow.forEach((block, idx) => {
    const startParsed = parseTimeString(block.startTime);
    const endParsed = parseTimeString(block.endTime);

    const startDate = new Date(baseDate);
    startDate.setHours(startParsed.hours, startParsed.minutes, 0, 0);

    const endDate = new Date(baseDate);
    endDate.setHours(endParsed.hours, endParsed.minutes, 0, 0);
    // If end is before start, it crosses midnight into the next day
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const uid = `planiq-${Date.now()}-${idx}@planiq.app`;
    const summary = `[${block.leadRole}] ${block.activity}`;
    const description = `Activity: ${block.activity}\\nRole: ${block.leadRole}\\nLocation: ${
      block.location
    }\\nOperational Cues: ${block.cuesAndNotes.replace(/\n/g, '\\n')}${
      block.equipmentOrSupplies
        ? `\\nEquipment/Tools: ${block.equipmentOrSupplies.replace(/\n/g, '\\n')}`
        : ''
    }`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDateTime(new Date())}Z`,
      `DTSTART:${formatICSDateTime(startDate)}`,
      `DTEND:${formatICSDateTime(endDate)}`,
      `SUMMARY:${summary.replace(/[,;]/g, '')}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${(block.location || eventLocation).replace(/[,;]/g, '')}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger immediate browser download of the .ics file
 */
export function downloadRunOfShowICS(
  runOfShow: RunOfShowBlock[],
  eventTitle: string,
  eventLocation: string
): void {
  const icsData = generateRunOfShowICS(runOfShow, eventTitle, eventLocation);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  link.href = url;
  link.setAttribute('download', `${safeTitle}-run-of-show.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
