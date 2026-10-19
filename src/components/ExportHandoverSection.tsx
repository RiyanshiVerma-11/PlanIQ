import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  DollarSign,
  Palette,
  ExternalLink,
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import { generateMarkdown, generateICS, downloadBlob } from '../utils/exportHelpers.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

interface ExportHandoverSectionProps {
  blueprint: EventBlueprint;
  onOpenFullExportModal: () => void;
}

export const ExportHandoverSection: React.FC<ExportHandoverSectionProps> = ({
  blueprint,
  onOpenFullExportModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(blueprint);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadICS = () => {
    const icsContent = generateICS(blueprint);
    const filename = `run-of-show-${blueprint.constraints.eventType.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    downloadBlob(icsContent, filename, 'text/calendar;charset=utf-8');
    setDownloadSuccess('ICS Calendar exported successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown(blueprint);
    const filename = `event-blueprint-${blueprint.constraints.eventType.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    downloadBlob(md, filename, 'text/markdown;charset=utf-8');
    setDownloadSuccess('Markdown Dossier downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const { constraints, budgetBreakdown, milestones, runOfShow, vendorVettingKit } = blueprint;
  const allTasksCount = milestones.flatMap((m) => m.tasks).length;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
            <FileText className="h-4 w-4" />
            <span>Deliverables Handover · Executive Dossier</span>
          </div>
          <h2 className="font-serif-title text-2xl font-normal text-stone-100 mt-1">
            Export, Print & Calendar Handover
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-400">
            Distribute execution-grade outputs to coordinators, vendors, and clients across calendar, print, and markdown formats.
          </p>
        </div>

        <button
          onClick={onOpenFullExportModal}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/50 hover:text-white transition-colors self-start sm:self-auto shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
          <span>Launch Full Dossier Viewer</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {downloadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* 3 Core Handover Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Channel 1: Calendar Sync */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col justify-between hover:border-stone-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                RFC 5545
              </span>
            </div>
            <h3 className="text-sm font-bold text-stone-100">
              Apple & Google Calendar (.ICS)
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Export all {runOfShow.length} Day-of Run of Show schedule blocks directly into any smartphone or calendar app with designated roles, venues, and cues.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-800/80">
            <button
              onClick={handleDownloadICS}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .ICS Calendar Event</span>
            </button>
          </div>
        </div>

        {/* Channel 2: Print Binder */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col justify-between hover:border-stone-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Printer className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                Clipboard Ready
              </span>
            </div>
            <h3 className="text-sm font-bold text-stone-100">
              Day-of Physical Binder / PDF
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Dedicated print stylesheets format the entire schedule, budget pillars, and emergency vendor contacts cleanly for clipboards with zero text clipping.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-800/80">
            <button
              onClick={handlePrint}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-100 hover:bg-stone-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-amber-400" />
              <span>Print Day-of Binder</span>
            </button>
          </div>
        </div>

        {/* Channel 3: Markdown Dossier */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col justify-between hover:border-stone-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
                Notion & Docs
              </span>
            </div>
            <h3 className="text-sm font-bold text-stone-100">
              Structured Markdown Dossier
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
              Copy or download the complete blueprint as pure Markdown with markdown tables, bullet checkpoints, and clean headings ready to paste into Notion, Google Docs, or email.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2.5 text-xs font-semibold text-stone-100 hover:bg-stone-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center justify-center rounded-xl border border-stone-700 bg-stone-800 p-2.5 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Download .md file"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Executive Dossier Contents Summary Strip */}
      <div className="rounded-2xl border border-stone-800/90 bg-stone-900/30 p-5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-3 font-semibold">
          Included in Dossier Package ({blueprint.version})
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 p-3">
            <Palette className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-stone-200 font-medium block">Creative Concept</span>
              <span className="text-[10px] text-stone-400">5 swatches · 3 focal areas</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 p-3">
            <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-stone-200 font-medium block">7-Pillar Budget</span>
              <span className="text-[10px] text-stone-400">
                {formatCurrency(budgetBreakdown.totalBudget, budgetBreakdown.currency)} total
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 p-3">
            <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-stone-200 font-medium block">Operational Timeline</span>
              <span className="text-[10px] text-stone-400">
                {runOfShow.length} blocks · {allTasksCount} tasks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 p-3">
            <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-stone-200 font-medium block">Vendor Vetting Kit</span>
              <span className="text-[10px] text-stone-400">
                {vendorVettingKit.length} dossiers · Anti-fee checklist
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
