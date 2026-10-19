import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRENCIES,
  formatCurrency,
  calculatePerGuestCost,
  calculateCategoryAmount,
  rebalanceBudgetCategories,
  normalizePercentages,
  generateAlgorithmicBlueprint,
  PRESET_MODERN_FUSION_WEDDING,
  PRESET_30TH_BIRTHDAY,
  PRESET_TECH_GALA,
  PRESET_BLUEPRINTS,
} from './blueprintEngine.ts';
import type { CurrencyCode, BudgetCategoryAllocation } from '../types/blueprint.ts';

test('formatCurrency formats all 7 supported currencies accurately', () => {
  const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  for (const code of currencies) {
    const formatted = formatCurrency(25000, code);
    assert.ok(typeof formatted === 'string' && formatted.length > 0, `Expected non-empty string for ${code}`);
    assert.ok(formatted.includes('25'), `Expected numeric digits in formatted output for ${code}: ${formatted}`);
  }
  assert.equal(Object.keys(CURRENCIES).length, 7);
});

test('calculatePerGuestCost handles normal, zero, negative, and fractional values', () => {
  assert.equal(calculatePerGuestCost(15000, 100), 150);
  assert.equal(calculatePerGuestCost(45000, 150), 300);
  assert.equal(calculatePerGuestCost(15000, 0), 0);
  assert.equal(calculatePerGuestCost(15000, -10), 0);
  assert.equal(calculatePerGuestCost(10000, 3), 3333);
});

test('calculateCategoryAmount computes exact rounded percentage allocations', () => {
  assert.equal(calculateCategoryAmount(10000, 20), 2000);
  assert.equal(calculateCategoryAmount(45000, 22), 9900);
  assert.equal(calculateCategoryAmount(45000, 34), 15300);
  assert.equal(calculateCategoryAmount(0, 50), 0);
  assert.equal(calculateCategoryAmount(50000, 0), 0);
});

test('rebalanceBudgetCategories updates all 7 category amounts accurately when totalBudget changes', () => {
  const original = PRESET_MODERN_FUSION_WEDDING.budgetBreakdown.categories;
  const rebalanced = rebalanceBudgetCategories(original, 100000);
  assert.equal(rebalanced.length, 7);

  const venueCat = rebalanced.find((c) => c.id === 'venue');
  assert.ok(venueCat);
  assert.equal(venueCat.allocatedAmount, 22000); // 22% of 100,000

  const sumAllocated = rebalanced.reduce((acc, c) => acc + c.allocatedAmount, 0);
  assert.equal(sumAllocated, 100000);
});

test('normalizePercentages guarantees exact 100% sum even with uneven thirds or remainders', () => {
  const makeCat = (id: string, pct: number): BudgetCategoryAllocation => ({
    id,
    category: id,
    percentage: pct,
    allocatedAmount: 0,
    description: '',
    costOptimizationTips: ['Tip 1', 'Tip 2'],
  });

  // Case 1: Already 100%
  const balanced = normalizePercentages([makeCat('a', 40), makeCat('b', 60)]);
  assert.equal(balanced.reduce((acc, c) => acc + c.percentage, 0), 100);

  // Case 2: Three equal items (10, 10, 10 -> 33 + 33 + 34 = 100)
  const thirds = normalizePercentages([makeCat('a', 10), makeCat('b', 10), makeCat('c', 10)]);
  assert.equal(thirds.reduce((acc, c) => acc + c.percentage, 0), 100);

  // Case 3: Over-allocated 7 categories
  const overAllocated = normalizePercentages([
    makeCat('1', 30),
    makeCat('2', 40),
    makeCat('3', 20),
    makeCat('4', 15),
    makeCat('5', 15),
    makeCat('6', 10),
    makeCat('7', 10),
  ]);
  assert.equal(overAllocated.reduce((acc, c) => acc + c.percentage, 0), 100);

  // Case 4: Zero sum returns unchanged without NaN
  const zeroSum = normalizePercentages([makeCat('a', 0), makeCat('b', 0)]);
  assert.equal(zeroSum[0].percentage, 0);
});

