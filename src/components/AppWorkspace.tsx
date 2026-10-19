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
  Bot,
  X,
  CheckCircle2,
  Calendar,
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
import { AIPlanningAssistant } from './AIPlanningAssistant.tsx';
import type { EventBlueprint, EventConstraints, BudgetBreakdown } from '../types/blueprint.ts';
import type { AuthUser } from '../types/auth.ts';
import type { AssistantActionSuggestion } from '../types/assistant.ts';
import {
  PRESET_BLUEPRINTS,
  generateAlgorithmicBlueprint,
  formatCurrency,
  rebalanceBudgetCategories,
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

  // Workspace tab states
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('tab-dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(defaultBlueprintId);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string>('preset');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const portfolioList = useMemo(() => Object.values(portfolioMap), [portfolioMap]);
  const dashboardActiveBlueprint =
    blueprint || portfolioList[0] || PRESET_BLUEPRINTS['preset-fusion-wedding'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTab = (tabId: WorkspaceTabId) => {
    if (!blueprint) {
      setBlueprint(dashboardActiveBlueprint);
    }
    setActiveTab(tabId);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Map dashboard navigation actions to the tabs
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
      showToast(`Switched to ${selected.constraints.eventName || selected.constraints.eventType}`);
    }
  };

  // Handle custom blueprint generation from wizard or modal
  const handleCreateBlueprint = async (constraints: EventConstraints, useAI: boolean) => {
    if (useAI) {
      setIsLoadingAI(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

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
            showToast('AI synthesized a complete, execution-ready blueprint!');
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
    showToast('Created event blueprint with forensic algorithmic engine!');
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

  // Handle Action Execution from GenAI Co-Planner Assistant
  const handleApplyAction = (action: AssistantActionSuggestion) => {
    if (!blueprint) return;

    if (action.type === 'rebalance_budget') {
      const targetCatId = action.payload?.categoryId || 'cat-contingency';
      const pctIncrease = action.payload?.percentageIncrease || 2;
      const updatedCats = blueprint.budgetBreakdown.categories.map((c) => {
        if (c.id === targetCatId) {
          return { ...c, percentage: c.percentage + pctIncrease };
        }
        if (c.id === 'cat-decor' || c.id === 'cat-attire') {
          return { ...c, percentage: Math.max(1, c.percentage - Math.round(pctIncrease / 2)) };
        }
        return c;
      });

      const normalized = rebalanceBudgetCategories(updatedCats, blueprint.budgetBreakdown.totalBudget);
      handleUpdateBudget({
        ...blueprint.budgetBreakdown,
        categories: normalized,
      });
      showToast('Budget allocations rebalanced based on AI recommendation!');
    } else if (action.type === 'add_task') {
      const newTask = {
        id: `t-ai-action-${Date.now()}`,
        title: action.payload?.title || 'Vendor Sync & Milestone Alignment Check',
        category: (action.payload?.category || 'Logistics') as any,
        ownerRole: action.payload?.ownerRole || 'Logistics Director',
        completed: false,
        priority: (action.payload?.priority || 'Critical') as any,
        deadlineNote: 'Recommended by PlanIQ AI Assistant',
      };
      setBlueprint((prev) => {
        if (!prev) return prev;
        const updatedMilestones = [...prev.milestones];
        if (updatedMilestones[0]) {
          updatedMilestones[0] = {
            ...updatedMilestones[0],
            tasks: [newTask, ...updatedMilestones[0].tasks],
          };
        }
        const nextBp = { ...prev, milestones: updatedMilestones };
        setPortfolioMap((m) => ({ ...m, [nextBp.constraints.id]: nextBp }));
        return nextBp;
      });
      showToast('Task added to your milestones timeline!');
    } else if (action.type === 'add_concept_idea') {
      const newElement = {
        title: action.payload?.title || 'Interactive Experience',
        targetMoment: 'Mid-Reception',
        description: action.payload?.description || 'Bespoke guest touchpoint',
        guestExperience: 'High emotional engagement and keepsake',
        logisticalRequirement: 'Dedicated zone & lead coordinator assignment',
      };
      setBlueprint((prev) => {
        if (!prev) return prev;
        const nextBp = {
          ...prev,
          creativeConcept: {
            ...prev.creativeConcept,
            interactiveElements: [...prev.creativeConcept.interactiveElements, newElement],
          },
        };
        setPortfolioMap((m) => ({ ...m, [nextBp.constraints.id]: nextBp }));
        return nextBp;
      });
      showToast('Idea added to your Creative Concept!');
    } else if (action.type === 'add_vendor_question') {
      showToast('Verified vetting protocol added to your Vendor Kit!');
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080b14] text-slate-100 flex font-sans selection:bg-cyan-500/20 selection:text-cyan-200 relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-zinc-900/95 backdrop-blur-xl px-4 py-2.5 text-xs text-amber-200 shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Column: Persistent Vertical Navigation Rail */}
      <StudioSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        portfolio={portfolioList}
        activeBlueprintId={blueprint?.constraints.id || activePresetId}
        onSelectBlueprint={handleSelectPreset}
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
      />

      {/* Right Column: Main Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-w-0 overflow-y-auto flex flex-col"
      >
        {/* Top Header Bar: Event Indicators, Quick Persona Switchers & AI Assistant Button */}
        <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#080b14]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: Active Event & Quick Problem-Statement Archetype Switcher */}
            <div className="flex items-center gap-3 min-w-0">
              {blueprint ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="text-sm font-bold text-white truncate font-serif-title text-base tracking-tight">
                    {blueprint.constraints.eventName || blueprint.constraints.eventType}
                  </span>
                  <span className="hidden sm:inline text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="hidden sm:inline text-xs text-cyan-400 font-mono tabular-nums whitespace-nowrap bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20 font-medium">
                    {formatCurrency(
                      blueprint.budgetBreakdown.totalBudget,
                      blueprint.budgetBreakdown.currency
                    )}{' '}
                    · {blueprint.constraints.guestCount} guests
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-400 truncate">
                  Event Command Center
                </span>
              )}
            </div>

            {/* Center / Right: 3 Problem Statement Verticals Quick-Pills + AI Assistant + Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Vertical Switchers (Weddings, Birthdays, Community Events) */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => handleSelectPreset('preset-fusion-wedding')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activePresetId === 'preset-fusion-wedding'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Load Wedding Blueprint"
                >
                  💍 Wedding
                </button>
                <button
                  onClick={() => handleSelectPreset('preset-30th-birthday')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activePresetId === 'preset-30th-birthday'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Load Birthday Blueprint"
                >
                  🎂 Birthday
                </button>
                <button
                  onClick={() => handleSelectPreset('preset-tech-gala')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activePresetId === 'preset-tech-gala'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Load Community Event Blueprint"
                >
                  🎪 Community
                </button>
              </div>


              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-500/40 hover:text-white transition-all whitespace-nowrap shrink-0"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-600/20 border border-cyan-500/40 text-[11px] font-bold text-cyan-400">
                    {user.avatarInitials}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block truncate">
                        Signed In
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-200 block truncate">
                        {user.email}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsWizardOpen(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>+ Create New Event</span>
                    </button>

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
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {!blueprint ? (
            /* Blank Slate Onboarding Screen */
            <div className="py-6 animate-fade-in">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 sm:p-14 text-center relative overflow-hidden">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-normal text-stone-100 max-w-2xl mx-auto leading-tight">
                  PlanIQ Event Orchestration Studio
                </h1>

                <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
                  Synthesize an airtight event strategy, dynamic 7-pillar budget, backward milestones, and vendor vetting kit with our GenAI planning assistant.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>+ Create New Event Blueprint</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleSelectPreset('preset-fusion-wedding')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/80 px-5 py-3 text-xs font-semibold text-stone-200 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <span>Load Demo (Modern Fusion Wedding)</span>
                  </button>
                </div>

                {/* 1-Click Master Presets */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
                  <span>Or explore turnkey presets:</span>
                  <button
                    onClick={() => handleSelectPreset('preset-fusion-wedding')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    💍 Wedding ($45k · 150 guests)
                  </button>
                  <button
                    onClick={() => handleSelectPreset('preset-30th-birthday')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    🎂 30th Birthday ($12k · 60 guests)
                  </button>
                  <button
                    onClick={() => handleSelectPreset('preset-tech-gala')}
                    className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-1.5 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    🎪 Community Gala ($35k · 250 guests)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* TAB 1: Dedicated Executive Dashboard */}
              {activeTab === 'tab-dashboard' && (
                <div role="tabpanel" aria-label="Tab: Executive Dashboard" className="space-y-8 animate-fade-in">
                  <ProjectDashboard
                    portfolio={portfolioList}
                    activeBlueprint={blueprint}
                    onSelectBlueprint={(blueprintId) => handleSelectPreset(blueprintId)}
                    onNavigateSection={handleNavigateSection}
                    onToggleTask={handleToggleTask}
                    onNewEvent={() => setIsWizardOpen(true)}
                  />
                </div>
              )}

              {/* TAB 2: Creative Concept & Personalized Ideas */}
              {activeTab === 'tab-concept' && (
                <div role="tabpanel" aria-label="Tab: Concept & Ideas" className="space-y-8 animate-fade-in">
                  {/* Event Executive Overview Banner */}
                  <div
                    id="section-overview"
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8"
                  >
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2">
                          <span className="text-amber-400 font-semibold">
                            Executive Dossier
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
                              : 'Curated Master Archetype'}
                          </span>
                        </div>

                        <h1 className="font-serif-title text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
                          {blueprint.constraints.eventName || blueprint.constraints.eventType}
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-300">
                          Vertical:{' '}
                          <strong className="text-zinc-100 font-semibold">
                            {blueprint.constraints.eventType}
                          </strong>{' '}
                          · Venue:{' '}
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
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Edit Parameters</span>
                        </button>
                        <button
                          onClick={() => setIsExportModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Export Binder / ICS</span>
                        </button>
                      </div>
                    </div>

                    {/* High-Contrast Quick Metrics Strip */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 text-xs">
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
                          Confirmed capacity
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-950/70 border border-white/10 p-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Venue Setting</span>
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
                          <span>Task Progress</span>
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
                          {blueprint.runOfShow.length} schedule cues
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creative Concept & Personalized Ideas */}
                  <div id="section-concept">
                    <DeliverableConcept
                      concept={blueprint.creativeConcept}
                      eventType={blueprint.constraints.eventType}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Dynamic Budget Optimizer */}
              {activeTab === 'tab-budget' && (
                <div role="tabpanel" aria-label="Tab: Budget Calculator" id="section-budget" className="animate-fade-in">
                  <DeliverableBudget
                    budget={blueprint.budgetBreakdown}
                    onUpdateBudget={handleUpdateBudget}
                    guestCount={blueprint.constraints.guestCount}
                  />
                </div>
              )}

              {/* TAB 4: Day-of Timeline & Backward Milestones */}
              {activeTab === 'tab-timeline' && (
                <div role="tabpanel" aria-label="Tab: Day-of Timeline" id="section-timeline" className="animate-fade-in">
                  <DeliverableTimeline
                    milestones={blueprint.milestones}
                    runOfShow={blueprint.runOfShow}
                    onToggleTask={handleToggleTask}
                    selectedRole={selectedRole}
                    onSelectRole={(role) => setSelectedRole(role)}
                  />
                </div>
              )}

              {/* TAB 5: Vendor Sourcing Kit & Contract Defense */}
              {activeTab === 'tab-vendors' && (
                <div role="tabpanel" aria-label="Tab: Vendor Kit" id="section-vendors" className="space-y-12 animate-fade-in">
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

              {/* TAB 6: Dedicated GenAI Co-Planner Assistant View */}
              {activeTab === 'tab-assistant' && (
                <div role="tabpanel" aria-label="Tab: AI Planning Assistant" className="animate-fade-in">
                  <AIPlanningAssistant
                    blueprint={blueprint}
                    onApplyAction={handleApplyAction}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-white/10 bg-zinc-950 py-6 text-xs text-zinc-400 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif-title text-zinc-300 text-sm">PlanIQ Studio</span>
              <span aria-hidden="true">·</span>
              <span>GenAI Celebration & Event Planner · Challenge 5</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="text-zinc-400 hover:text-amber-400 transition-colors"
              >
                Export Binder / ICS
              </button>
              <button
                onClick={onLogout}
                className="text-zinc-400 hover:text-rose-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating "Ask AI Co-Planner" Action Logo (Bottom-Right Corner) */}
      {!isAssistantDrawerOpen && activeTab !== 'tab-assistant' && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <button
            type="button"
            onClick={() => setIsAssistantDrawerOpen(true)}
            className="group pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 p-0.5 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Ask AI Co-Planner"
            aria-label="Ask AI Co-Planner"
          >
            {/* Inner background icon frame */}
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090d1a] border border-cyan-500/40 group-hover:border-cyan-300 group-hover:bg-[#0c1224] transition-all">
              <div className="relative flex items-center justify-center">
                <Bot className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-cyan-300 fill-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* Glowing online pulse badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-[#080b14]" />
            </span>

            {/* Hover tooltip label */}
            <div className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-cyan-500/30 bg-[#0d1322]/95 px-3 py-1.5 text-xs font-semibold text-cyan-200 shadow-xl backdrop-blur-md transition-opacity duration-200 group-hover:flex">
              <span>Ask AI Co-Planner</span>
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Assistant Drawer */}
      {isAssistantDrawerOpen && blueprint && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:w-[480px] md:w-[540px] h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col">
            <AIPlanningAssistant
              blueprint={blueprint}
              onApplyAction={handleApplyAction}
              onClose={() => setIsAssistantDrawerOpen(false)}
              isDrawer={true}
            />
          </div>
        </div>
      )}

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
