import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRunOfShowICS } from '../src/utils/calendarExport.ts';
import {
  PRESET_MODERN_FUSION_WEDDING,
  PRESET_30TH_BIRTHDAY,
  PRESET_TECH_GALA,
} from '../src/utils/blueprintEngine.ts';
import type { RunOfShowBlock } from '../src/types/blueprint.ts';

test('generateRunOfShowICS generates valid RFC 5545 format with PlanIQ PRODID and CRLF line endings', () => {
  const ics = generateRunOfShowICS(
    PRESET_MODERN_FUSION_WEDDING.runOfShow,
    'Modern Fusion Wedding',
    'Indoor banquet + outdoor lawn'
  );

  assert.ok(ics.includes('\r\n'), 'ICS output must use RFC 5545 CRLF line endings');
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR'));
  assert.ok(ics.includes('VERSION:2.0'));
  assert.ok(ics.includes('PRODID:-//PlanIQ//Event Strategy & Logistics Director//EN'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('SUMMARY:[Logistics Director] Vendor Load-In & Structural Rigging'));
  assert.ok(ics.includes('LOCATION:Banquet Hall & Lawn'));
  assert.ok(ics.includes('DTSTART:'));
  assert.ok(ics.includes('DTEND:'));
});

test('generateRunOfShowICS handles midnight wraparound (late night block ending next day)', () => {
  const lateNightBlocks: RunOfShowBlock[] = [
    {
      id: 'late-1',
      startTime: '11:00 PM',
      endTime: '01:30 AM',
      durationMinutes: 150,
      activity: 'Afterparty & Strike',
      location: 'Rooftop Lounge, Floor 12; East Wing',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Line 1\nLine 2',
      equipmentOrSupplies: 'DJ Booth',
    },
  ];

  const ics = generateRunOfShowICS(lateNightBlocks, 'Late Night Soiree, VIP', 'Main Loft');
  const startMatch = ics.match(/DTSTART:(\d{8})T(\d{6})/);
  const endMatch = ics.match(/DTEND:(\d{8})T(\d{6})/);

  assert.ok(startMatch, 'Expected valid DTSTART');
  assert.ok(endMatch, 'Expected valid DTEND');
  assert.equal(startMatch[2], '230000');
  assert.equal(endMatch[2], '013000');
  assert.ok(
    Number(endMatch[1]) >= Number(startMatch[1]),
    'End date must be on or after start date when crossing midnight'
  );
  // Verify commas/semicolons are stripped from SUMMARY and LOCATION
  assert.ok(ics.includes('LOCATION:Rooftop Lounge Floor 12 East Wing'));
  assert.ok(ics.includes('DESCRIPTION:Activity: Afterparty & Strike\\nRole: Stage Manager'));
});

test('generateRunOfShowICS produces exact VEVENT count matching each preset Run-of-Show', () => {
  for (const preset of [PRESET_MODERN_FUSION_WEDDING, PRESET_30TH_BIRTHDAY, PRESET_TECH_GALA]) {
    const ics = generateRunOfShowICS(
      preset.runOfShow,
      preset.constraints.eventType,
      preset.constraints.locationSetting
    );
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.equal(eventCount, preset.runOfShow.length);
  }
});
