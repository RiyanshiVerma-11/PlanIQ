import React from 'react';
import { Sparkles, Printer, PlusCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenExportModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveBlueprint: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenExportModal,
  setActiveTab,
  hasActiveBlueprint,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-stone-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-serif-title tracking-normal text-xl">PlanIQ Studio</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {hasActiveBlueprint && (
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-stone-200 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
              title="Print Run-of-Show or Export Blueprint"
            >
              <Printer className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export & Print</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-amber-400 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sm:hidden">Generate</span>
            <span className="hidden sm:inline">Generate Blueprint</span>
          </button>
        </div>
      </div>
    </header>
  );
};
