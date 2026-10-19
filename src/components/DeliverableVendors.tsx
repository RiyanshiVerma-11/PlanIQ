import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Plus,
  Scale,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import type { VendorVettingItem, VendorCandidate, CurrencyCode } from '../types/blueprint.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

interface DeliverableVendorsProps {
  vettingKit: VendorVettingItem[];
  currency: CurrencyCode;
}

export const DeliverableVendors: React.FC<DeliverableVendorsProps> = ({
  vettingKit,
  currency,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    vettingKit[0]?.category || 'Catering & Beverage'
  );
  const [candidates, setCandidates] = useState<VendorCandidate[]>([
    {
      id: 'cand-1',
      category: 'Catering & Beverage',
      vendorName: 'Artisan Hearth & Botanical Bar',
      quoteAmount: 14800,
      reliabilityScore: 5,
      portfolioMatchScore: 5,
      scopeCompletenessScore: 4,
      communicationScore: 5,
      notes: 'All-inclusive living wage charge, verified zero hidden corkage fees.',
    },
    {
      id: 'cand-2',
      category: 'Catering & Beverage',
      vendorName: 'Grand Epicure Hospitality',
      quoteAmount: 13200,
      reliabilityScore: 4,
      portfolioMatchScore: 4,
      scopeCompletenessScore: 3,
      communicationScore: 3,
      notes: 'Quote looks lower initially but flags 22% admin fee + separate tip.',
    },
  ]);

  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newQuoteAmount, setNewQuoteAmount] = useState('');
  const [newReliability, setNewReliability] = useState('5');
  const [newPortfolio, setNewPortfolio] = useState('5');
  const [newScope, setNewScope] = useState('4');
  const [newComm, setNewComm] = useState('4');
  const [newNotes, setNewNotes] = useState('');

  const currentItem = vettingKit.find((k) => k.category === activeCategory) || vettingKit[0];

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim() || !newQuoteAmount) return;

    const cand: VendorCandidate = {
      id: `cand-${Date.now()}`,
      category: activeCategory,
      vendorName: newVendorName.trim(),
      quoteAmount: parseFloat(newQuoteAmount),
      reliabilityScore: parseInt(newReliability, 10),
      portfolioMatchScore: parseInt(newPortfolio, 10),
      scopeCompletenessScore: parseInt(newScope, 10),
      communicationScore: parseInt(newComm, 10),
      notes: newNotes.trim() || 'Pending contract review',
    };

    setCandidates([...candidates, cand]);
    setNewVendorName('');
    setNewQuoteAmount('');
    setNewNotes('');
    setShowAddCandidate(false);
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const filteredCandidates = candidates.filter((c) => c.category === activeCategory);

  return (
    <section className="space-y-8 relative">
      {/* Header Bento Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Deliverable 04 · Procurement & Contract Defense</span>
          </div>
          <h2 className="font-serif-title text-2xl font-normal text-zinc-100 mt-1">
            Vendor Sourcing, Scopes & Anti-Hidden Fee Vetting Kit
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-3xl">
            Vetting dossiers across the 4 critical event partner categories, with strict scope benchmarks and 3 forensic anti-hidden-fee questions to eradicate surprise surcharges.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            {vettingKit.length} Critical Categories
          </span>
        </div>
      </div>

      {/* Category Pills Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 custom-scrollbar">
        {vettingKit.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.category)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeCategory === item.category
                ? 'bg-amber-500 text-zinc-950 shadow-md scale-105'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5 hover:border-white/15'
            }`}
          >
            {item.category}
          </button>
        ))}
      </div>

      {currentItem && (
        <div className="space-y-6">
          {/* Booking Deadline & Scope Bento Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Booking Deadline Card */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Mandatory Booking Deadline</span>
                </div>
                <div className="text-base font-extrabold text-zinc-100">
                  {currentItem.bookingDeadline}
                </div>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Locking past this window introduces market scarcity premiums and limited crew availability.
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/10 text-xs">
                <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold block mb-1">
                  Staffing & Equipment Benchmark
                </span>
                <span className="text-zinc-200 font-semibold">{currentItem.staffingOrEquipmentBenchmark}</span>
              </div>
            </div>

            {/* Scope of Work Checklist Card */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>Non-Negotiable Scope of Work Checklist</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {currentItem.scopeOfWork.map((scope, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5 rounded-lg bg-zinc-950/50 p-2 border border-white/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{scope}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3 Critical Vetting Questions Bento Container */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    3 Forensic Vetting Questions to Avoid Hidden Fees
                  </h3>
                  <p className="text-xs text-zinc-400">Ask these during quote review to expose fine print traps</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2.5 py-1 rounded-lg">
                Procurement Defense
              </span>
            </div>

            <div className="space-y-4">
              {currentItem.vettingQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="rounded-xl border border-white/10 bg-zinc-950/70 p-5 transition-all duration-200 hover:border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-xs font-mono font-bold shrink-0 border border-amber-500/30">
                      Q{qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-zinc-100">
                        "{q.question}"
                      </h4>
                      <p className="mt-1 text-xs text-zinc-400 italic">
                        Why it matters: {q.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                    {/* Green Flag */}
                    <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-3.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Green Flag (Optimal Expected Answer)</span>
                      </div>
                      <p className="text-zinc-200 leading-relaxed text-[11px]">{q.greenFlagAnswer}</p>
                    </div>

                    {/* Red Flag */}
                    <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 p-3.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        <span>Red Flag (Hidden Fee Traps & Evasions)</span>
                      </div>
                      <p className="text-zinc-200 leading-relaxed text-[11px]">{q.redFlagAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Vendor RFP Quote Comparison Tool */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Scale className="h-4 w-4" />
                  <span>Interactive Proposal Decision Matrix</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-1">
                  Candidate Comparison for {activeCategory}
                </h3>
              </div>

              <button
                onClick={() => setShowAddCandidate(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-100 hover:bg-zinc-700 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400" />
                <span>Log Vendor Proposal</span>
              </button>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No vendor proposals logged for {activeCategory} yet. Click "Log Vendor Proposal" to compare bids side-by-side.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/60">
                    <tr>
                      <th className="py-3 px-3.5 rounded-l-lg">Vendor / Firm</th>
                      <th className="py-3 px-3.5">Quote Amount</th>
                      <th className="py-3 px-3.5">Reliability</th>
                      <th className="py-3 px-3.5">Portfolio Match</th>
                      <th className="py-3 px-3.5">Scope Integrity</th>
                      <th className="py-3 px-3.5">Evaluation Notes</th>
                      <th className="py-3 px-3.5 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3.5 px-3.5 font-bold text-zinc-100 whitespace-nowrap">
                          {cand.vendorName}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono font-bold text-amber-400 tabular-nums whitespace-nowrap">
                          {formatCurrency(cand.quoteAmount, currency)}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono tabular-nums">
                          <span className="font-bold text-zinc-100">{cand.reliabilityScore}</span> / 5
                        </td>
                        <td className="py-3.5 px-3.5 font-mono tabular-nums">
                          <span className="font-bold text-zinc-100">{cand.portfolioMatchScore}</span> / 5
                        </td>
                        <td className="py-3.5 px-3.5 font-mono tabular-nums">
                          <span className="font-bold text-zinc-100">{cand.scopeCompletenessScore}</span> / 5
                        </td>
                        <td className="py-3.5 px-3.5 text-zinc-400 max-w-xs truncate">
                          {cand.notes}
                        </td>
                        <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteCandidate(cand.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            title="Delete candidate quote"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Candidate Modal */}
          {showAddCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-zinc-100">
                    Log Vendor Proposal ({activeCategory})
                  </h4>
                  <button
                    onClick={() => setShowAddCandidate(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Enter quote details to benchmark against other proposals.
                </p>

                <form onSubmit={handleAddCandidate} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Vendor / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Luminary Cinema Studios"
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Quoted Fixed Amount ({currency})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="4500"
                      value={newQuoteAmount}
                      onChange={(e) => setNewQuoteAmount(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Reliability Score (1-5)
                      </label>
                      <select
                        value={newReliability}
                        onChange={(e) => setNewReliability(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none font-medium"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} - {n === 5 ? 'Elite Tier' : n === 4 ? 'Solid Partner' : 'Caution'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Portfolio Match (1-5)
                      </label>
                      <select
                        value={newPortfolio}
                        onChange={(e) => setNewPortfolio(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none font-medium"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} - {n === 5 ? 'Exact Aesthetic' : n === 4 ? 'Near Match' : 'Generic'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Evaluation Notes / Flags
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Verified zero admin fees, included setup crew of 4."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowAddCandidate(false)}
                      className="rounded-xl border border-white/10 bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
                    >
                      Save Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
