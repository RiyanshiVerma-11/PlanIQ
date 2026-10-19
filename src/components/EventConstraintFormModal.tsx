import React, { useState } from 'react';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import type { EventConstraints, CurrencyCode } from '../types/blueprint.ts';
import { CURRENCIES } from '../utils/blueprintEngine.ts';

interface EventConstraintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (constraints: EventConstraints, useAI: boolean) => Promise<void>;
  initialConstraints?: EventConstraints;
  isLoadingAI: boolean;
}

export const EventConstraintFormModal: React.FC<EventConstraintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialConstraints,
  isLoadingAI,
}) => {
  const [eventType, setEventType] = useState(initialConstraints?.eventType || 'Modern Fusion Wedding');
  const [totalBudget, setTotalBudget] = useState(initialConstraints?.totalBudget?.toString() || '25000');
  const [currency, setCurrency] = useState<CurrencyCode>(initialConstraints?.currency || 'USD');
  const [locationSetting, setLocationSetting] = useState(
    initialConstraints?.locationSetting || 'Indoor banquet + outdoor lawn'
  );
  const [guestCount, setGuestCount] = useState(initialConstraints?.guestCount?.toString() || '120');
  const [keyTheme, setKeyTheme] = useState(
    initialConstraints?.keyTheme || 'Minimalist pastel, lively dance party, botanical warmth'
  );
  const [timeRemainingMonths, setTimeRemainingMonths] = useState(
    initialConstraints?.timeRemainingMonths?.toString() || '3'
  );
  const [useAI, setUseAI] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(totalBudget);
    const guestNum = parseInt(guestCount, 10);
    const monthsNum = parseInt(timeRemainingMonths, 10);

    if (!eventType.trim() || isNaN(budgetNum) || budgetNum <= 0) return;

    const constraints: EventConstraints = {
      id: `custom-event-${Date.now()}`,
      eventType: eventType.trim(),
      totalBudget: budgetNum,
      currency,
      locationSetting: locationSetting.trim(),
      guestCount: isNaN(guestNum) ? 100 : guestNum,
      keyTheme: keyTheme.trim(),
      timeRemainingMonths: isNaN(monthsNum) ? 3 : monthsNum,
    };

    await onSubmit(constraints, useAI);
  };

  const handleApplyPreset = (type: string, budget: string, curr: CurrencyCode, setting: string, guests: string, theme: string, months: string) => {
    setEventType(type);
    setTotalBudget(budget);
    setCurrency(curr);
    setLocationSetting(setting);
    setGuestCount(guests);
    setKeyTheme(theme);
    setTimeRemainingMonths(months);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-900 p-6 md:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
          title="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Event Logistics Director & Strategist</span>
          </div>
          <h2 className="font-serif-title text-2xl md:text-3xl font-normal text-stone-100 mt-1">
            Configure Event Constraints
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-400">
            Define your parameters to produce a complete 4-pillar execution-ready blueprint.
          </p>
        </div>

        {/* Quick Fill Pills */}
        <div className="mt-4 pt-3 border-t border-stone-800/80">
          <span className="text-[11px] font-medium text-stone-400 block mb-2">Quick Prefill Inspiration & Edge Cases:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleApplyPreset('Pet Birthday Party on Houseboat', '8000', 'USD', 'Moored 80ft Houseboat & Upper Open Sun Deck', '50', 'Nautical bark-cuterie, pet life jackets, splash-safe acoustic lounge', '2')}
              className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-300 hover:bg-amber-500/20 transition-colors font-medium"
            >
              🐾 Pet Birthday on Houseboat ($8k / 50 Guests)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Modern Fusion Wedding', '45000', 'USD', 'Indoor banquet + outdoor lawn', '150', 'Minimalist pastel with warm brass & botanical architecture', '4')}
              className="rounded-md border border-stone-800 bg-stone-950/60 px-2.5 py-1 text-stone-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              Fusion Wedding ($45k)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('30th Birthday Celebration', '12000', 'USD', 'Urban loft + rooftop terrace', '60', 'Moody editorial lounge, vinyl bar & bespoke cocktail pairings', '2')}
              className="rounded-md border border-stone-800 bg-stone-950/60 px-2.5 py-1 text-stone-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              30th Birthday Loft ($12k)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Tech Community Gala & Awards', '35000', 'USD', 'Waterfront industrial pavilion', '250', 'Cyber-clean minimal, generative projection art & lightning pitches', '3')}
              className="rounded-md border border-stone-800 bg-stone-950/60 px-2.5 py-1 text-stone-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              Tech Community Gala ($35k)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Event Type <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Fusion Wedding / 30th Birthday Celebration / Tech Community Gala"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Total Budget <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="25000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                {Object.entries(CURRENCIES).map(([code, cfg]) => (
                  <option key={code} value={code}>
                    {cfg.symbol} {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Location / Setting
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Indoor banquet + outdoor lawn / Urban loft / Beachfront"
                value={locationSetting}
                onChange={(e) => setLocationSetting(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Guest Count
              </label>
              <input
                type="number"
                required
                min="5"
                max="5000"
                placeholder="120"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Key Theme & Aesthetic Preferences
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Minimalist pastel, lively dance party, eco-friendly zero-waste, warm brass and botanicals"
              value={keyTheme}
              onChange={(e) => setKeyTheme(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Time Remaining Until Event
              </label>
              <select
                value={timeRemainingMonths}
                onChange={(e) => setTimeRemainingMonths(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="1">1 Month (Urgent Crunch)</option>
                <option value="2">2 Months (Fast-Track)</option>
                <option value="3">3 Months (Standard Quarter)</option>
                <option value="4">4 Months (Recommended)</option>
                <option value="6">6 Months (Comprehensive)</option>
                <option value="9">9 Months (Long-Range)</option>
                <option value="12">12 Months (Full Year)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 rounded-lg border border-stone-800 bg-stone-950/60 p-2.5 cursor-pointer hover:border-amber-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-700 bg-stone-900 accent-amber-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-stone-200 block">Synthesize with Gemini AI</span>
                  <span className="text-[11px] text-stone-400">Generate bespoke creative concept via backend</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingAI}
              className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-medium text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingAI}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                  <span>Synthesizing with Gemini AI (4 Deliverables)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Complete Blueprint</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
