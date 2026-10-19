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
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

export type WorkspaceTabId = 'tab-concept' | 'tab-budget' | 'tab-timeline' | 'tab-vendors';

interface StudioSidebarProps {
  portfolio: EventBlueprint[];
  activeBlueprintId: string | null;
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

  return (
    <aside
      aria-label="PlanIQ Studio Utility Rail"
      className={`h-screen sticky top-0 z-40 shrink-0 bg-zinc-950/90 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between py-5 transition-all duration-200 ${
        isCollapsed ? 'w-16 px-2.5' : 'w-16 md:w-60 px-2.5 md:px-4'
      }`}
    >
      {/* Top: Brand Identity + Event Switcher Utility Rail */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between pb-5 mb-5 border-b border-white/10 ${
            isCollapsed ? 'flex-col gap-3' : 'flex-col md:flex-row gap-2'
          }`}
        >
          <button
            onClick={() => onSelectTab('tab-concept')}
            className="flex items-center gap-2.5 text-left text-zinc-100 hover:text-white transition-colors min-w-0"
            title="PlanIQ Studio"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-200 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="hidden md:flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-tight text-white leading-none truncate">
                  PlanIQ Studio
                </span>
                <span className="text-[11px] text-zinc-500 font-sans mt-1 truncate">
                  Event Command Rail
                </span>
              </div>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title={isCollapsed ? 'Expand utility rail' : 'Collapse utility rail'}
            aria-label={isCollapsed ? 'Expand utility rail' : 'Collapse utility rail'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Portfolio Event Switcher */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
          {!isCollapsed && (
            <div className="hidden md:flex items-center justify-between px-2 pb-1 text-[11px] uppercase tracking-wider font-medium text-zinc-500">
              <span>Event Switcher</span>
              <span className="font-mono tabular-nums text-zinc-500">{portfolio.length}</span>
            </div>
          )}

          <div className="space-y-1.5">
            {portfolio.map((bp) => {
              const id = bp.constraints.id;
              const title = bp.constraints.eventName || bp.constraints.eventType;
              const isSelected = id === activeBlueprintId;

              return (
                <div key={id} className="relative group">
                  <button
                    type="button"
                    onClick={() => onSelectBlueprint(id)}
                    className={`w-full flex items-center gap-2.5 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-center md:justify-start p-2.5 md:px-3 md:py-2.5'
                    } ${
                      isSelected
                        ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                    title={title}
                  >
                    <Layers
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="hidden md:flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-medium leading-snug truncate">
                            {title}
                          </span>
                          {isSelected && (
                            <Check className="h-3 w-3 text-zinc-300 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono tabular-nums truncate mt-0.5">
                          {formatCurrency(
                            bp.budgetBreakdown.totalBudget,
                            bp.budgetBreakdown.currency
                          )}{' '}
                          · {bp.constraints.guestCount}p
                        </span>
                      </div>
                    )}
                  </button>

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                      <div className="rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl px-3 py-1.5 text-xs text-zinc-100 whitespace-nowrap shadow-2xl">
                        {title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ROS Role Filter Control */}
          {!isCollapsed && (
            <div className="hidden md:block pt-5 mt-5 border-t border-white/10">
              <div className="px-1">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500 mb-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-zinc-400" />
                    ROS Role Filter
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={showRoleMenu}
                    aria-haspopup="listbox"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/70 backdrop-blur-md px-3 py-2 text-xs text-zinc-200 hover:border-white/20 hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                  >
                    <span className="truncate">{selectedRole}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${
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
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            selectedRole === role
                              ? 'bg-zinc-800 text-white font-medium ring-1 ring-white/10'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate">{role}</span>
                          {selectedRole === role && (
                            <Check className="h-3 w-3 text-zinc-300 shrink-0" />
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
      <div className="pt-4 border-t border-white/10 space-y-2 shrink-0">
        <button
          onClick={onNewEvent}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors shadow-sm ${
            isCollapsed ? 'p-2.5' : 'p-2.5 md:py-2.5 md:px-3.5'
          }`}
          title="+ New Blueprint"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="hidden md:inline whitespace-nowrap truncate">
              + New Blueprint
            </span>
          )}
        </button>

        <button
          onClick={onOpenExport}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors ${
            isCollapsed ? 'p-2.5' : 'p-2.5 md:py-2.5 md:px-3.5'
          }`}
          title="Export Binder & ICS"
        >
          <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
          {!isCollapsed && (
            <span className="hidden md:inline whitespace-nowrap truncate">
              Quick Export / ICS
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
