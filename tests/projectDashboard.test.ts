import test from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizePortfolioMetrics,
  extractUpcomingDeadlines,
  summarizeBudgetUtilization,
  buildSpendingVsAllocationChartData,
} from '../src/utils/dashboardMetrics.ts';
import {
  PRESET_MODERN_FUSION_WEDDING,
  PRESET_30TH_BIRTHDAY,
  PRESET_TECH_GALA,
} from '../src/utils/blueprintEngine.ts';

test('summarizePortfolioMetrics aggregates active events, guests, deadlines, and budget utilization accurately', () => {
  const portfolio = [
    PRESET_MODERN_FUSION_WEDDING,
    PRESET_30TH_BIRTHDAY,
    PRESET_TECH_GALA,
  ];

  const summary = summarizePortfolioMetrics(portfolio, PRESET_MODERN_FUSION_WEDDING);

  assert.equal(summary.activeEventCount, 3);
  assert.equal(summary.totalGuestsAcrossPortfolio, 150 + 60 + 250);
  assert.equal(summary.activeBudgetTotal, 45000);
  assert.equal(summary.activeCurrency, 'USD');
  assert.equal(summary.allocationSumPercent, 100);
  assert.equal(summary.committedUtilizationPercent + summary.contingencyPercent, 100);
  assert.equal(summary.committedBudgetAmount + summary.contingencyReserveAmount, 45000);
  assert.ok(summary.totalTasks > 0);
  assert.equal(summary.completedTasks + summary.pendingTasks, summary.totalTasks);
  assert.equal(summary.vendorCategoriesCount, 4);
});

test('extractUpcomingDeadlines sorts uncompleted critical tasks ahead of completed tasks and supports priority filtering', () => {
  const allDeadlines = extractUpcomingDeadlines(PRESET_MODERN_FUSION_WEDDING, 'All');
  assert.ok(allDeadlines.length > 0);

  // First item should be uncompleted
  const firstUncompletedIdx = allDeadlines.findIndex((d) => !d.completed);
  const firstCompletedIdx = allDeadlines.findIndex((d) => d.completed);
  if (firstUncompletedIdx !== -1 && firstCompletedIdx !== -1) {
    assert.ok(
      firstUncompletedIdx < firstCompletedIdx,
      'Uncompleted tasks must appear before completed tasks'
    );
  }

  // Filter by Critical priority only
  const criticalOnly = extractUpcomingDeadlines(PRESET_MODERN_FUSION_WEDDING, 'Critical');
  assert.ok(criticalOnly.length > 0);
  for (const item of criticalOnly) {
    assert.equal(item.priority, 'Critical');
  }
});

test('summarizeBudgetUtilization computes 7-pillar breakdown, largest cost driver, and contingency split', () => {
  const util = summarizeBudgetUtilization(PRESET_MODERN_FUSION_WEDDING);

  assert.equal(util.totalBudget, 45000);
  assert.equal(util.totalAllocatedPercentage, 100);
  assert.equal(util.pillars.length, 7);
  assert.equal(util.committedAmount + util.contingencyAmount, 45000);
  assert.equal(util.committedPercentage + util.contingencyPercentage, 100);
  assert.equal(util.largestPillar.category, 'Food & Beverage');
  assert.equal(util.largestPillar.percentage, 34);
});

test('buildSpendingVsAllocationChartData produces Recharts bar chart dataset with spending vs allocation variance', () => {
  const cloned = structuredClone(PRESET_MODERN_FUSION_WEDDING.budgetBreakdown);
  // Add a custom line item to Venue & Facilities so actualSpend > allocatedAmount
  cloned.categories[0].lineItems = [
    ...(cloned.categories[0].lineItems || []),
    { name: 'Custom Tent Extension', estimatedCost: 1500, isCustom: true },
  ];

  const chartData = buildSpendingVsAllocationChartData(cloned);
  assert.equal(chartData.length, 7);
  assert.equal(chartData[0].allocatedAmount, 9900);
  assert.equal(chartData[0].actualSpend, 11400);
  assert.equal(chartData[0].variance, -1500);
  assert.equal(chartData[0].status, 'over');
});

