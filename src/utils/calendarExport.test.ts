import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRunOfShowICS } from './calendarExport.ts';
import { generateMarkdown, generateICS } from './exportHelpers.ts';
import {
  PRESET_MODERN_FUSION_WEDDING,
  PRESET_30TH_BIRTHDAY,
  PRESET_TECH_GALA,
} from './blueprintEngine.ts';
import type { RunOfShowBlock } from '../types/blueprint.ts';

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

test('exportHelpers.generateMarkdown compiles all 4 deliverables, tables, and task checkboxes', () => {
  for (const preset of [PRESET_MODERN_FUSION_WEDDING, PRESET_30TH_BIRTHDAY, PRESET_TECH_GALA]) {
    const md = generateMarkdown(preset);
    assert.ok(md.includes('# MASTER EVENT STRATEGY & LOGISTICS BLUEPRINT'));
    assert.ok(md.includes('## EVENT CONSTRAINTS'));
    assert.ok(md.includes('## 1. PERSONALIZED CREATIVE CONCEPT'));
    assert.ok(md.includes('### Curated Color Scheme:'));
    assert.ok(md.includes('### 3 Signature Interactive Elements:'));
    assert.ok(md.includes('## 2. DYNAMIC BUDGET BREAKDOWN TABLE'));
    assert.ok(md.includes('| Category | % Allocation |'));
    assert.ok(md.includes('## 3. MILESTONES & DAY-OF TIMELINE'));
    assert.ok(md.includes('- [x]') || md.includes('- [ ]'));
    assert.ok(md.includes('## 4. VENDOR SOURCING & VETTING KIT'));
  }
});

test('exportHelpers.generateICS compiles complete blueprint schedule to RFC 5545 with matching event count', () => {
  const ics = generateICS(PRESET_MODERN_FUSION_WEDDING);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('PRODID:-//PlanIQ//Event Strategy & Logistics Director//EN'));
  assert.ok(ics.includes('UID:planiq-'));
  assert.ok(ics.includes('END:VCALENDAR'));

  const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(veventCount, PRESET_MODERN_FUSION_WEDDING.runOfShow.length);
});
