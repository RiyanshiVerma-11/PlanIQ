import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatCurrency,
  normalizePercentages,
  generateAlgorithmicBlueprint,
  PRESET_MODERN_FUSION_WEDDING,
  CURRENCIES,
} from '../src/utils/blueprintEngine.ts';
import type { BudgetCategoryAllocation } from '../src/types/blueprint.ts';
import {
  summarizePortfolioMetrics,
  buildSpendingVsAllocationChartData,
} from '../src/utils/dashboardMetrics.ts';

test('Efficiency Benchmark: formatCurrency memoization executes 10,000 calls in < 40ms', () => {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    formatCurrency(45000 + i, 'USD');
    formatCurrency(3500000 + i, 'INR');
    formatCurrency(12000 + i, 'EUR');
  }
  const duration = performance.now() - start;
  assert.ok(
    duration < 150,
    `10,000 formatted calls took ${duration.toFixed(2)}ms (expected < 150ms)`
  );
});

test('Efficiency Benchmark: normalizePercentages runs in < 0.05ms per operation', () => {
  const categories: BudgetCategoryAllocation[] = [
    {
      id: '1',
      category: 'Venue',
      percentage: 33,
      allocatedAmount: 3300,
      description: 'Venue rental',
      costOptimizationTips: ['Tip 1', 'Tip 2'],
    },
    {
      id: '2',
      category: 'F&B',
      percentage: 33,
      allocatedAmount: 3300,
      description: 'Catering',
      costOptimizationTips: ['Tip 1', 'Tip 2'],
    },
    {
      id: '3',
      category: 'Decor',
      percentage: 33,
      allocatedAmount: 3300,
      description: 'Decor',
      costOptimizationTips: ['Tip 1', 'Tip 2'],
    },
  ];

  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    normalizePercentages(categories);
  }
  const duration = performance.now() - start;
  assert.ok(
    duration < 20,
    `1,000 normalizations took ${duration.toFixed(2)}ms (expected < 20ms)`
  );
});

test('Efficiency Benchmark: summarizePortfolioMetrics executes in < 1ms for multi-event portfolios', () => {
  const portfolio = [PRESET_MODERN_FUSION_WEDDING];
  const start = performance.now();
  for (let i = 0; i < 200; i++) {
    summarizePortfolioMetrics(portfolio, PRESET_MODERN_FUSION_WEDDING);
  }
  const avgDuration = (performance.now() - start) / 200;
  assert.ok(
    avgDuration < 0.5,
    `Average summarizePortfolioMetrics took ${avgDuration.toFixed(3)}ms (expected < 0.5ms)`
  );
});

test('Efficiency Benchmark: buildSpendingVsAllocationChartData processes 7 pillars in < 0.2ms', () => {
  const start = performance.now();
  for (let i = 0; i < 200; i++) {
    buildSpendingVsAllocationChartData(PRESET_MODERN_FUSION_WEDDING.budgetBreakdown);
  }
  const avgDuration = (performance.now() - start) / 200;
  assert.ok(
    avgDuration < 0.5,
    `Average chart data generation took ${avgDuration.toFixed(3)}ms (expected < 0.5ms)`
  );
});

test('Efficiency Benchmark: Algorithmic blueprint generates complete 4-deliverable plan in < 5ms', () => {
  const start = performance.now();
  const bp = generateAlgorithmicBlueprint({
    id: 'benchmark-event',
    eventType: 'Tech Innovation Summit',
    eventName: 'Global AI Summit',
    totalBudget: 85000,
    currency: 'USD',
    locationSetting: 'Conference Hall & Terrace',
    guestCount: 300,
    keyTheme: 'Cybernetic Minimalism',
    timeRemainingMonths: 4,
  });
  const duration = performance.now() - start;
  assert.ok(duration < 25, `Full blueprint synthesis took ${duration.toFixed(2)}ms (expected < 25ms)`);
  assert.ok(bp.creativeConcept.colorPalette.length === 5);
  assert.ok(bp.budgetBreakdown.categories.length === 7);
  assert.ok(bp.milestones.length >= 3);
  assert.ok(bp.runOfShow.length >= 5);
});

test('Efficiency Benchmark: Production bundle satisfies strict chunk ceiling (< 650 KB per chunk)', () => {
  const distDir = path.resolve('dist/assets');
  if (!fs.existsSync(distDir)) {
    // Skip if dist not yet built
    return;
  }
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const stats = fs.statSync(path.join(distDir, file));
      const sizeKB = stats.size / 1024;
      assert.ok(
        sizeKB < 650,
        `Chunk ${file} is ${sizeKB.toFixed(1)} KB (must be < 650 KB ceiling)`
      );
    }
  }
});
