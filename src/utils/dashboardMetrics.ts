import type { EventBlueprint, CurrencyCode } from '../types/blueprint.ts';

export interface PortfolioSummaryMetrics {
  activeEventCount: number;
  totalGuestsAcrossPortfolio: number;
  activeEventTitle: string;
  activeBudgetTotal: number;
  activeCurrency: CurrencyCode;
  activePerGuestCost: number;
  committedBudgetAmount: number;
  contingencyReserveAmount: number;
  committedUtilizationPercent: number;
  contingencyPercent: number;
  allocationSumPercent: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  criticalPendingCount: number;
  completionPercentage: number;
  vendorCategoriesCount: number;
  runOfShowBlocksCount: number;
}

export interface UpcomingDeadlineItem {
  phaseId: string;
  taskId: string;
  timeframe: string;
  phase: string;
  title: string;
  category: string;
  ownerRole: string;
  priority: 'Critical' | 'High' | 'Medium';
  completed: boolean;
  deadlineNote?: string;
}

export interface BudgetUtilizationPillar {
  id: string;
  category: string;
  percentage: number;
  allocatedAmount: number;
  isContingency: boolean;
  optimizationTip: string;
  lineItemCount: number;
}

export interface BudgetUtilizationSummary {
  totalBudget: number;
  currency: CurrencyCode;
  perGuestCost: number;
  committedAmount: number;
  committedPercentage: number;
  contingencyAmount: number;
  contingencyPercentage: number;
  totalAllocatedPercentage: number;
  largestPillar: {
    category: string;
    percentage: number;
    allocatedAmount: number;
  };
  pillars: BudgetUtilizationPillar[];
}

export function summarizePortfolioMetrics(
  portfolio: EventBlueprint[],
  activeBlueprint: EventBlueprint
): PortfolioSummaryMetrics {
  const safePortfolio = portfolio.length > 0 ? portfolio : [activeBlueprint];
  const activeEventCount = safePortfolio.length;
  const totalGuestsAcrossPortfolio = safePortfolio.reduce(
    (sum, bp) => sum + (bp.constraints.guestCount || 0),
    0
  );

  const categories = activeBlueprint.budgetBreakdown.categories || [];
  const allocationSumPercent = categories.reduce((sum, c) => sum + c.percentage, 0);

  const contingencyCat = categories.find(
    (c) => c.id === 'contingency' || /contingency|reserve/i.test(c.category)
  );
  const contingencyPercent = contingencyCat ? contingencyCat.percentage : 5;
  const contingencyReserveAmount = contingencyCat
    ? contingencyCat.allocatedAmount
    : activeBlueprint.budgetBreakdown.contingencyReserve;

  const committedUtilizationPercent = Math.max(0, allocationSumPercent - contingencyPercent);
  const committedBudgetAmount = Math.max(
    0,
    activeBlueprint.budgetBreakdown.totalBudget - contingencyReserveAmount
  );

  const allTasks = activeBlueprint.milestones.flatMap((m) => m.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const criticalPendingCount = allTasks.filter(
    (t) => !t.completed && t.priority === 'Critical'
  ).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    activeEventCount,
    totalGuestsAcrossPortfolio,
    activeEventTitle:
      activeBlueprint.constraints.eventName || activeBlueprint.constraints.eventType,
    activeBudgetTotal: activeBlueprint.budgetBreakdown.totalBudget,
    activeCurrency: activeBlueprint.budgetBreakdown.currency,
    activePerGuestCost: activeBlueprint.budgetBreakdown.perGuestCost,
    committedBudgetAmount,
    contingencyReserveAmount,
    committedUtilizationPercent,
    contingencyPercent,
    allocationSumPercent,
    totalTasks,
    completedTasks,
    pendingTasks,
    criticalPendingCount,
    completionPercentage,
    vendorCategoriesCount: activeBlueprint.vendorVettingKit.length,
    runOfShowBlocksCount: activeBlueprint.runOfShow.length,
  };
}

