import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Printer,
  FileText,
  Calendar,
  Download,
  Eye,
  Code,
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';
import { generateMarkdown, generateICS, downloadBlob } from '../utils/exportHelpers.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: EventBlueprint;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blueprint,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'formatted' | 'markdown'>('formatted');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { constraints, creativeConcept, budgetBreakdown, runOfShow, vendorVettingKit } =
    blueprint;

  const handleDownloadICS = () => {
    const icsContent = generateICS(blueprint);
    const safeName = constraints.eventType.replace(/[^a-zA-Z0-9]/g, '_');
    downloadBlob(icsContent, `${safeName}_Run_of_Show.ics`, 'text/calendar;charset=utf-8');
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown(blueprint);
    const safeName = constraints.eventType.replace(/[^a-zA-Z0-9]/g, '_');
    downloadBlob(md, `PlanIQ_${safeName}_Blueprint.md`, 'text/markdown;charset=utf-8');
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(blueprint);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-2xl border border-stone-800 bg-stone-900 p-6 md:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          aria-label="Close export dialog"
          className="absolute right-5 top-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
          title="Close export dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <FileText className="h-4 w-4" />
            <span>Export & Handover Suite</span>
          </div>
          <h2 id="export-modal-title" className="font-serif-title text-2xl md:text-3xl font-normal text-stone-100 mt-1">
            Execution-Ready Blueprint Handover
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-400">
            Export the complete 4-deliverable dossier as formatted Markdown, instant iCalendar (.ics), or print-ready director binder.
          </p>
        </div>

        {/* Action bar with all required buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-y border-stone-800/80 py-4">
          {/* Instant .ics calendar download */}
          <button
            onClick={handleDownloadICS}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors shadow-sm"
            title="Download iCalendar file containing all hourly run-of-show blocks"
          >
            <Calendar className="h-4 w-4" />
            <span>Download .ics Calendar</span>
          </button>

          {/* Download Markdown file */}
          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Download Blueprint (.md)</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-medium text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-stone-400" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          {/* Print Run of Show */}
          <button
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-medium text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            <span>Print Binder / PDF</span>
          </button>

          {/* Tab switch */}
          <div className="ml-auto flex items-center rounded-lg border border-stone-800 bg-stone-950 p-1 text-xs">
            <button
              onClick={() => setViewTab('formatted')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewTab === 'formatted'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Visual Binder</span>
            </button>
            <button
              onClick={() => setViewTab('markdown')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewTab === 'markdown'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Code className="h-3 w-3" />
              <span>Markdown</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewTab === 'formatted' ? (
          <div className="mt-5 max-h-[520px] overflow-y-auto rounded-xl border border-stone-800/90 bg-stone-950 p-5 print-area space-y-6 text-stone-200">
            {/* Header info */}
            <div className="border-b border-stone-800 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                PlanIQ Master Logistics Directive · {blueprint.version}
              </span>
              <h3 className="font-serif-title text-2xl text-stone-100">{constraints.eventType}</h3>
              <p className="text-xs text-stone-400 mt-1">
                Setting: {constraints.locationSetting} · Budget: {formatCurrency(constraints.totalBudget, constraints.currency)} · Guest Count: {constraints.guestCount}
              </p>
            </div>

            {/* Deliverable 1: Creative Concept */}
            <div className="print-break-inside">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide border-b border-stone-800/60 pb-1 mb-2">
                1. Creative Concept & Interactive Elements
              </h4>
              <p className="text-xs font-semibold text-stone-100">{creativeConcept.aestheticTitle}</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{creativeConcept.aestheticManifesto}</p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {creativeConcept.interactiveElements.map((el, i) => (
                  <div key={i} className="rounded-lg bg-stone-900/60 border border-stone-800/60 p-2.5">
                    <span className="text-amber-400 font-bold block text-[11px] mb-0.5">{el.title}</span>
                    <span className="text-[10px] text-stone-400 block mb-1">Timing: {el.targetMoment}</span>
                    <p className="text-[11px] text-stone-300 leading-normal">{el.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable 2: Budget Breakdown Table */}
            <div className="print-break-inside">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide border-b border-stone-800/60 pb-1 mb-2">
                2. Dynamic Budget Allocation (100% Balanced)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-800 print-table">
                  <thead>
                    <tr className="bg-stone-900 border-b border-stone-800 text-stone-300">
                      <th className="p-2 font-semibold">Category</th>
                      <th className="p-2 font-semibold text-center w-16">Share</th>
                      <th className="p-2 font-semibold text-right w-28">Amount</th>
                      <th className="p-2 font-semibold">Key Cost-Optimization Tips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetBreakdown.categories.map((c) => (
                      <tr key={c.id} className="border-b border-stone-800/60 hover:bg-stone-900/40">
                        <td className="p-2 font-medium text-stone-200">{c.category}</td>
                        <td className="p-2 text-center font-mono text-amber-400">{c.percentage}%</td>
                        <td className="p-2 text-right font-mono text-stone-200">
                          {formatCurrency(c.allocatedAmount, budgetBreakdown.currency)}
                        </td>
                        <td className="p-2 text-[11px] text-stone-400">
                          1) {c.costOptimizationTips[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deliverable 3: Hourly Run of Show */}
            <div className="print-break-inside">
              <div className="flex items-center justify-between border-b border-stone-800/60 pb-1 mb-2">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                  3. Hourly "Day-of" Run of Show
                </h4>
                <button
                  onClick={handleDownloadICS}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Calendar className="h-3 w-3" />
                  <span>Export to iCal (.ics)</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-800 print-table">
                  <thead>
                    <tr className="bg-stone-900 border-b border-stone-800 text-stone-300">
                      <th className="p-2 font-semibold w-24">Time</th>
                      <th className="p-2 font-semibold">Activity</th>
                      <th className="p-2 font-semibold w-28">Location</th>
                      <th className="p-2 font-semibold w-28">Lead Role</th>
                      <th className="p-2 font-semibold">Operational Cues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runOfShow.map((r, i) => (
                      <tr key={i} className="border-b border-stone-800/60 hover:bg-stone-900/40">
                        <td className="p-2 font-mono text-stone-300 text-[11px] whitespace-nowrap">
                          {r.startTime} - {r.endTime}
                        </td>
                        <td className="p-2 font-medium text-stone-100">{r.activity}</td>
                        <td className="p-2 text-stone-400 text-[11px]">{r.location}</td>
                        <td className="p-2 text-amber-400 text-[11px] font-medium">{r.leadRole}</td>
                        <td className="p-2 text-stone-400 text-[11px]">{r.cuesAndNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deliverable 4: Vendor Vetting Kit */}
            <div className="print-break-inside">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide border-b border-stone-800/60 pb-1 mb-2">
                4. Critical Vendor Vetting & Anti-Hidden Fee Kit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {vendorVettingKit.map((v, i) => (
                  <div key={i} className="rounded-lg bg-stone-900/60 border border-stone-800/60 p-3">
                    <span className="font-bold text-stone-100 block text-xs">{v.category}</span>
                    <span className="text-[10px] text-amber-400 block mb-1.5">Deadline: {v.bookingDeadline}</span>
                    <div className="space-y-1">
                      {v.vettingQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="text-[11px] text-stone-300">
                          <span className="font-medium text-amber-300">Q{qIdx + 1}:</span> {q.question}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Full Markdown Dossier Preview
            </span>
            <div className="max-h-[520px] overflow-y-auto rounded-xl border border-stone-800/90 bg-stone-950 p-4 font-mono text-xs text-stone-300 leading-relaxed whitespace-pre-wrap select-all">
              {generateMarkdown(blueprint)}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-800">
          <span className="text-xs text-stone-500 font-mono">
            {runOfShow.length} schedule blocks · {budgetBreakdown.categories.length} pillars · {vendorVettingKit.length} vendor kits
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-700 bg-stone-800 px-5 py-2 text-xs font-medium text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
