import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  Plus,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Trash2,
  PieChart,
  BarChart3,
  Users,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { BudgetBreakdown } from '../types/blueprint.ts';
import { formatCurrency, calculateCategoryAmount } from '../utils/blueprintEngine.ts';
import {
  buildSpendingVsAllocationChartData,
  type SpendingVsAllocationDatum,
} from '../utils/dashboardMetrics.ts';

interface DeliverableBudgetProps {
  budget: BudgetBreakdown;
  onUpdateBudget: (updated: BudgetBreakdown) => void;
  guestCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  venue: '#F59E0B',         // Amber
  catering: '#10B981',      // Emerald
  fnb: '#10B981',           // Emerald
  decor: '#8B5CF6',         // Violet
  photography: '#06B6D4',   // Cyan
  photo_av: '#06B6D4',      // Cyan
  entertainment: '#EC4899', // Pink
  attire: '#F97316',        // Orange
  attire_favors: '#F97316', // Orange
  contingency: '#3B82F6',   // Blue
};

export const DeliverableBudget: React.FC<DeliverableBudgetProps> = ({
  budget,
  onUpdateBudget,
  guestCount,
}) => {
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState(budget.totalBudget.toString());
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>(
    budget.categories[0]?.id || 'venue'
  );
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCost, setCustomItemCost] = useState('');
  const [autoRebalance, setAutoRebalance] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const totalPercentage = budget.categories.reduce((acc, cat) => acc + cat.percentage, 0);
  const totalAllocated = budget.categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
  const perGuest = Math.round(budget.totalBudget / (guestCount || 1));

  // Build Recharts data comparing Itemized Spending vs. Allocation per category
  const chartData = useMemo(
    () => buildSpendingVsAllocationChartData(budget),
    [budget]
  );

  const totalActualSpend = useMemo(
    () => chartData.reduce((sum, d) => sum + d.actualSpend, 0),
    [chartData]
  );

  const overBudgetCount = useMemo(
    () => chartData.filter((d) => d.status === 'over').length,
    [chartData]
  );

  // Auto-rebalance all categories to sum exactly to 100%
  const handleRebalanceTo100 = () => {
    const rawSum = budget.categories.reduce((acc, c) => acc + c.percentage, 0);
    if (rawSum === 0) return;

    let runningSum = 0;
    const rebalanced = budget.categories.map((cat, idx) => {
      if (idx === budget.categories.length - 1) {
        const remaining = Math.max(1, 100 - runningSum);
        return {
          ...cat,
          percentage: remaining,
          allocatedAmount: calculateCategoryAmount(budget.totalBudget, remaining),
        };
      }
      const proportional = Math.max(1, Math.round((cat.percentage / rawSum) * 100));
      runningSum += proportional;
      return {
        ...cat,
        percentage: proportional,
        allocatedAmount: calculateCategoryAmount(budget.totalBudget, proportional),
      };
    });

    onUpdateBudget({
      ...budget,
      categories: rebalanced,
      contingencyReserve:
        rebalanced.find((c) => c.id === 'contingency')?.allocatedAmount ||
        Math.round(budget.totalBudget * 0.05),
    });
  };

  // Handle slider percentage changes
  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    const targetPct = Math.max(2, Math.min(60, newPercentage));
    const targetCat = budget.categories.find((c) => c.id === categoryId);
    if (!targetCat) return;

    if (!autoRebalance) {
      const updatedCategories = budget.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            percentage: targetPct,
            allocatedAmount: calculateCategoryAmount(budget.totalBudget, targetPct),
          };
        }
        return cat;
      });
      onUpdateBudget({
        ...budget,
        categories: updatedCategories,
      });
      return;
    }

    const otherCategories = budget.categories.filter((c) => c.id !== categoryId);
    const otherSum = otherCategories.reduce((acc, c) => acc + c.percentage, 0);
    const availableForOthers = 100 - targetPct;

    let allocatedToOthers = 0;
    const updatedOthers = otherCategories.map((cat, idx) => {
      if (idx === otherCategories.length - 1) {
        const finalPct = Math.max(1, availableForOthers - allocatedToOthers);
        return {
          ...cat,
          percentage: finalPct,
          allocatedAmount: calculateCategoryAmount(budget.totalBudget, finalPct),
        };
      }
      const weight = otherSum > 0 ? cat.percentage / otherSum : 1 / otherCategories.length;
      const calcPct = Math.max(1, Math.round(weight * availableForOthers));
      allocatedToOthers += calcPct;
      return {
        ...cat,
        percentage: calcPct,
        allocatedAmount: calculateCategoryAmount(budget.totalBudget, calcPct),
      };
    });

    const finalCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          percentage: targetPct,
          allocatedAmount: calculateCategoryAmount(budget.totalBudget, targetPct),
        };
      }
      return updatedOthers.find((o) => o.id === cat.id) || cat;
    });

    onUpdateBudget({
      ...budget,
      categories: finalCategories,
      contingencyReserve:
        finalCategories.find((c) => c.id === 'contingency')?.allocatedAmount ||
        Math.round(budget.totalBudget * 0.05),
    });
  };

  const handleSaveTotalBudget = () => {
    const newTotal = parseFloat(totalInput);
    if (!isNaN(newTotal) && newTotal > 0) {
      const updatedCategories = budget.categories.map((cat) => ({
        ...cat,
        allocatedAmount: calculateCategoryAmount(newTotal, cat.percentage),
      }));

      onUpdateBudget({
        ...budget,
        totalBudget: newTotal,
        categories: updatedCategories,
        perGuestCost: Math.round(newTotal / (guestCount || 1)),
        contingencyReserve:
          updatedCategories.find((c) => c.id === 'contingency')?.allocatedAmount ||
          Math.round(newTotal * 0.05),
      });
      setEditingTotal(false);
    }
  };

  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customItemCost);
    if (!customItemName || isNaN(cost) || cost <= 0) return;

    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === selectedCatId) {
        const existingItems = cat.lineItems || [];
        return {
          ...cat,
          lineItems: [
            ...existingItems,
            {
              name: customItemName,
              estimatedCost: cost,
              isCustom: true,
            },
          ],
        };
      }
      return cat;
    });

    onUpdateBudget({
      ...budget,
      categories: updatedCategories,
    });

    setCustomItemName('');
    setCustomItemCost('');
    setShowAddCustomModal(false);
  };

  const handleRemoveLineItem = (categoryId: string, itemIndex: number) => {
    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId && cat.lineItems) {
        const updatedItems = [...cat.lineItems];
        updatedItems.splice(itemIndex, 1);
        return {
          ...cat,
          lineItems: updatedItems,
        };
      }
      return cat;
    });

    onUpdateBudget({
      ...budget,
      categories: updatedCategories,
    });
  };

  // Compute Stacked Bar segments
  let cumulativePercent = 0;
  const donutSegments = budget.categories.map((cat) => {
    const startPct = cumulativePercent;
    cumulativePercent += cat.percentage;
    const endPct = cumulativePercent;
    const color = CATEGORY_COLORS[cat.id] || '#F59E0B';
    return {
      cat,
      color,
      startPct,
      endPct,
      percentage: cat.percentage,
    };
  });

  // Custom Tooltip for Recharts Bar Chart
  const renderCustomBarTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: SpendingVsAllocationDatum }>;
  }) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    const isOver = data.actualSpend > data.allocatedAmount;
    const diff = Math.abs(data.variance);

    return (
      <div className="rounded-xl border border-white/15 bg-zinc-950/95 p-3.5 shadow-2xl text-xs space-y-2 min-w-[230px]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
          <span className="font-semibold text-zinc-100">{data.category}</span>
          <span className="font-mono tabular-nums text-amber-400">
            {data.percentage}% Share
          </span>
        </div>

        <div className="space-y-1 font-mono tabular-nums">
          <div className="flex items-center justify-between text-zinc-300">
            <span>Target Allocation:</span>
            <span className="font-bold text-amber-400">
              {formatCurrency(data.allocatedAmount, budget.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Itemized Spending:</span>
            <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(data.actualSpend, budget.currency)}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono tabular-nums">
          <span className="text-zinc-400">Variance Status:</span>
          <span
            className={
              isOver
                ? 'text-rose-400 font-semibold'
                : data.variance > 0
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-300'
            }
          >
            {isOver
              ? `+${formatCurrency(diff, budget.currency)} Over Allocation`
              : data.variance > 0
              ? `${formatCurrency(diff, budget.currency)} Under Target`
              : 'On Target (100%)'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-8 relative">
      {/* 1. Bento KPI Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Budget */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-400">Total Event Budget</span>
            <button
              onClick={() => setEditingTotal(!editingTotal)}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs transition-colors"
            >
              {editingTotal ? 'Cancel' : 'Edit Target'}
            </button>
          </div>

          <div className="my-3">
            {editingTotal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={totalInput}
                  onChange={(e) => setTotalInput(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-1.5 text-base text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTotalBudget}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="font-mono text-3xl font-extrabold text-zinc-100 tracking-tight tabular-nums">
                {formatCurrency(budget.totalBudget, budget.currency)}
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Gross Capex Target</span>
            <span className="font-mono text-emerald-400 font-semibold">{budget.currency}</span>
          </div>
        </div>

        {/* Metric 2: Per-Guest Spend */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-400">Per-Guest Spend Ratio</span>
            <Users className="h-3.5 w-3.5 text-cyan-400" />
          </div>

          <div className="my-3">
            <div className="font-mono text-3xl font-extrabold text-cyan-300 tracking-tight tabular-nums">
              {formatCurrency(perGuest, budget.currency)}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Confirmed Guest Capacity</span>
            <span className="font-mono text-zinc-200 font-semibold tabular-nums">
              {guestCount} Guests
            </span>
          </div>
        </div>

        {/* Metric 3: Itemized Spend vs Allocated */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-400">Itemized Spend Total</span>
            <span className="font-mono text-[11px] text-emerald-400">
              {overBudgetCount === 0 ? 'Within Target' : `${overBudgetCount} Over Target`}
            </span>
          </div>

          <div className="my-3">
            <div className="font-mono text-3xl font-extrabold text-emerald-400 tracking-tight tabular-nums">
              {formatCurrency(totalActualSpend, budget.currency)}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Reserve Buffer</span>
            <span className="text-emerald-400 font-mono tabular-nums font-medium">
              {formatCurrency(budget.contingencyReserve, budget.currency)}
            </span>
          </div>
        </div>

        {/* Metric 4: Allocation Health */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-400">Allocation Balance</span>
            {totalPercentage === 100 ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Balanced
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-[11px] font-mono font-semibold">
                <AlertCircle className="h-3.5 w-3.5" /> {totalPercentage}% Total
              </span>
            )}
          </div>

          <div className="my-3">
            <div className="font-mono text-3xl font-extrabold text-zinc-100 tracking-tight tabular-nums">
              {formatCurrency(totalAllocated, budget.currency)}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Coverage Quality</span>
            <span
              className={
                totalPercentage === 100
                  ? 'text-emerald-400 font-medium'
                  : 'text-amber-400 font-medium'
              }
            >
              {totalPercentage === 100
                ? 'Zero Variance'
                : `${100 - totalPercentage}% Discrepancy`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Recharts Bar Chart: Spending vs. Allocation Across Expense Categories */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Spending vs. Target Allocation by Expense Category
              </h3>
              <p className="text-xs text-zinc-400">
                Compares target pillar allocations against itemized vendor quotes & custom line items ({budget.currency}).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" />
              <span>Target Allocation</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Itemized Spending (Within Target)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 inline-block" />
              <span>Over Allocation</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 16, left: 12, bottom: 20 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#A1A1AA', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#A1A1AA', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) =>
                  formatCurrency(value, budget.currency)
                }
                width={80}
              />
              <Tooltip
                content={renderCustomBarTooltip as any}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#D4D4D8' }}
              />
              <Bar
                dataKey="allocatedAmount"
                name="Allocated Budget"
                fill="#F59E0B"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
              <Bar
                dataKey="actualSpend"
                name="Itemized Spending"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.status === 'over' ? '#F43F5E' : '#10B981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Interactive Proportional Spectrum Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Visual Capital Distribution (7 Pillars)
              </h3>
              <p className="text-xs text-zinc-400">
                Live interactive allocation spectrum. Hover or drag sliders below to redistribute.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
            <span>7 Pillars · {totalPercentage}% Allocated</span>
          </div>
        </div>

        {/* Stacked Proportional Distribution Bar */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-zinc-950 overflow-hidden flex p-0.5 border border-white/10">
            {donutSegments.map((seg) => (
              <div
                key={seg.cat.id}
                onMouseEnter={() => setHoveredCategory(seg.cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="h-full transition-opacity duration-200 cursor-pointer relative group first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${Math.max(2, seg.percentage)}%`,
                  backgroundColor: seg.color,
                  opacity:
                    hoveredCategory && hoveredCategory !== seg.cat.id ? 0.55 : 1,
                }}
              />
            ))}
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
            {budget.categories.map((cat) => {
              const color = CATEGORY_COLORS[cat.id] || '#F59E0B';
              const isHovered = hoveredCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`rounded-xl p-2.5 border transition-colors duration-200 cursor-default ${
                    isHovered
                      ? 'bg-zinc-900 border-white/30'
                      : 'bg-zinc-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] font-bold text-zinc-200 truncate">
                      {cat.category.split(' ')[0]}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-extrabold text-zinc-100 tabular-nums">
                    {cat.percentage}%
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400 truncate mt-0.5 tabular-nums">
                    {formatCurrency(cat.allocatedAmount, budget.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. 7-Pillar Budget Breakdown Table with Sleek Sliders */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <DollarSign className="h-4 w-4" />
              <span>02. Dynamic Capital Allocation</span>
            </div>
            <h3 className="font-serif-title text-xl font-normal text-zinc-100 mt-1">
              7 Pillars of Event Spend & Cost-Saving Levers
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-rebalance toggle */}
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:border-white/20 transition-colors select-none">
              <input
                type="checkbox"
                checked={autoRebalance}
                onChange={(e) => setAutoRebalance(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-900 accent-amber-500"
              />
              <span className="font-semibold text-zinc-200">Auto-Rebalance to 100%</span>
            </label>

            {totalPercentage !== 100 && (
              <button
                onClick={handleRebalanceTo100}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Rebalance</span>
              </button>
            )}

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Add Custom Line Item</span>
            </button>
          </div>
        </div>

        {/* Real-time Allocation Deviation Warning Banner */}
        {totalPercentage !== 100 && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                <strong>Allocation Notice:</strong> Categories sum to{' '}
                <strong className="underline font-mono tabular-nums">{totalPercentage}%</strong> (
                {totalPercentage > 100
                  ? `+${totalPercentage - 100}% over allocated total`
                  : `${100 - totalPercentage}% unallocated`}
                ). Drag sliders or rebalance to reconcile to 100%.
              </span>
            </div>
            <button
              onClick={handleRebalanceTo100}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Auto-Rebalance to 100%</span>
            </button>
          </div>
        )}

        {/* Categories List Cards */}
        <div className="space-y-4">
          {budget.categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.id] || '#F59E0B';
            const catItemizedSum =
              cat.lineItems && cat.lineItems.length > 0
                ? cat.lineItems.reduce((s, li) => s + li.estimatedCost, 0)
                : cat.allocatedAmount;

            return (
              <div
                key={cat.id}
                className="group rounded-xl border border-white/10 bg-zinc-950/70 p-5 transition-colors duration-200 hover:border-white/20"
              >
                {/* Category Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <h4 className="text-base font-bold text-zinc-100">{cat.category}</h4>
                      <span className="font-mono text-xs font-semibold text-amber-400 tabular-nums">
                        · {cat.percentage}% Share
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {cat.description}
                    </p>
                  </div>

                  {/* Amount and Stylized Range Slider */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[300px] md:justify-end">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={cat.percentage}
                        onChange={(e) =>
                          handlePercentageChange(cat.id, parseInt(e.target.value, 10))
                        }
                        className="h-2 w-32 md:w-36 rounded-lg bg-zinc-800 accent-amber-500 cursor-pointer"
                        title={`Adjust ${cat.category} percentage`}
                      />
                      <span className="font-mono text-xs font-bold text-zinc-300 w-10 text-right tabular-nums">
                        {cat.percentage}%
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-lg font-extrabold text-zinc-100 tabular-nums">
                        {formatCurrency(cat.allocatedAmount, budget.currency)}
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-zinc-400">
                        Itemized: {formatCurrency(catItemizedSum, budget.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Optimization Tips (2 items per category) */}
                <div className="mt-4 pt-3.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-2">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Cost-Optimization Strategies (Quality Retained)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {cat.costOptimizationTips.map((tip, tipIdx) => (
                      <div
                        key={tipIdx}
                        className="rounded-lg bg-zinc-900/80 border border-white/5 p-2.5 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="text-emerald-400 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                          0{tipIdx + 1}
                        </span>
                        <span className="text-[11px]">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line Items if present */}
                {cat.lineItems && cat.lineItems.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/5">
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold block mb-2">
                      Itemized Quotes & Line Items
                    </span>
                    <div className="space-y-1.5">
                      {cat.lineItems.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-zinc-900/60 border border-white/5 text-zinc-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">·</span>
                            <span>{item.name}</span>
                            {item.isCustom && (
                              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold text-zinc-200 tabular-nums">
                              {formatCurrency(item.estimatedCost, budget.currency)}
                            </span>
                            {item.isCustom && (
                              <button
                                onClick={() => handleRemoveLineItem(cat.id, itemIdx)}
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                                title="Delete line item"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Expense Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-zinc-100">Add Custom Line Item</h4>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Add a specialized vendor quote or custom equipment line item into your blueprint.
            </p>

            <form onSubmit={handleAddCustomExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Pillar
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  {budget.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category} ({c.percentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Item Name / Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drone Videography Operator, Cold Spark Fountain"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Estimated Cost ({budget.currency})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="10"
                  placeholder="1200"
                  value={customItemCost}
                  onChange={(e) => setCustomItemCost(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 font-mono placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