export function extractUpcomingDeadlines(
  blueprint: EventBlueprint,
  priorityFilter: 'All' | 'Critical' | 'High' | 'Medium' = 'All'
): UpcomingDeadlineItem[] {
  const priorityRank: Record<'Critical' | 'High' | 'Medium', number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
  };

  const items: UpcomingDeadlineItem[] = [];

  for (const milestone of blueprint.milestones) {
    for (const task of milestone.tasks) {
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        continue;
      }
      items.push({
        phaseId: milestone.id,
        taskId: task.id,
        timeframe: milestone.timeframe,
        phase: milestone.phase,
        title: task.title,
        category: task.category,
        ownerRole: task.ownerRole,
        priority: task.priority,
        completed: task.completed,
        deadlineNote: task.deadlineNote,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}

export function summarizeBudgetUtilization(
  blueprint: EventBlueprint
): BudgetUtilizationSummary {
  const { totalBudget, currency, perGuestCost, categories } = blueprint.budgetBreakdown;

  const pillars: BudgetUtilizationPillar[] = categories.map((c) => {
    const isContingency =
      c.id === 'contingency' || /contingency|reserve/i.test(c.category);
    return {
      id: c.id,
      category: c.category,
      percentage: c.percentage,
      allocatedAmount: c.allocatedAmount,
      isContingency,
      optimizationTip: c.costOptimizationTips?.[0] || '',
      lineItemCount: c.lineItems?.length || 0,
    };
  });

  const totalAllocatedPercentage = pillars.reduce((sum, p) => sum + p.percentage, 0);
  const contingencyPillar = pillars.find((p) => p.isContingency);
  const contingencyAmount = contingencyPillar
    ? contingencyPillar.allocatedAmount
    : blueprint.budgetBreakdown.contingencyReserve;
  const contingencyPercentage = contingencyPillar ? contingencyPillar.percentage : 5;

  const committedAmount = Math.max(0, totalBudget - contingencyAmount);
  const committedPercentage = Math.max(0, totalAllocatedPercentage - contingencyPercentage);

  const sortedByShare = [...pillars].sort((a, b) => b.percentage - a.percentage);
  const top = sortedByShare[0] || {
    category: 'Venue & Facilities',
    percentage: 0,
    allocatedAmount: 0,
  };

  return {
    totalBudget,
    currency,
    perGuestCost,
    committedAmount,
    committedPercentage,
    contingencyAmount,
    contingencyPercentage,
    totalAllocatedPercentage,
    largestPillar: {
      category: top.category,
      percentage: top.percentage,
      allocatedAmount: top.allocatedAmount,
    },
    pillars,
  };
}

export interface SpendingVsAllocationDatum {
  id: string;
  category: string;
  shortLabel: string;
  percentage: number;
  allocatedAmount: number;
  actualSpend: number;
  variance: number;
  utilizationRatio: number;
  status: 'under' | 'matched' | 'over';
}

export function buildSpendingVsAllocationChartData(
  budget: EventBlueprint['budgetBreakdown']
): SpendingVsAllocationDatum[] {
  return budget.categories.map((cat) => {
    const hasLineItems = Array.isArray(cat.lineItems) && cat.lineItems.length > 0;
    const actualSpend = hasLineItems
      ? cat.lineItems!.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0)
      : cat.allocatedAmount;

    const variance = cat.allocatedAmount - actualSpend;
    const utilizationRatio =
      cat.allocatedAmount > 0 ? Math.round((actualSpend / cat.allocatedAmount) * 100) : 0;

    let status: 'under' | 'matched' | 'over' = 'matched';
    if (actualSpend > cat.allocatedAmount) {
      status = 'over';
    } else if (actualSpend < cat.allocatedAmount) {
      status = 'under';
    }

    const shortLabel = cat.category
      .replace('& Facilities', '')
      .replace('& Spatial Lighting', '')
      .replace('& Audio-Visual', '& AV')
      .replace('& Music', '')
      .replace(', Stationery & Favors', '')
      .replace('/Favors/Touchpoints', '')
      .replace('& Reserve', '')
      .trim();

    return {
      id: cat.id,
      category: cat.category,
      shortLabel,
      percentage: cat.percentage,
      allocatedAmount: cat.allocatedAmount,
      actualSpend,
      variance,
      utilizationRatio,
      status,
    };
  });
}

