import React, { useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  DollarSign,
  Clock,
  ShieldCheck,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Plus,
} from 'lucide-react';
import type { CurrencyCode } from '../types/blueprint.ts';

export interface NavSectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StudioSidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onNewEvent: () => void;
  onOpenExport: () => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  eventSummary?: {
    title: string;
    type: string;
    guestCount: number;
    totalBudget: number;
    currency: CurrencyCode;
    runOfShowCount: number;
    tasksDone: number;
    totalTasks: number;
  } | null;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeSection,
  onNavigate,
  onNewEvent,
  onOpenExport,
  selectedRole,
  onSelectRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const sections: NavSectionItem[] = [
    {
      id: 'section-overview',
      label: 'Overview / Executive Summary',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'section-concept',
      label: '01. Concept & Palette',
      shortLabel: '01. Concept',
      icon: Palette,
    },
    {
      id: 'section-budget',
      label: '02. Dynamic Budget',
      shortLabel: '02. Budget',
      icon: DollarSign,
    },
    {
      id: 'section-timeline',
      label: '03. Milestones & Run-of-Show',
      shortLabel: '03. Milestones',
      icon: Clock,
    },
    {
      id: 'section-vendors',
      label: '04. Vendor Procurement & Vetting',
      shortLabel: '04. Vendors',
      icon: ShieldCheck,
    },
    {
      id: 'section-export',
      label: 'Export & Handover Dossier',
      shortLabel: 'Export Dossier',
      icon: FileText,
    },
  ];

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
    onNavigate('section-timeline');
  };

  return (
    <aside
      aria-label="PlanIQ Studio Sidebar Navigation"
      className={`h-screen sticky top-0 z-40 shrink-0 bg-zinc-950/80 backdrop-blur-md border-r border-white/10 flex flex-col justify-between py-6 transition-all duration-200 ${
        isCollapsed ? 'w-16 px-2' : 'w-16 md:w-64 px-2 md:px-4'
      }`}
    >
      {/* Top Section: App Brand Mark / Logo ("PlanIQ Studio") + Main Navigation */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Logo Header */}
        <div
          className={`flex items-center justify-between pb-6 mb-4 border-b border-white/10 ${
            isCollapsed ? ' flex-col gap-3' : 'flex-col md:flex-row gap-2'
          }`}
        >
          <button
            onClick={() => onNavigate('section-overview')}
            className="flex items-center gap-2.5 text-left text-stone-100 hover:text-amber-400 transition-colors min-w-0"
            title="PlanIQ Studio"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="hidden md:flex flex-col min-w-0">
                <span className="font-serif-title text-lg font-bold tracking-tight text-white leading-none truncate">
                  PlanIQ Studio
                </span>
                <span className="text-[11px] text-zinc-400 font-sans mt-1 truncate">
                  Blueprint Workbench
                </span>
              </div>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors shrink-0"
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

        {/* Main Vertical Navigation Stack */}
        <nav aria-label="Blueprint Deliverables Navigation" className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
          {!isCollapsed && (
            <div className="hidden md:block px-2.5 pb-1.5 text-[11px] font-medium text-zinc-500">
              Deliverables & Modules
            </div>
          )}

          {sections.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl text-left transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'justify-center md:justify-start p-2.5 md:px-3 md:py-2.5'
                  } ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent font-medium'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="hidden md:inline text-xs leading-snug truncate">
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Run-of-Show Role Filter Control inside Sidebar */}
          {!isCollapsed && (
            <div className="hidden md:block pt-4 mt-4 border-t border-white/10">
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                  <span className="font-medium flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-amber-400" />
                    ROS Role Filter
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={showRoleMenu}
                    aria-haspopup="listbox"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <span className="truncate">{selectedRole}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                        showRoleMenu ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showRoleMenu && (
                    <div className="absolute bottom-full left-0 mb-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl z-50">
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            selectedRole === role
                              ? 'bg-amber-500/20 text-amber-300 font-semibold'
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span className="truncate">{role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Actions: "+ New Event Blueprint" CTA & Quick Export / ICS Button */}
      <div className="pt-4 border-t border-white/10 space-y-2.5 shrink-0">
        {/* "+ New Event Blueprint" CTA button */}
        <button
          onClick={onNewEvent}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm ${
            isCollapsed ? 'p-2.5' : 'p-2.5 md:py-2.5 md:px-3.5'
          }`}
          title="+ New Event Blueprint"
        >
          <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
          {!isCollapsed && (
            <span className="hidden md:inline whitespace-nowrap truncate">
              + New Event Blueprint
            </span>
          )}
        </button>

        {/* Quick Export / ICS button */}
        <button
          onClick={onOpenExport}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/90 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors ${
            isCollapsed ? 'p-2.5' : 'p-2.5 md:py-2.5 md:px-3.5'
          }`}
          title="Quick Export / ICS"
        >
          <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
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
