import React, { useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Plus,
  Layers,
  Check,
  LayoutDashboard,
  Palette,
  DollarSign,
  Clock,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

export type WorkspaceTabId =
  | 'tab-dashboard'
  | 'tab-concept'
  | 'tab-budget'
  | 'tab-timeline'
  | 'tab-vendors'
  | 'tab-assistant';

interface StudioSidebarProps {
  portfolio: EventBlueprint[];
  activeBlueprintId: string | null;
  activeTab: WorkspaceTabId;
  onSelectBlueprint: (blueprintId: string) => void;
  onSelectTab: (tabId: WorkspaceTabId) => void;
  onNewEvent: () => void;
  onOpenExport: () => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  portfolio,
  activeBlueprintId,
  activeTab,
  onSelectBlueprint,
  onSelectTab,
  onNewEvent,
  onOpenExport,
  selectedRole,
  onSelectRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const availableRoles = [
    'All Roles',
    'Logistics Director',
    'Master of Ceremonies',
    'Stage Manager',
    'Catering Lead',
    'Photo/Video Lead',
    'Event Host / VIP',
  ];

  const handleRoleSelect = (role: string) => {
    onSelectRole(role);
    setShowRoleMenu(false);
    onSelectTab('tab-timeline');
  };

  const navItems = [
    {
      id: 'tab-dashboard' as WorkspaceTabId,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Metrics',
    },
    {
      id: 'tab-concept' as WorkspaceTabId,
      label: 'Concept & Ideas',
      icon: Palette,
      badge: 'Theme',
    },
    {
      id: 'tab-budget' as WorkspaceTabId,
      label: 'Budget Optimizer',
      icon: DollarSign,
      badge: '7-Pillars',
    },
    {
      id: 'tab-timeline' as WorkspaceTabId,
      label: 'Timeline & ROS',
      icon: Clock,
      badge: 'Day-of',
    },
    {
      id: 'tab-vendors' as WorkspaceTabId,
      label: 'Vendor Checklists',
      icon: ShieldCheck,
      badge: 'Contracts',
    },
    {
      id: 'tab-assistant' as WorkspaceTabId,
      label: 'AI Co-Planner',
      icon: Bot,
      badge: 'GenAI',
      highlight: true,
    },
  ];

  return (
    <aside
      aria-label="PlanIQ Studio Navigation"
      className={`h-screen sticky top-0 z-40 shrink-0 bg-zinc-950/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between py-5 transition-all duration-200 ${
        isCollapsed ? 'w-16 px-2' : 'w-16 md:w-64 px-2.5 md:px-3.5'
      }`}
    >
      {/* Top: Brand Identity + Navigation Items */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between pb-4 mb-4 border-b border-white/10 ${
            isCollapsed ? 'flex-col gap-2' : 'flex-col md:flex-row gap-2'
          }`}
        >
          <button
            onClick={() => onSelectTab('tab-dashboard')}
            className="flex items-center gap-2.5 text-left text-zinc-100 hover:text-white transition-colors min-w-0"
            title="PlanIQ Studio Dashboard"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="hidden md:flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-tight text-white leading-none truncate font-serif-title">
                  PlanIQ Studio
                </span>
                <span className="text-[10px] text-amber-400 font-mono mt-1 truncate">
                  Master Event Planner
                </span>
              </div>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Primary Workspace Navigation Tabs */}
        <div className="space-y-1 mb-5">
          {!isCollapsed && (
            <div className="hidden md:block px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Workspace Views
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                  isCollapsed
                    ? 'justify-center p-2.5'
                    : 'justify-center md:justify-start p-2.5 md:px-3 md:py-2.5'
                } ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20'
                    : item.highlight
                    ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 border border-amber-500/20'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-zinc-950'
                      : item.highlight
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="hidden md:flex items-center justify-between flex-1 min-w-0">
                    <span className="text-xs truncate">{item.label}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-zinc-950/20 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Portfolio Event Switcher */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 border-t border-white/10 pt-4 custom-scrollbar">
          {!isCollapsed && (
            <div className="hidden md:flex items-center justify-between px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              <span>Active Events</span>
              <span className="font-mono tabular-nums text-zinc-400">{portfolio.length}</span>
            </div>
          )}

          <div className="space-y-1">
            {portfolio.map((bp) => {
              const id = bp.constraints.id;
              const title = bp.constraints.eventName || bp.constraints.eventType;
              const isSelected = id === activeBlueprintId;

              return (
                <div key={id} className="relative group">
                  <button
                    type="button"
                    onClick={() => onSelectBlueprint(id)}
                    className={`w-full flex items-center gap-2 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                      isCollapsed
                        ? 'justify-center p-2'
                        : 'justify-center md:justify-start p-2 md:px-2.5 md:py-2'
                    } ${
                      isSelected
                        ? 'bg-zinc-800 text-white font-medium ring-1 ring-white/15'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                    title={title}
                  >
                    <Layers
                      className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                        isSelected ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="hidden md:flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs truncate">{title}</span>
                          {isSelected && (
                            <Check className="h-3 w-3 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono tabular-nums truncate">
                          {formatCurrency(
                            bp.budgetBreakdown.totalBudget,
                            bp.budgetBreakdown.currency
                          )}{' '}
                          · {bp.constraints.guestCount} guests
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ROS Role Filter Control */}
          {!isCollapsed && (
            <div className="hidden md:block pt-4 mt-4 border-t border-white/10">
              <div className="px-1">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-zinc-400" />
                    Role Filter
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={showRoleMenu}
                    aria-haspopup="listbox"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-900 transition-colors"
                  >
                    <span className="truncate text-xs">{selectedRole}</span>
                    <ChevronRight
                      className={`h-3 w-3 text-zinc-400 transition-transform duration-150 ${
                        showRoleMenu ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showRoleMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-2xl z-50">
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full text-left px-2 py-1 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            selectedRole === role
                              ? 'bg-zinc-800 text-white font-medium ring-1 ring-white/10'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate">{role}</span>
                          {selectedRole === role && (
                            <Check className="h-3 w-3 text-amber-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Utility Actions: "+ New Blueprint" & "Quick Export" */}
      <div className="pt-3 border-t border-white/10 space-y-1.5 shrink-0">
        <button
          onClick={onNewEvent}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm ${
            isCollapsed ? 'p-2' : 'p-2 md:py-2 md:px-3'
          }`}
          title="+ New Event Blueprint"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && (
            <span className="hidden md:inline whitespace-nowrap truncate">
              + New Event Blueprint
            </span>
          )}
        </button>

        <button
          onClick={onOpenExport}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors ${
            isCollapsed ? 'p-2' : 'p-2 md:py-2 md:px-3'
          }`}
          title="Export Binder & ICS Calendar"
        >
          <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          {!isCollapsed && (
            <span className="hidden md:inline whitespace-nowrap truncate">
              Export Binder / ICS
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
