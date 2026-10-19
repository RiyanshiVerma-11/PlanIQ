import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CalendarCheck2,
  DollarSign,
  Palette,
} from 'lucide-react';
import { formatCurrency } from '../utils/blueprintEngine.ts';

interface LandingHeroProps {
  onSelectPreset: (presetId: string) => void;
  onOpenCreateModal: () => void;
  activePresetId?: string;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectPreset,
  onOpenCreateModal,
  activePresetId,
}) => {
  const presets = [
    {
      id: 'preset-fusion-wedding',
      title: 'Modern Fusion Wedding',
      tagline: 'Botanical Minimalist & Heritage Warmth',
      budget: 45000,
      currency: 'USD' as const,
      guests: 150,
      setting: 'Indoor banquet + outdoor lawn',
      timeline: '4 months',
      theme: 'Minimalist pastel with warm brass & botanical architecture',
      badge: 'Wedding Architecture',
    },
    {
      id: 'preset-30th-birthday',
      title: '30th Birthday Celebration',
      tagline: 'Nocturne Vinyl Lounge & Speakeasy Chic',
      budget: 12000,
      currency: 'USD' as const,
      guests: 60,
      setting: 'Urban brick loft + rooftop terrace',
      timeline: '2 months',
      theme: 'Moody editorial lounge, vinyl bar & bespoke cocktail pairings',
      badge: 'Milestone Soirée',
    },
    {
      id: 'preset-tech-gala',
      title: 'Tech Community Gala & Awards',
      tagline: 'Kinetic Monolith & Cyber-Clean Staging',
      budget: 35000,
      currency: 'USD' as const,
      guests: 250,
      setting: 'Waterfront industrial truss pavilion',
      timeline: '3 months',
      theme: 'Generative audio-reactive projection art & lightning pitches',
      badge: 'Conference & Gala',
    },
  ];

  return (
    <div className="relative overflow-hidden py-10 md:py-16">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Hero Intro */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="animate-hero-1 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Master Event Strategist & Logistics Director Suite</span>
          </div>

          <h1 className="animate-hero-2 mt-6 font-serif-title text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-100">
            Precision Blueprints for Unforgettable Gatherings
          </h1>

          <p className="animate-hero-3 mt-5 text-base sm:text-lg leading-relaxed text-stone-300">
            Bridging artistic creative concepts, forensic budget allocations, backward timeline milestones, and airtight vendor vetting kits — built ready for flawless day-of execution.
          </p>

          {/* Primary Action Buttons */}
          <div className="animate-hero-4 mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span>Build Custom Blueprint</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSelectPreset('preset-fusion-wedding')}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/90 px-6 py-3 text-sm font-medium text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <span>Explore Master Presets</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Strip */}
        <div className="animate-hero-4 mt-14 grid grid-cols-2 md:grid-cols-4 gap-3.5 border-y border-stone-800/80 py-5 text-center text-xs text-stone-400">
          <div className="flex flex-col items-center gap-1.5 p-2">
            <Palette className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-stone-200">1. Creative Concept</span>
            <span>Aesthetics, palettes & 3 interactive activities</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-stone-200">2. Dynamic Budget</span>
            <span>7-category slider allocation & cost tips</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <CalendarCheck2 className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-stone-200">3. Timelines & Run-of-Show</span>
            <span>Backward milestones & hourly cues by role</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-stone-200">4. Vendor Vetting Kit</span>
            <span>Scopes of work & anti-hidden fee questions</span>
          </div>
        </div>

        {/* 3 Master Presets Showcase */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Turnkey Execution Blueprints
              </span>
              <h2 className="text-lg font-semibold text-stone-100">
                Instant Presets from Event Director Master Library
              </h2>
            </div>
            <span className="text-xs text-stone-400 hidden sm:inline-block">
              Select any blueprint to inspect or customize
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {presets.map((preset, pIdx) => {
              const isSelected = activePresetId === preset.id;
              const cardClass = pIdx === 0 ? 'animate-card-1' : pIdx === 1 ? 'animate-card-2' : 'animate-card-3';
              return (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`${cardClass} group relative flex flex-col justify-between rounded-2xl border p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-stone-900 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/50'
                      : 'border-stone-800 bg-stone-900/40 hover:border-stone-700 hover:bg-stone-900/70'
                  }`}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                        {preset.badge}
                      </span>
                      <span className="font-mono text-xs text-stone-400 tabular-nums">
                        {preset.timeline} lead time
                      </span>
                    </div>

                    <h3 className="font-serif-title text-xl font-normal text-stone-100 group-hover:text-amber-300 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="mt-1 text-xs text-amber-400/90 font-medium">{preset.tagline}</p>

                    <p className="mt-3 text-xs leading-relaxed text-stone-300 line-clamp-2">
                      {preset.theme}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-800/80">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-stone-950/60 p-2">
                        <span className="text-[10px] text-stone-500 block">Budget</span>
                        <span className="font-mono font-semibold text-stone-200 tabular-nums">
                          {formatCurrency(preset.budget, preset.currency)}
                        </span>
                      </div>
                      <div className="rounded-lg bg-stone-950/60 p-2">
                        <span className="text-[10px] text-stone-500 block">Guests</span>
                        <span className="font-mono font-semibold text-stone-200 tabular-nums">
                          {preset.guests}
                        </span>
                      </div>
                      <div className="rounded-lg bg-stone-950/60 p-2">
                        <span className="text-[10px] text-stone-500 block">Setting</span>
                        <span className="font-mono font-semibold text-stone-200 truncate block">
                          Dual
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-medium">
                        {isSelected ? 'Currently Viewing' : 'Load Blueprint'}
                      </span>
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 ${
                          isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
