import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Printer,
  Edit3,
  DollarSign,
  Users,
  MapPin,
  Clock,
  LogOut,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { ProjectDashboard } from './ProjectDashboard.tsx';
import { DeliverableConcept } from './DeliverableConcept.tsx';
import { DeliverableBudget } from './DeliverableBudget.tsx';
import { DeliverableTimeline } from './DeliverableTimeline.tsx';
import { DeliverableVendors } from './DeliverableVendors.tsx';
import { StudioSidebar, type WorkspaceTabId } from './StudioSidebar.tsx';
import { ExportHandoverSection } from './ExportHandoverSection.tsx';
import { CreateEventWizardModal } from './CreateEventWizardModal.tsx';
import { EventConstraintFormModal } from './EventConstraintFormModal.tsx';
import { ExportModal } from './ExportModal.tsx';
import type { EventBlueprint, EventConstraints, BudgetBreakdown } from '../types/blueprint.ts';
import type { AuthUser } from '../types/auth.ts';
import {
  PRESET_BLUEPRINTS,
  generateAlgorithmicBlueprint,
  formatCurrency,
} from '../utils/blueprintEngine.ts';

interface AppWorkspaceProps {
  user: AuthUser;
  onLogout: () => void;
  initialPresetId?: string | null;
}

export const AppWorkspace: React.FC<AppWorkspaceProps> = ({
  user,
  onLogout,
  initialPresetId,
}) => {
  // Portfolio of active events in the workspace
  const [portfolioMap, setPortfolioMap] = useState<Record<string, EventBlueprint>>(() => ({
    'preset-fusion-wedding': structuredClone(PRESET_BLUEPRINTS['preset-fusion-wedding']),
    'preset-30th-birthday': structuredClone(PRESET_BLUEPRINTS['preset-30th-birthday']),
    'preset-tech-gala': structuredClone(PRESET_BLUEPRINTS['preset-tech-gala']),
  }));

  const defaultBlueprintId =
    initialPresetId && PRESET_BLUEPRINTS[initialPresetId]
      ? initialPresetId
      : 'preset-fusion-wedding';

  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(
    () => portfolioMap[defaultBlueprintId] || PRESET_BLUEPRINTS['preset-fusion-wedding']
  );

  // 4-Tab state: Tab 1 (Overview & Concept), Tab 2 (Budget Calculator), Tab 3 (Day-of Timeline), Tab 4 (Vendor Kit)
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('tab-concept');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [, setActivePresetId] = useState<string | null>(defaultBlueprintId);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('preset');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const portfolioList = useMemo(() => Object.values(portfolioMap), [portfolioMap]);
  const dashboardActiveBlueprint =
    blueprint || portfolioList[0] || PRESET_BLUEPRINTS['preset-fusion-wedding'];

  const handleSelectTab = (tabId: WorkspaceTabId) => {
    if (!blueprint) {
      setBlueprint(dashboardActiveBlueprint);
    }
    setActiveTab(tabId);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Map dashboard navigation actions to the 4 tabs
  const handleNavigateSection = (sectionId: string) => {
    if (!blueprint) {
      setBlueprint(dashboardActiveBlueprint);
    }
    if (sectionId === 'section-budget') {
      handleSelectTab('tab-budget');
    } else if (sectionId === 'section-timeline') {
      handleSelectTab('tab-timeline');
    } else if (sectionId === 'section-vendors') {
      handleSelectTab('tab-vendors');
    } else {
      handleSelectTab('tab-concept');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 40);
    }
  };

  // Switch to a preset or portfolio event by ID
  const handleSelectPreset = (presetId: string) => {
    const selected = portfolioMap[presetId] || PRESET_BLUEPRINTS[presetId];
    if (selected) {
      setBlueprint(selected);
      setActivePresetId(presetId);
      setGenerationSource('preset');
    }
  };

  // Handle custom blueprint generation from wizard or modal
  const handleCreateBlueprint = async (constraints: EventConstraints, useAI: boolean) => {
    if (useAI) {
      setIsLoadingAI(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const res = await fetch('/api/generate-blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(constraints),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.blueprint) {
            const createdBp: EventBlueprint = data.blueprint;
            setBlueprint(createdBp);
            setPortfolioMap((prev) => ({
              ...prev,
              [createdBp.constraints.id]: createdBp,
            }));
            setActivePresetId(createdBp.constraints.id);
            setGenerationSource(data.source || 'gemini-3.8-flash');
            setIsWizardOpen(false);
            setIsEditModalOpen(false);
            setActiveTab('tab-concept');
            return;
          }
        }
      } catch (err) {
        console.error('Server-side AI synthesis timeout or error, utilizing algorithmic engine:', err);
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingAI(false);
      }
    }

    const generated = generateAlgorithmicBlueprint(constraints);
    setBlueprint(generated);
    setPortfolioMap((prev) => ({
      ...prev,
      [generated.constraints.id]: generated,
    }));
    setActivePresetId(generated.constraints.id);
    setGenerationSource('algorithmic-dynamic');
    setIsWizardOpen(false);
    setIsEditModalOpen(false);
    setActiveTab('tab-concept');
  };

  const handleUpdateBudget = (updated: BudgetBreakdown) => {
    setBlueprint((prev) => {
      const target = prev || dashboardActiveBlueprint;
      const nextBp: EventBlueprint = {
        ...target,
        budgetBreakdown: updated,
      };
      setPortfolioMap((map) => ({
        ...map,
        [nextBp.constraints.id]: nextBp,
      }));
      return nextBp;
    });
  };

  const handleToggleTask = (phaseId: string, taskId: string) => {
    setBlueprint((prev) => {
      const target = prev || dashboardActiveBlueprint;
      const updatedMilestones = target.milestones.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, completed: !task.completed };
              }
              return task;
            }),
          };
        }
        return phase;
      });
      const nextBp: EventBlueprint = { ...target, milestones: updatedMilestones };
      setPortfolioMap((map) => ({
        ...map,
        [nextBp.constraints.id]: nextBp,
      }));
      return nextBp;
    });
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-950 text-stone-100 flex font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Left Column: Persistent Vertical Left Sidebar */}
      <StudioSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNewEvent={() => setIsWizardOpen(true)}
        onOpenExport={() => {
          if (blueprint) {
            setIsExportModalOpen(true);
          } else {
            setIsWizardOpen(true);
          }
        }}
        selectedRole={selectedRole}
        onSelectRole={(role) => setSelectedRole(role)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        eventSummary={
          blueprint
            ? {
                title: blueprint.constraints.eventName || blueprint.constraints.eventType,
                type: blueprint.constraints.eventType,
                guestCount: blueprint.constraints.guestCount,
                totalBudget: blueprint.budgetBreakdown.totalBudget,
                currency: blueprint.budgetBreakdown.currency,
                runOfShowCount: blueprint.runOfShow.length,
                tasksDone: blueprint.milestones
                  .flatMap((m) => m.tasks)
                  .filter((t) => t.completed).length,
                totalTasks: blueprint.milestones.flatMap((m) => m.tasks).length,
              }
            : null
        }
      />

      {/* Right Column: Main Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-w-0 overflow-y-auto flex flex-col"
      >
        {/* Clean Top Header Bar: Event Title Indicator, Archetype Preset Dropdown, and Profile Indicator */}
        <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-10">
            {/* Left: Active Event Title Indicator */}
            <div className="flex items-center gap-3 min-w-0">
              {blueprint ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm font-semibold text-zinc-100 truncate">
                    {blueprint.constraints.eventName || blueprint.constraints.eventType}
                  </span>
                  <span className="hidden sm:inline text-zinc-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="hidden sm:inline text-xs text-zinc-400 font-mono tabular-nums whitespace-nowrap">
                    {formatCurrency(
                      blueprint.budgetBreakdown.totalBudget,
                      blueprint.budgetBreakdown.currency
                    )}{' '}
                    · {blueprint.constraints.guestCount} guests
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-zinc-400 truncate">
                  Portfolio Dashboard View
                </span>
              )}
            </div>

            {/* Right: Archetype Preset Dropdown & Profile Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Archetype Presets Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/20 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Archetype Presets</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {showPresetDropdown && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl z-50">
                    <span className="text-[11px] font-medium text-zinc-400 px-3 py-1.5 block">
                      Curated Master Archetypes
                    </span>
                    <button
                      onClick={() => {
                        handleSelectPreset('preset-fusion-wedding');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs"
                    >
                      <div className="font-semibold text-zinc-100">Modern Fusion Wedding</div>
                      <div className="text-[11px] text-zinc-400 font-mono tabular-nums">
                        $45,000 · 150 guests · Lawn & Banquet
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleSelectPreset('preset-30th-birthday');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs"
                    >
                      <div className="font-semibold text-zinc-100">30th Birthday Celebration</div>
                      <div className="text-[11px] text-zinc-400 font-mono tabular-nums">
                        $12,000 · 60 guests · Urban Loft
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleSelectPreset('preset-tech-gala');
                        setShowPresetDropdown(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs"
                    >
                      <div className="font-semibold text-zinc-100">Tech Community Gala & Awards</div>
                      <div className="text-[11px] text-zinc-400 font-mono tabular-nums">
                        $35,000 · 250 guests · Pavilion
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile Indicator */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-white/20 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">
                    {user.avatarInitials}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[130px] truncate">
                    {user.name}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <span className="text-[11px] font-medium text-zinc-400 block truncate">
                        Signed in as
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-200 block truncate">
                        {user.email}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setBlueprint(null);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                      <span>Reset to Empty Canvas</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out & Back to Landing</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 lg:px-10 py-8 pb-24">
          {!blueprint ? (
            /* Elegant Blank Slate / Onboarding Screen */
            <div className="py-6 animate-fade-in">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 sm:p-14 text-center relative overflow-hidden">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-normal text-stone-100 max-w-2xl mx-auto leading-tight">
                  PlanIQ Master Orchestration Studio
                </h1>

                <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
                  Synthesize an airtight event strategy, dynamic 7-pillar budget, and day-of execution timeline.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Primary Action */}
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>+ Create New Event Blueprint</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Secondary Action */}
                  <button
                    onClick={() => handleSelectPreset('preset-fusion-wedding')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/80 px-5 py-3 text-xs font-semibold text-stone-200 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <span>Load Demo Sample (Modern Fusion Wedding)</span>
                  </button>
                </div>

                {/* Quick 1-Click Archetype Samples for Weddings, Birthdays & Community Events */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
                  <span>Or explore curated blueprints:</span>
                  <button
                    onClick={() => handleSelectPreset('preset-fusion-wedding')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    Wedding ($45k · 150 guests)
                  </button>
                  <button
                    onClick={() => handleSelectPreset('preset-30th-birthday')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    30th Birthday ($12k · 60 guests)
                  </button>
                  <button
                    onClick={() => handleSelectPreset('preset-tech-gala')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    Community Gala ($35k · 250 guests)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* TAB 1: Overview & Concept (Project Dashboard Summary Cards + Executive Overview + Theme & Colors) */}
              {activeTab === 'tab-concept' && (
                <div role="tabpanel" aria-label="Tab 1: Overview & Concept" className="space-y-10">
                  {/* Project Dashboard View: Active Events, Upcoming Deadlines & Budget Utilization Summary Cards */}
                  <ProjectDashboard
                    portfolio={portfolioList}
                    activeBlueprint={blueprint}
                    onSelectBlueprint={(blueprintId) => handleSelectPreset(blueprintId)}
                    onNavigateSection={handleNavigateSection}
                    onToggleTask={handleToggleTask}
                    onNewEvent={() => setIsWizardOpen(true)}
                  />

                  {/* Active Event Executive Overview Banner */}
                  <div
                    id="section-overview"
                    className="scroll-mt-24 relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8"
                  >
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2">
                          <span className="text-amber-400 font-semibold">
                            Executive Summary
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Revision {blueprint.version}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {generationSource === 'gemini-3.8-flash'
                              ? 'AI-Synthesized Blueprint'
                              : generationSource === 'algorithmic-dynamic'
                              ? 'Dynamic Algorithmic Blueprint'
                              : 'Curated Master Blueprint'}
                          </span>
                        </div>

                        <h1 className="font-serif-title text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
                          {blueprint.constraints.eventName || blueprint.constraints.eventType}
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-300">
                          Typology:{' '}
                          <strong className="text-zinc-100 font-semibold">
                            {blueprint.constraints.eventType}
                          </strong>{' '}
                          · Setting:{' '}
                          <strong className="text-zinc-100 font-semibold">
                            {blueprint.constraints.locationSetting}
                          </strong>{' '}
                          · Theme:{' '}
                          <strong className="text-zinc-100 font-semibold">
                            {blueprint.constraints.keyTheme}
                          </strong>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Edit Constraints</span>
                        </button>
                        <button
                          onClick={() => setIsExportModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Export Binder & ICS</span>
                        </button>
                      </div>
                    </div>

                    {/* High-Contrast Quick Metrics Strip */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
                      <div className="rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Total Budget</span>
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
                          {formatCurrency(
                            blueprint.budgetBreakdown.totalBudget,
                            blueprint.budgetBreakdown.currency
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                          {formatCurrency(
                            blueprint.budgetBreakdown.perGuestCost,
                            blueprint.budgetBreakdown.currency
                          )}{' '}
                          / guest
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <Users className="h-3.5 w-3.5 text-amber-400" />
                          <span>Guest Count</span>
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
                          {blueprint.constraints.guestCount} Guests
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          Confirmed headcount
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Setting & Venue</span>
                        </div>
                        <div className="font-semibold text-zinc-100 truncate text-xs sm:text-sm">
                          {blueprint.constraints.locationSetting}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Spatial environment</div>
                      </div>

                      <div className="rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-purple-400" />
                          <span>Planning Horizon</span>
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
                          {blueprint.constraints.timeRemainingMonths} Months
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Execution window</div>
                      </div>

                      <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Readiness</span>
                        </div>
                        <div className="font-mono text-base sm:text-lg font-bold text-zinc-100 tabular-nums">
                          {
                            blueprint.milestones
                              .flatMap((m) => m.tasks)
                              .filter((t) => t.completed).length
                          }{' '}
                          / {blueprint.milestones.flatMap((m) => m.tasks).length} Tasks
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                          {blueprint.runOfShow.length} schedule blocks
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme & Colors Concept Module */}
                  <div id="section-concept" className="scroll-mt-24">
                    <DeliverableConcept
                      concept={blueprint.creativeConcept}
                      eventType={blueprint.constraints.eventType}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Budget Calculator (Only Financial Breakdown & Sliders) */}
              {activeTab === 'tab-budget' && (
                <div role="tabpanel" aria-label="Tab 2: Budget Calculator" id="section-budget">
                  <DeliverableBudget
                    budget={blueprint.budgetBreakdown}
                    onUpdateBudget={handleUpdateBudget}
                    guestCount={blueprint.constraints.guestCount}
                  />
                </div>
              )}

              {/* TAB 3: Day-of Timeline (Only Milestones & Run-of-Show Schedule) */}
              {activeTab === 'tab-timeline' && (
                <div role="tabpanel" aria-label="Tab 3: Day-of Timeline" id="section-timeline">
                  <DeliverableTimeline
                    milestones={blueprint.milestones}
                    runOfShow={blueprint.runOfShow}
                    onToggleTask={handleToggleTask}
                    selectedRole={selectedRole}
                    onSelectRole={(role) => setSelectedRole(role)}
                  />
                </div>
              )}

              {/* TAB 4: Vendor Kit (Only Contracts, Scopes of Work & Vetting Questions + Handover Export) */}
              {activeTab === 'tab-vendors' && (
                <div role="tabpanel" aria-label="Tab 4: Vendor Kit" id="section-vendors" className="space-y-12">
                  <DeliverableVendors
                    vettingKit={blueprint.vendorVettingKit}
                    currency={blueprint.budgetBreakdown.currency}
                  />

                  <div id="section-export">
                    <ExportHandoverSection
                      blueprint={blueprint}
                      onOpenFullExportModal={() => setIsExportModalOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Quiet Footer inside Scrollable Content Area */}
        <footer className="border-t border-white/10 bg-zinc-950 py-6 text-xs text-zinc-500 mt-auto">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif-title text-zinc-300 text-sm">PlanIQ Studio</span>
              <span aria-hidden="true">·</span>
              <span>Authenticated Session ({user.email})</span>
            </div>
            <button
              onClick={onLogout}
              className="text-zinc-400 hover:text-amber-400 transition-colors"
            >
              Sign Out & Return to Landing
            </button>
          </div>
        </footer>
      </div>

      {/* 4-Step Interactive Creation Wizard */}
      <CreateEventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateBlueprint}
        isLoadingAI={isLoadingAI}
        initialPresetToLoad={(presetId) => handleSelectPreset(presetId)}
      />

      {/* Edit Constraints Modal */}
      {blueprint && (
        <EventConstraintFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleCreateBlueprint}
          initialConstraints={blueprint.constraints}
          isLoadingAI={isLoadingAI}
        />
      )}

      {/* Export & Binder Handover Modal */}
      {blueprint && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          blueprint={blueprint}
        />
      )}
    </div>
  );
};