test('All 3 Master Presets in PRESET_BLUEPRINTS have complete, valid 4-deliverable structures', () => {
  const presetKeys = ['preset-fusion-wedding', 'preset-30th-birthday', 'preset-tech-gala'];
  assert.deepEqual(Object.keys(PRESET_BLUEPRINTS).sort(), presetKeys.sort());

  for (const key of presetKeys) {
    const bp = PRESET_BLUEPRINTS[key];
    assert.ok(bp, `Missing preset ${key}`);

    // Deliverable 1: Creative Concept
    assert.ok(bp.creativeConcept.aestheticTitle.length > 5);
    assert.ok(bp.creativeConcept.aestheticManifesto.length > 20);
    assert.ok(bp.creativeConcept.focalPoints.length >= 3);
    assert.equal(bp.creativeConcept.colorPalette.length, 5);
    for (const swatch of bp.creativeConcept.colorPalette) {
      assert.match(swatch.hex, /^#[0-9A-Fa-f]{6}$/);
    }
    assert.equal(bp.creativeConcept.interactiveElements.length, 3);

    // Deliverable 2: Dynamic 7-Pillar Budget
    assert.equal(bp.budgetBreakdown.categories.length, 7);
    const totalPct = bp.budgetBreakdown.categories.reduce((acc, c) => acc + c.percentage, 0);
    assert.equal(totalPct, 100, `Preset ${key} budget percentages must sum to 100`);
    for (const cat of bp.budgetBreakdown.categories) {
      assert.equal(cat.costOptimizationTips.length, 2);
      assert.ok(cat.costOptimizationTips[0].length > 5);
      assert.ok(cat.costOptimizationTips[1].length > 5);
    }

    // Deliverable 3: Backward Milestones & Run of Show
    assert.ok(bp.milestones.length >= 3);
    for (const phase of bp.milestones) {
      assert.ok(phase.tasks.length >= 2);
    }
    assert.ok(bp.runOfShow.length >= 6);
    for (const block of bp.runOfShow) {
      assert.ok(block.startTime.length > 0);
      assert.ok(block.endTime.length > 0);
      assert.ok(block.activity.length > 0);
      assert.ok(block.leadRole.length > 0);
    }

    // Deliverable 4: Vendor Vetting Kit
    assert.equal(bp.vendorVettingKit.length, 4);
    for (const v of bp.vendorVettingKit) {
      assert.equal(v.vettingQuestions.length, 3);
      assert.ok(v.bookingDeadline.length > 0);
      assert.ok(v.scopeOfWork.length >= 1);
      for (const q of v.vettingQuestions) {
        assert.ok(q.question.length > 5);
        assert.ok(q.whyItMatters.length > 5);
        assert.ok(q.greenFlagAnswer.length > 5);
        assert.ok(q.redFlagAnswer.length > 5);
      }
    }
  }
});

test('generateAlgorithmicBlueprint generates complete execution-ready plan for custom eco festival', () => {
  const customBp = generateAlgorithmicBlueprint({
    id: 'test-custom',
    eventType: 'Eco-Friendly Zero Waste Festival',
    totalBudget: 25000,
    currency: 'EUR',
    locationSetting: 'Botanical Glasshouse & Pavilion',
    guestCount: 180,
    keyTheme: 'Zero waste minimal, organic linen & wild botanical',
    timeRemainingMonths: 5,
  });

  assert.equal(customBp.constraints.eventType, 'Eco-Friendly Zero Waste Festival');
  assert.equal(customBp.budgetBreakdown.categories.length, 7);
  assert.equal(
    customBp.budgetBreakdown.categories.reduce((s, c) => s + c.percentage, 0),
    100
  );
  assert.equal(customBp.creativeConcept.interactiveElements.length, 3);
  assert.ok(customBp.milestones.length >= 2);
  assert.ok(customBp.runOfShow.length >= 8);
  assert.equal(customBp.vendorVettingKit.length, 4);
});

test('generateAlgorithmicBlueprint customizes deliverables for 50-person pet birthday on a houseboat edge case', () => {
  const houseboatBp = generateAlgorithmicBlueprint({
    id: 'test-houseboat-pet',
    eventType: 'Pet Birthday Party on Houseboat',
    totalBudget: 8000,
    currency: 'USD',
    locationSetting: 'Moored 80ft Houseboat & Upper Open Sun Deck',
    guestCount: 50,
    keyTheme: 'Nautical bark-cuterie, pet life jackets, splash-safe acoustic lounge',
    timeRemainingMonths: 2,
  });

  assert.equal(houseboatBp.constraints.guestCount, 50);
  assert.equal(houseboatBp.budgetBreakdown.totalBudget, 8000);
  assert.equal(houseboatBp.budgetBreakdown.perGuestCost, 160);
  assert.equal(houseboatBp.creativeConcept.interactiveElements.length, 3);
  assert.equal(houseboatBp.vendorVettingKit.length, 4);
  const categories = houseboatBp.vendorVettingKit.map((v) => v.category);
  assert.ok(categories.some((c) => c.includes('Houseboat') || c.includes('Marine')));
  assert.ok(categories.some((c) => c.includes('Pet')));
});

test('generateAlgorithmicBlueprint adapts milestones to urgent 1-month crunch vs 9-month horizon', () => {
  const urgentBp = generateAlgorithmicBlueprint({
    id: 'test-urgent',
    eventType: 'Corporate Product Launch Gala',
    totalBudget: 60000,
    currency: 'GBP',
    locationSetting: 'Industrial Truss Pavilion',
    guestCount: 300,
    keyTheme: 'Cyber Minimal & Electric Cyan',
    timeRemainingMonths: 1,
  });

  const longHorizonBp = generateAlgorithmicBlueprint({
    id: 'test-long',
    eventType: 'Destination Heritage Wedding',
    totalBudget: 120000,
    currency: 'INR',
    locationSetting: 'Historic Palace Courtyard',
    guestCount: 400,
    keyTheme: 'Royal Heritage & Brass',
    timeRemainingMonths: 9,
  });

  assert.equal(urgentBp.budgetBreakdown.perGuestCost, 200);
  assert.equal(longHorizonBp.budgetBreakdown.perGuestCost, 300);
  assert.ok(urgentBp.milestones.length >= 2);
  assert.ok(longHorizonBp.milestones.length >= 3);
});

test('Problem Statement Alignment: Covers Weddings, Birthdays, and Community Events with budgets, timelines, vendor checklists, and personalized ideas', () => {
  const coreArchetypes = [
    PRESET_MODERN_FUSION_WEDDING,
    PRESET_30TH_BIRTHDAY,
    PRESET_TECH_GALA,
  ];

  assert.match(coreArchetypes[0].constraints.eventType, /Wedding/i);
  assert.match(coreArchetypes[1].constraints.eventType, /Birthday/i);
  assert.match(coreArchetypes[2].constraints.eventType, /Community|Gala/i);

  for (const bp of coreArchetypes) {
    // 1. Personalized ideas (aesthetic manifesto, decor focal points, color palette, interactive elements)
    assert.ok(bp.creativeConcept.aestheticTitle.length > 0);
    assert.equal(bp.creativeConcept.colorPalette.length, 5);
    assert.equal(bp.creativeConcept.interactiveElements.length, 3);

    // 2. Budgets (7-pillar allocation summing to 100% + cost optimization tips)
    assert.equal(bp.budgetBreakdown.categories.length, 7);
    assert.equal(
      bp.budgetBreakdown.categories.reduce((sum, c) => sum + c.percentage, 0),
      100
    );

    // 3. Timelines (backward planning milestone checklists + day-of Run-of-Show)
    assert.ok(bp.milestones.length >= 3);
    assert.ok(bp.runOfShow.length >= 6);

    // 4. Vendor checklists (scope of work + 3 vetting questions with green/red flags)
    assert.equal(bp.vendorVettingKit.length, 4);
  }
});

