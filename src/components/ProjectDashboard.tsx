import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Plus,
  Search,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';
import {
  summarizePortfolioMetrics,
  extractUpcomingDeadlines,
  summarizeBudgetUtilization,
} from '../utils/dashboardMetrics.ts';

interface ProjectDashboardProps {
  portfolio: EventBlueprint[];
  activeBlueprint: EventBlueprint;
  onSelectBlueprint: (blueprintId: string) => void;
  onNavigateSection: (sectionId: string) => void;
  onToggleTask: (phaseId: string, taskId: string) => void;
  onNewEvent: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  portfolio,
  activeBlueprint,
  onSelectBlueprint,
  onNavigateSection,
  onToggleTask,
  onNewEvent,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'wedding' | 'birthday' | 'gala'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const metrics = useMemo(
    () => summarizePortfolioMetrics(portfolio, activeBlueprint),
    [portfolio, activeBlueprint]
  );

  const deadlines = useMemo(
    () => extractUpcomingDeadlines(activeBlueprint, priorityFilter),
    [activeBlueprint, priorityFilter]
  );

  const budgetUtil = useMemo(
    () => summarizeBudgetUtilization(activeBlueprint),
    [activeBlueprint]
  );

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter((bp) => {
      const title = (bp.constraints.eventName || bp.constraints.eventType).toLowerCase();
      const type = bp.constraints.eventType.toLowerCase();
      const location = bp.constraints.locationSetting.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        title.includes(searchQuery.toLowerCase()) ||
        type.includes(searchQuery.toLowerCase()) ||
        location.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (eventTypeFilter === 'all') return true;
      if (eventTypeFilter === 'wedding') return type.includes('wedding');
      if (eventTypeFilter === 'birthday') return type.includes('birthday');
      if (eventTypeFilter === 'gala') {
        return (
          type.includes('gala') ||
          type.includes('community') ||
          type.includes('corporate') ||
          type.includes('summit')
        );
      }
      return true;
    });
  }, [portfolio, eventTypeFilter, searchQuery]);

  return (
    <section
      id="section-dashboard"
      aria-label="Project Dashboard Overview"
      className="scroll-mt-24 mb-10 space-y-8"
    >
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="font-medium text-zinc-300">Portfolio Overview</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{metrics.activeEventCount} Active Blueprints</span>
            <span aria-hidden="true">·</span>
            <span>Focused: {metrics.activeEventTitle}</span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Project Dashboard
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            High-level summary of active events, upcoming milestone and vendor deadlines, and real-time 7-pillar budget utilization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateSection('section-overview')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-zinc-200 hover:border-white/20 hover:bg-zinc-800/80 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <span>Executive Summary</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={onNewEvent}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Event Blueprint</span>
          </button>
        </div>
      </div>

      {/* Top Row: 4 Refined Glassmorphic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI Card 1: Active Events */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Active Events
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {metrics.activeEventCount} Blueprints
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
              {metrics.totalGuestsAcrossPortfolio.toLocaleString()} total confirmed guests
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-zinc-400 truncate max-w-[165px]">
              Focused: <strong className="text-zinc-200 font-medium">{metrics.activeEventTitle}</strong>
            </span>
            <span className="font-mono tabular-nums text-zinc-300 shrink-0">
              {activeBlueprint.constraints.timeRemainingMonths} mo window
            </span>
          </div>
        </div>

        {/* KPI Card 2: Upcoming Deadlines (with Mini Progress Bar) */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Upcoming Deadlines
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {metrics.pendingTasks} Pending
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
              {metrics.criticalPendingCount} critical · {metrics.completedTasks}/{metrics.totalTasks} tasks complete
            </p>

            {/* Mini Progress Bar Micro-Indicator */}
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-200 transition-all duration-200"
                  style={{ width: `${Math.max(4, metrics.completionPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="font-mono tabular-nums text-zinc-300">
              {metrics.completionPercentage}% readiness
            </span>
            <button
              type="button"
              onClick={() => onNavigateSection('section-timeline')}
              className="text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Day Schedule</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* KPI Card 3: Budget Utilization (with Clean Committed Percentage Indicator) */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Budget Utilization
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
                {formatCurrency(metrics.committedBudgetAmount, metrics.activeCurrency)}
              </div>
              <span className="bg-zinc-800 text-zinc-200 ring-1 ring-white/10 px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums shrink-0">
                {metrics.committedUtilizationPercent}% Committed
              </span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
              of {formatCurrency(metrics.activeBudgetTotal, metrics.activeCurrency)} total capex
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono tabular-nums">
              Reserve: {formatCurrency(metrics.contingencyReserveAmount, metrics.activeCurrency)} ({metrics.contingencyPercent}%)
            </span>
            <button
              type="button"
              onClick={() => onNavigateSection('section-budget')}
              className="text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Budget & Sliders</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* KPI Card 4: Unit Economics */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Unit Economics
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white font-mono tabular-nums">
              {formatCurrency(metrics.activePerGuestCost, metrics.activeCurrency)}
              <span className="text-sm font-normal text-zinc-400"> / guest</span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
              {metrics.vendorCategoriesCount} vendor pillars · {metrics.runOfShowBlocksCount} ROS blocks
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="font-mono tabular-nums text-zinc-400">
              Allocation: {metrics.allocationSumPercent}%
            </span>
            <button
              type="button"
              onClick={() => onNavigateSection('section-vendors')}
              className="text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Vendor Kit</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Events Portfolio Cards Section */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">
              Active Events Portfolio
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select any event card to load its complete blueprint dossier, budget sliders, and timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter active events..."
                aria-label="Filter active events"
                className="rounded-xl border border-white/10 bg-zinc-950/80 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-white/25 w-44 sm:w-52"
              />
            </div>

            {/* Interactive Category Filter Buttons (Sleek Subtle Pill Highlights) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/90 border border-white/10">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'wedding', label: 'Weddings' },
                  { id: 'birthday', label: 'Birthdays' },
                  { id: 'gala', label: 'Galas' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEventTypeFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    eventTypeFilter === tab.id
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPortfolio.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-zinc-400">
              No active events match your current filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setEventTypeFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Reset Event Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {filteredPortfolio.map((bp, idx) => {
              const isSelected = bp.constraints.id === activeBlueprint.constraints.id;
              const bpTasks = bp.milestones.flatMap((m) => m.tasks);
              const bpDone = bpTasks.filter((t) => t.completed).length;
              const bpPct = bpTasks.length > 0 ? Math.round((bpDone / bpTasks.length) * 100) : 0;
              const nextTask = bpTasks.find((t) => !t.completed);

              return (
                <div
                  key={bp.constraints.id}
                  className={`flex flex-col justify-between ${
                    idx > 0 ? 'pt-5 md:pt-0 md:pl-6' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 mb-1.5">
                      <span className="truncate">{bp.constraints.eventType}</span>
                      <span className="font-mono tabular-nums text-zinc-400 shrink-0">
                        {bp.constraints.timeRemainingMonths} mo out
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white truncate">
                      {bp.constraints.eventName || bp.constraints.eventType}
                    </h4>

                    <p className="mt-1 text-xs text-zinc-400 truncate">
                      {bp.constraints.locationSetting} · {bp.constraints.guestCount} guests
                    </p>

                    {/* Financial & Per-Guest Metrics */}
                    <div className="mt-3.5 flex items-baseline justify-between text-xs">
                      <span className="font-mono text-base font-semibold text-white tabular-nums">
                        {formatCurrency(bp.budgetBreakdown.totalBudget, bp.budgetBreakdown.currency)}
                      </span>
                      <span className="font-mono text-zinc-400 tabular-nums">
                        {formatCurrency(bp.budgetBreakdown.perGuestCost, bp.budgetBreakdown.currency)} / guest
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                        <span>Milestone Progress</span>
                        <span className="font-mono tabular-nums">
                          {bpDone}/{bpTasks.length} tasks ({bpPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-200 transition-all duration-200"
                          style={{ width: `${Math.max(4, bpPct)}%` }}
                        />
                      </div>
                    </div>

                    {nextTask && (
                      <p className="mt-2.5 text-[11px] text-zinc-400 truncate">
                        Next due: <span className="text-zinc-300">{nextTask.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectBlueprint(bp.constraints.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/10'
                      }`}
                    >
                      {isSelected ? 'Focused in Workbench' : 'Load Blueprint'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectBlueprint(bp.constraints.id);
                        onNavigateSection('section-budget');
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      Inspect Budget
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Split: Upcoming Deadlines Queue (Left 7 cols) & Current Budget Utilization Breakdown (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel: Upcoming Deadlines & Vendor Procurement Checkpoints */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Upcoming Deadlines & Critical Path
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click any milestone task to mark it complete or filter by priority level.
                </p>
              </div>

              {/* Priority Filter Segmented Control */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/90 border border-white/10 self-start sm:self-auto">
                {(['All', 'Critical', 'High', 'Medium'] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setPriorityFilter(prio)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      priorityFilter === prio
                        ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Queue List */}
            <div className="divide-y divide-white/10 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {deadlines.slice(0, 7).map((item) => (
                <div
                  key={`${item.phaseId}-${item.taskId}`}
                  className="py-3.5 flex items-start justify-between gap-3 group"
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(item.phaseId, item.taskId)}
                    className="flex items-start gap-3 text-left min-w-0 flex-1 focus-visible:outline-none"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-500 group-hover:text-zinc-200 shrink-0 mt-0.5 transition-colors" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium leading-snug ${
                          item.completed
                            ? 'line-through text-zinc-500'
                            : 'text-zinc-100 group-hover:text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                        <span className="font-mono tabular-nums text-zinc-300">
                          {item.timeframe}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.ownerRole}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.priority === 'Critical'
                              ? 'text-rose-400 font-semibold'
                              : item.priority === 'High'
                              ? 'text-amber-300 font-medium'
                              : 'text-zinc-400'
                          }
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                    </div>
                  </button>

                  {item.deadlineNote && (
                    <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono tabular-nums shrink-0">
                      {item.deadlineNote}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Lock-In Deadlines Footer */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-semibold text-zinc-300">
                Vendor Contract Lock-In Windows
              </span>
              <button
                type="button"
                onClick={() => onNavigateSection('section-timeline')}
                className="text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>Open Day Schedule ({activeBlueprint.runOfShow.length} blocks)</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {activeBlueprint.vendorVettingKit.map((vendor) => (
                <div key={vendor.id} className="text-left">
                  <div className="text-zinc-300 font-medium truncate">{vendor.category}</div>
                  <div className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                    Due: {vendor.bookingDeadline}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Current Budget Utilization & 7-Pillar Allocation */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Current Budget Utilization
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  7-pillar capital distribution for {metrics.activeEventTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('section-budget')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/20 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                <span>Adjust Sliders</span>
              </button>
            </div>

            {/* Committed vs Reserve Summary Bar */}
            <div className="mt-4 pb-4 border-b border-white/10">
              <div className="flex items-baseline justify-between text-xs mb-2">
                <span className="text-zinc-300 font-medium">
                  Committed Production vs. Contingency Buffer
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {budgetUtil.committedPercentage}% / {budgetUtil.contingencyPercentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 transition-all duration-200"
                  style={{ width: `${Math.min(100, budgetUtil.committedPercentage)}%` }}
                  title={`Committed Production: ${budgetUtil.committedPercentage}%`}
                />
                <div
                  className="h-full bg-zinc-400 transition-all duration-200"
                  style={{ width: `${Math.min(100, budgetUtil.contingencyPercentage)}%` }}
                  title={`Contingency Reserve: ${budgetUtil.contingencyPercentage}%`}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono tabular-nums">
                <span>
                  Committed: {formatCurrency(budgetUtil.committedAmount, budgetUtil.currency)}
                </span>
                <span>
                  Buffer: {formatCurrency(budgetUtil.contingencyAmount, budgetUtil.currency)}
                </span>
              </div>
            </div>

            {/* 7 Pillars List */}
            <div className="mt-4 space-y-3">
              {budgetUtil.pillars.map((pillar) => (
                <div key={pillar.id}>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-zinc-200 font-medium truncate pr-2">
                      {pillar.category}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                      <span className="text-zinc-400">{pillar.percentage}%</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(pillar.allocatedAmount, budgetUtil.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        pillar.isContingency ? 'bg-zinc-400' : 'bg-emerald-400/90'
                      }`}
                      style={{ width: `${Math.min(100, pillar.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Primary Driver:{' '}
              <strong className="text-zinc-200 font-medium">
                {budgetUtil.largestPillar.category} ({budgetUtil.largestPillar.percentage}%)
              </strong>
            </span>
            <span className="font-mono tabular-nums text-white font-semibold">
              Total: {formatCurrency(budgetUtil.totalBudget, budgetUtil.currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
