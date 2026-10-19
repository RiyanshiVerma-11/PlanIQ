import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_BLUEPRINTS,
  generateAlgorithmicBlueprint,
} from '../src/utils/blueprintEngine.ts';
import type { EventConstraints } from '../src/types/blueprint.ts';

const VALID_ROLES = new Set([
  'Logistics Director',
  'Master of Ceremonies',
  'Stage Manager',
  'Catering Lead',
  'Photo/Video Lead',
  'Event Host / VIP',
]);

test('Schema Integrity: All presets and dynamically synthesized blueprints use valid Lead Roles and non-empty fields', () => {
  const scenarios: EventConstraints[] = [
    {
      id: 'test-vineyard-summit',
      eventType: 'Culinary & Wine Pairing Summit',
      totalBudget: 35000,
      currency: 'EUR',
      locationSetting: 'Vineyard Estate Cellar',
      guestCount: 120,
      keyTheme: 'Rustic Sommelier Table & Acoustic Jazz',
      timeRemainingMonths: 6,
    },
    {
      id: 'test-ai-hackathon',
      eventType: 'Hackathon & AI Demo Day',
      totalBudget: 50000,
      currency: 'USD',
      locationSetting: 'Industrial Loft & Auditorium',
      guestCount: 250,
      keyTheme: 'High-Contrast Terminal & Neon Grid',
      timeRemainingMonths: 3,
      specialRequests: 'Live hardware soldering station and midnight espresso bar',
    },
  ];

  const blueprints = [
    ...Object.values(PRESET_BLUEPRINTS),
    ...scenarios.map((s) => generateAlgorithmicBlueprint(s)),
  ];

  for (const bp of blueprints) {
    assert.ok(bp.generatedAt.length > 0);
    assert.ok(bp.version.length > 0);

    // Verify contingency reserve & per-guest math consistency
    assert.equal(
      bp.budgetBreakdown.perGuestCost,
      Math.round(bp.constraints.totalBudget / bp.constraints.guestCount)
    );

    // Verify every Run of Show block has a valid Lead Role and positive duration
    for (const block of bp.runOfShow) {
      assert.ok(
        VALID_ROLES.has(block.leadRole),
        `Unexpected leadRole "${block.leadRole}" in blueprint ${bp.constraints.eventType}`
      );
      assert.ok(block.durationMinutes > 0, 'Run of Show block durationMinutes must be positive');
    }

    // Verify every milestone task has a valid priority and owner role
    for (const phase of bp.milestones) {
      for (const task of phase.tasks) {
        assert.ok(['Critical', 'High', 'Medium'].includes(task.priority));
        assert.ok(VALID_ROLES.has(task.ownerRole));
      }
    }
  }
});
