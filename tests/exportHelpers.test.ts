import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMarkdown, generateICS } from '../src/utils/exportHelpers.ts';
import {
  PRESET_MODERN_FUSION_WEDDING,
  PRESET_30TH_BIRTHDAY,
  PRESET_TECH_GALA,
  generateAlgorithmicBlueprint,
} from '../src/utils/blueprintEngine.ts';

test('exportHelpers.generateMarkdown compiles all 4 deliverables, tables, and task checkboxes across all presets', () => {
  for (const preset of [PRESET_MODERN_FUSION_WEDDING, PRESET_30TH_BIRTHDAY, PRESET_TECH_GALA]) {
    const md = generateMarkdown(preset);
    assert.ok(md.includes('# MASTER EVENT STRATEGY & LOGISTICS BLUEPRINT'));
    assert.ok(md.includes('## EVENT CONSTRAINTS'));
    assert.ok(md.includes(`- Event Type: ${preset.constraints.eventType}`));
    assert.ok(md.includes('## 1. PERSONALIZED CREATIVE CONCEPT'));
    assert.ok(md.includes('### Curated Color Scheme:'));
    assert.ok(md.includes('### 3 Signature Interactive Elements:'));
    assert.ok(md.includes('## 2. DYNAMIC BUDGET BREAKDOWN TABLE'));
    assert.ok(md.includes('| Category | % Allocation |'));
    assert.ok(md.includes('## 3. MILESTONES & DAY-OF TIMELINE'));
    assert.ok(md.includes('- [x]') || md.includes('- [ ]'));
    assert.ok(md.includes('## 4. VENDOR SOURCING & VETTING KIT'));
    assert.ok(md.includes('**Forensic Vetting Questions (Eliminate Hidden Fees):**'));
  }
});

test('exportHelpers.generateMarkdown reflects updated task completion states accurately', () => {
  const customBp = generateAlgorithmicBlueprint({
    id: 'md-checkbox-test',
    eventType: 'Boutique Rooftop Soiree',
    totalBudget: 18000,
    currency: 'USD',
    locationSetting: 'Downtown Conservatory',
    guestCount: 80,
    keyTheme: 'Botanical Velvet & Candlelight',
    timeRemainingMonths: 4,
  });

  // Mark all tasks in first milestone as completed
  customBp.milestones[0].tasks.forEach((t) => {
    t.completed = true;
  });

  const md = generateMarkdown(customBp);
  assert.ok(md.includes('- [x]'), 'Completed tasks should render with [x] in Markdown');
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
