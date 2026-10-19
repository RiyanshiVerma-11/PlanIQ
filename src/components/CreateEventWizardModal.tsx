import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Palette,
  CheckCircle2,
  Loader2,
  HeartHandshake,
  Cake,
  Trophy,
  Dog,
  Wine,
  Building,
  Compass,
} from 'lucide-react';
import type { EventConstraints, CurrencyCode } from '../types/blueprint.ts';
import { CURRENCIES, formatCurrency } from '../utils/blueprintEngine.ts';

interface CreateEventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (constraints: EventConstraints, useAI: boolean) => Promise<void>;
  isLoadingAI: boolean;
  initialPresetToLoad?: (presetId: string) => void;
}

export const CreateEventWizardModal: React.FC<CreateEventWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoadingAI,
  initialPresetToLoad,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Event Basics
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Modern Fusion Wedding');
  const [customEventType, setCustomEventType] = useState('');
  const [timeRemainingMonths, setTimeRemainingMonths] = useState('3');

  // Step 2: Scale & Location
  const [guestCount, setGuestCount] = useState('120');
  const [locationSetting, setLocationSetting] = useState('Indoor banquet + outdoor lawn');
  const [customLocation, setCustomLocation] = useState('');

  // Step 3: Financials
  const [totalBudget, setTotalBudget] = useState('25000');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Step 4: Vibe & Concept
  const [keyTheme, setKeyTheme] = useState('Minimalist pastel, lively dance party, botanical warmth');
  const [paletteTone, setPaletteTone] = useState('Warm Terracotta & Sage');
  const [specialRequests, setSpecialRequests] = useState('');
  const [useAI, setUseAI] = useState(true);

  if (!isOpen) return null;

  const eventTypeOptions = [
    { id: 'wedding', label: 'Wedding / Fusion', icon: HeartHandshake, val: 'Modern Fusion Wedding' },
    { id: 'birthday', label: 'Milestone Birthday', icon: Cake, val: '30th Birthday Celebration' },
    { id: 'gala', label: 'Gala / Awards', icon: Trophy, val: 'Tech Community Gala & Awards' },
    { id: 'pet', label: 'Pet Celebration', icon: Dog, val: 'Pet Birthday Party on Houseboat' },
    { id: 'lounge', label: 'Cocktail Soirée', icon: Wine, val: 'Moody Cocktail Lounge & Tasting' },
    { id: 'custom', label: 'Custom Typology', icon: Sparkles, val: 'Custom' },
  ];

  const venueSettingOptions = [
    { label: 'Indoor Banquet + Outdoor Lawn', desc: 'Hybrid climate-controlled hall with open garden/lawn' },
    { label: 'Urban Industrial Loft + Rooftop', desc: 'Exposed brick, pendant filament lights, skyline view' },
    { label: 'Beachfront & Ocean Pavilion', desc: 'Coastal terrace, sea breeze, sunset orientation' },
    { label: 'Moored Houseboat & Sun Deck', desc: 'Waterway vessel, marine salon & open upper observation deck' },
    { label: 'Historic Estate & Conservatory', desc: 'Botanical glasshouse, stone colonnades, architectural trees' },
    { label: 'Custom Venue Setting', desc: 'Specify your bespoke event environment' },
  ];

  const themeInspirations = [
    'Botanical Warmth & Brass',
    'Moody Editorial Noir',
    'Cyber Minimal & Electric Cyan',
    'Zero-Waste Organic Linen',
    'Lively Dance Party',
    'Nautical Bark-cuterie & Pet Safety',
  ];

  const palettePresets = [
    { label: 'Warm Terracotta & Sage', colors: ['#C86D51', '#7D8D7B', '#C29F5D', '#E7E2DF', '#262220'] },
    { label: 'Nocturne Amber & Gold', colors: ['#1C1917', '#D97706', '#EAB308', '#701A75', '#F5F5F4'] },
    { label: 'Minimalist Pastel & Cream', colors: ['#F3E8EE', '#BAC7A7', '#D4AF37', '#FAF9F6', '#3D3B3C'] },
    { label: 'Cyber Minimal Cyan & Violet', colors: ['#0D0E12', '#00F0FF', '#8B5CF6', '#F8FAFC', '#334155'] },
    { label: 'Nautical Navy & Crisp White', colors: ['#0F172A', '#0284C7', '#38BDF8', '#FFFFFF', '#D97706'] },
  ];

  const budgetNum = parseFloat(totalBudget) || 0;
  const guestNum = parseInt(guestCount, 10) || 1;
  const perGuest = Math.round(budgetNum / (guestNum || 1));
  const contingencyBuffer = Math.round(budgetNum * 0.05);

  const effectiveEventType = eventType === 'Custom' ? (customEventType.trim() || 'Custom Celebration') : eventType;
  const effectiveLocation = locationSetting === 'Custom Venue Setting' ? (customLocation.trim() || 'Custom Setting') : locationSetting;

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (eventType === 'Custom' && !customEventType.trim()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (guestNum <= 0) return;
      if (locationSetting === 'Custom Venue Setting' && !customLocation.trim()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (budgetNum <= 0) return;
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetNum <= 0 || guestNum <= 0) return;

    const constraints: EventConstraints = {
      id: `custom-event-${Date.now()}`,
      eventName: eventName.trim() || effectiveEventType,
      eventType: effectiveEventType,
      totalBudget: budgetNum,
      currency,
      locationSetting: effectiveLocation,
      guestCount: guestNum,
      keyTheme: `${keyTheme.trim()} (${paletteTone})`,
      timeRemainingMonths: parseInt(timeRemainingMonths, 10) || 3,
      specialRequests: specialRequests.trim() || undefined,
    };

    await onSubmit(constraints, useAI);
  };

  const handleQuickLoadPreset = (presetId: string) => {
    if (initialPresetToLoad) {
      initialPresetToLoad(presetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-stone-800 bg-stone-900 p-6 md:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoadingAI}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors disabled:opacity-40"
          title="Close wizard"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Wizard Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Master Event Blueprint Wizard</span>
          </div>
          <h2 className="font-serif-title text-2xl md:text-3xl font-normal text-stone-100 mt-1">
            {currentStep === 1 && 'Step 01: Event Basics & Typology'}
            {currentStep === 2 && 'Step 02: Scale, Capacity & Spatial Setting'}
            {currentStep === 3 && 'Step 03: Capital Allocation & Financials'}
            {currentStep === 4 && 'Step 04: Aesthetic Vision & Interactive Experiences'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-400">
            {currentStep === 1 && 'Name your event and select the fundamental strategic archetype.'}
            {currentStep === 2 && 'Specify headcount and venue environment to calibrate logistics.'}
            {currentStep === 3 && 'Define total budget and currency for forensic 7-pillar allocation.'}
            {currentStep === 4 && 'Articulate color tones, themes, and custom activities for Gemini synthesis.'}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-6 mb-8">
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, label: '01 Basics' },
              { step: 2, label: '02 Scale' },
              { step: 3, label: '03 Financials' },
              { step: 4, label: '04 Concept' },
            ].map((s) => (
              <div key={s.step} className="space-y-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep === s.step
                      ? 'bg-amber-500'
                      : currentStep > s.step
                      ? 'bg-emerald-500'
                      : 'bg-stone-800'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono block ${
                    currentStep === s.step
                      ? 'text-amber-400 font-semibold'
                      : currentStep > s.step
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE STEP CONTENT */}
        {isLoadingAI ? (
          /* Animated AI Synthesis Loading Screen */
          <div className="py-12 px-4 text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Sparkles className="h-7 w-7 text-amber-400 absolute animate-pulse" />
            </div>

            <div>
              <h3 className="font-serif-title text-2xl text-stone-100">
                Synthesizing Blueprint with Gemini AI...
              </h3>
              <p className="mt-2 text-xs text-stone-400 max-w-md mx-auto">
                Directing your event constraints to the master logistics engine. Generating 4 execution-ready deliverables:
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono bg-stone-950 p-4 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Formulating personalized aesthetic manifesto & 5-color palette</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Calibrating 7-pillar budget table with 2 cost-saving strategies</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>Architecting backward planning milestones & hourly run of show</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <div className="h-4 w-4 rounded-full border border-stone-700 flex items-center justify-center text-[10px]">4</div>
                <span>Compiling anti-hidden-fee vendor vetting kit & forensic checklist</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* STEP 1: EVENT BASICS */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Event Title / Project Name <span className="text-stone-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maya & Arjun's Celestial Union, Rover's 5th Birthday Cruise"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Event Typology Archetype <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {eventTypeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = eventType === opt.val || (opt.id === 'custom' && eventType === 'Custom');
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (opt.id === 'custom') {
                              setEventType('Custom');
                            } else {
                              setEventType(opt.val);
                            }
                          }}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 text-stone-100 shadow-sm'
                              : 'border-stone-800 bg-stone-950/70 text-stone-300 hover:border-stone-700 hover:text-white'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {eventType === 'Custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Specify Custom Event Typology <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Underwater Hackathon, Pet Houseboat Cruise, Vintage Car Rally Dinner"
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value)}
                      className="w-full rounded-xl border border-amber-500/60 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Time Remaining Until Event <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { val: '1', label: '1 Month', note: 'Urgent Crunch' },
                      { val: '2', label: '2 Months', note: 'Fast-Track' },
                      { val: '3', label: '3 Months', note: 'Standard Qtr' },
                      { val: '6', label: '6 Months', note: 'Comprehensive' },
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setTimeRemainingMonths(m.val)}
                        className={`p-2.5 rounded-xl border text-center transition-colors ${
                          timeRemainingMonths === m.val
                            ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                            : 'border-stone-800 bg-stone-950/70 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        <div className="font-semibold text-stone-100">{m.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{m.note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional helper to load demo preset */}
                {initialPresetToLoad && (
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span>Evaluating or need instant inspiration?</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLoadPreset('preset-fusion-wedding')}
                      className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>Load Sample Demo Preset (Fusion Wedding)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SCALE & LOCATION */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Confirmed Guest Headcount <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Calculates catering ratios, staffing, & room density
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min="5"
                    max="5000"
                    placeholder="120"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {[
                      { num: '25', label: '25 (Intimate)' },
                      { num: '60', label: '60 (Boutique)' },
                      { num: '120', label: '120 (Standard)' },
                      { num: '250', label: '250 (Grand)' },
                      { num: '500', label: '500 (Mega)' },
                    ].map((p) => (
                      <button
                        key={p.num}
                        type="button"
                        onClick={() => setGuestCount(p.num)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                          guestCount === p.num
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Venue Setting & Spatial Environment <span className="text-amber-400">*</span>
                  </label>
                  <div className="space-y-2">
                    {venueSettingOptions.map((v) => {
                      const isSelected = locationSetting === v.label;
                      return (
                        <button
                          key={v.label}
                          type="button"
                          onClick={() => setLocationSetting(v.label)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 text-stone-100'
                              : 'border-stone-800 bg-stone-950/70 text-stone-300 hover:border-stone-700 hover:text-white'
                          }`}
                        >
                          <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                          <div className="flex-1">
                            <span className="text-xs font-semibold block">{v.label}</span>
                            <span className="text-[11px] text-stone-400">{v.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {locationSetting === 'Custom Venue Setting' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Describe Custom Venue Setting <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cliffside Glass Villa, Moored 80ft Houseboat, Aircraft Hangar"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full rounded-xl border border-amber-500/60 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: FINANCIALS */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Total Event Budget Target <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="500"
                        step="100"
                        placeholder="25000"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                      />
                      <DollarSign className="absolute right-3.5 top-3 h-4 w-4 text-stone-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Currency <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:outline-none font-medium"
                    >
                      {Object.values(CURRENCIES).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Financial Metrics preview strip */}
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                    Preliminary Investment Diagnostics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-stone-900/80 p-3 border border-stone-800/80">
                      <span className="text-stone-400 block text-[11px]">Per-Guest Target</span>
                      <span className="text-sm font-mono font-bold text-stone-100 mt-1 block">
                        {formatCurrency(perGuest, currency)}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">Across {guestNum} guests</span>
                    </div>

                    <div className="rounded-lg bg-stone-900/80 p-3 border border-stone-800/80">
                      <span className="text-stone-400 block text-[11px]">5% Contingency Buffer</span>
                      <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                        {formatCurrency(contingencyBuffer, currency)}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">Protected capital reserve</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 rounded-lg bg-stone-900/80 p-3 border border-stone-800/80">
                      <span className="text-stone-400 block text-[11px]">Est. F&B Allocation</span>
                      <span className="text-sm font-mono font-bold text-amber-300 mt-1 block">
                        ~{formatCurrency(Math.round(budgetNum * 0.34), currency)}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">34% benchmark share</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: VIBE & CONCEPT */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Key Aesthetic Theme & Vibe Keywords <span className="text-amber-400">*</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Minimalist pastel, lively dance party, eco-friendly zero-waste, warm brass and botanicals"
                    value={keyTheme}
                    onChange={(e) => setKeyTheme(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none leading-relaxed"
                  />
                  {/* Quick inspiration chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {themeInspirations.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (!keyTheme.includes(t)) {
                            setKeyTheme((prev) => (prev ? `${prev}, ${t}` : t));
                          }
                        }}
                        className="rounded-md border border-stone-800 bg-stone-950 px-2 py-0.5 text-[11px] text-stone-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Curated Color Palette Direction <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {palettePresets.map((p) => {
                      const isSelected = paletteTone === p.label;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setPaletteTone(p.label)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/15 text-stone-100'
                              : 'border-stone-800 bg-stone-950/70 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <span className="text-xs font-medium">{p.label}</span>
                          <div className="flex items-center gap-1">
                            {p.colors.map((c, i) => (
                              <span
                                key={i}
                                className="h-3.5 w-3.5 rounded-full border border-stone-700 shrink-0"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Special Requests, Signature Moments & Interactive Activities <span className="text-stone-500">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Bark-cuterie board with pet life jackets, interactive vinyl crate, nitrogen cocktail pairing, zero single-use plastics"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* AI Toggle */}
                <label className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 cursor-pointer hover:border-amber-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-700 bg-stone-900 accent-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Synthesize with Gemini 2.5/3.8 Flash AI Model
                    </span>
                    <span className="text-[11px] text-stone-300">
                      Generates bespoke creative concept, 7-pillar budget table, milestones, hourly schedule, and forensic vetting kit.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Modal Navigation Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-stone-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-medium text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-medium text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoadingAI}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Complete Blueprint</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
