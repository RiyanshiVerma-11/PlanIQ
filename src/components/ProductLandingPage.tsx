import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2,
  DollarSign,
  Palette,
  CheckCircle2,
  ChevronDown,
  Layers,
  Clock,
  Printer,
  Sliders,
  Scale,
  Sparkle,
  LogIn,
  Users,
  Calendar,
  Check,
  ArrowUpRight,
  Wand2,
  Zap,
} from 'lucide-react';
import { formatCurrency, PRESET_BLUEPRINTS } from '../utils/blueprintEngine.ts';

interface ProductLandingPageProps {
  onGoToLogin: () => void;
  onQuickStartPreset: (presetId: string) => void;
  onLaunchStudioDirectly?: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({
  onGoToLogin,
  onQuickStartPreset,
  onLaunchStudioDirectly,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interactivePreviewTab, setInteractivePreviewTab] = useState<'concept' | 'budget' | 'timeline' | 'vendors'>('concept');
  const [heroActivePreset, setHeroActivePreset] = useState<'preset-fusion-wedding' | 'preset-30th-birthday' | 'preset-tech-gala'>('preset-fusion-wedding');

  const selectedHeroBp = PRESET_BLUEPRINTS[heroActivePreset] || PRESET_BLUEPRINTS['preset-fusion-wedding'];

  const faqs = [
    {
      q: 'How does PlanIQ protect against hidden vendor fees?',
      a: 'Every blueprint comes equipped with a Procurement Defense Kit containing forensic vetting questions per vendor category. It spells out exact "Green Flag" answers vs "Red Flag" traps (such as unbundled 22% admin fees, surprise corkage surcharges, or punitive 30-minute overtime rates), along with staffing benchmarks and non-negotiable scopes of work.',
    },
    {
      q: 'Can I export the timeline and run-of-show for printing on event day?',
      a: 'Yes. With one click, you can export the full dossier as structured Markdown, export to RFC 5545 iCalendar format, or trigger our dedicated print engine, which produces clean, role-specific day-of run-of-show binders for your clipboards and coordinators.',
    },
    {
      q: 'What currencies and event scales are supported?',
      a: 'PlanIQ natively models budgets in USD ($), INR (₹), EUR (€), GBP (£), CAD (CA$), AUD (A$), and JPY (¥). Whether you are managing an intimate 60-guest urban loft celebration or a 250-guest industrial tech pavilion gala, our algorithms adjust per-guest ratios and contingency buffers automatically.',
    },
    {
      q: 'Can I generate blueprints with AI for bespoke custom themes?',
      a: 'Yes. In addition to our pre-engineered master blueprints, you can define custom event constraints and synthesize them via Gemini 3.8 Flash to generate tailored aesthetic manifestos, color palettes, and signature interactive activities.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 bg-mesh-dark">
      {/* 1. TOP BAR / HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand Wordmark */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20 group-hover:border-cyan-400 transition-colors">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-title tracking-tight text-xl leading-none font-bold text-white">PlanIQ</span>
              <span className="text-[10px] tracking-widest uppercase text-cyan-400 font-mono mt-0.5">Studio OS</span>
            </div>
          </a>

          {/* Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs tracking-wide uppercase font-semibold text-slate-400">
            <a href="#demo-deck" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Live Demo
            </a>
            <a href="#features" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#methodology" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Methodology
            </a>
            <a href="#presets" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Presets
            </a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="h-3.5 w-3.5 text-cyan-400" />
              <span>Log In</span>
            </button>
            <button
              onClick={onLaunchStudioDirectly || onGoToLogin}
              className="btn-electric btn-shimmer inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800/80 bg-hero-glow">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/15 via-indigo-500/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute top-1/4 left-10 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6 backdrop-blur-md shadow-sm shadow-cyan-500/10">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>The Operating System for Master Event Strategists</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-title text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
              Architect Unforgettable Events With{' '}
              <span className="text-gradient-electric">Execution-Grade</span>{' '}
              Blueprints
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
              Replace chaotic spreadsheets with forensic 7-pillar budget allocations, minute-by-minute day-of run of shows, bespoke creative concepts, and contract-hardened vendor vetting kits.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onLaunchStudioDirectly || onGoToLogin}
                className="btn-electric btn-shimmer inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-bold transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Launch Director Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#demo-deck"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-cyan-500/40 transition-all backdrop-blur-md"
              >
                <span>Explore Live Interactive Deck</span>
                <ChevronDown className="h-4 w-4 text-cyan-400" />
              </a>
            </div>

            {/* LIVE HERO DEMO DECK (Interactive Instant Value Demonstration) */}
            <div id="demo-deck" className="mt-14 max-w-4xl mx-auto text-left scroll-mt-24">
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

                {/* Deck Header & Preset Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 font-mono">
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Live Blueprint Synthesizer Preview</span>
                    </div>
                    <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-white">
                      {selectedHeroBp.constraints.eventName}
                    </h3>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start sm:self-center">
                    <button
                      onClick={() => setHeroActivePreset('preset-fusion-wedding')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        heroActivePreset === 'preset-fusion-wedding'
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      💍 Wedding
                    </button>
                    <button
                      onClick={() => setHeroActivePreset('preset-30th-birthday')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        heroActivePreset === 'preset-30th-birthday'
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎂 30th Birthday
                    </button>
                    <button
                      onClick={() => setHeroActivePreset('preset-tech-gala')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        heroActivePreset === 'preset-tech-gala'
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎪 Tech Gala
                    </button>
                  </div>
                </div>

                {/* Live Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-slate-800">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3 text-cyan-400" />
                      <span>Total Budget</span>
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-white mt-1 tabular-nums">
                      {formatCurrency(selectedHeroBp.budgetBreakdown.totalBudget, selectedHeroBp.budgetBreakdown.currency)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Users className="h-3 w-3 text-indigo-400" />
                      <span>Guest Count</span>
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-white mt-1 tabular-nums">
                      {selectedHeroBp.constraints.guestCount} Guests
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3 text-emerald-400" />
                      <span>Unit Economics</span>
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-emerald-400 mt-1 tabular-nums">
                      ${Math.round(selectedHeroBp.budgetBreakdown.totalBudget / selectedHeroBp.constraints.guestCount)} / guest
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-violet-400" />
                      <span>Planning Runway</span>
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-white mt-1 tabular-nums">
                      {selectedHeroBp.constraints.timeRemainingMonths} Months
                    </div>
                  </div>
                </div>

                {/* Color Swatch & Aesthetic Highlight */}
                <div className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                        Aesthetic Palette & Spatial Vibe
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        {selectedHeroBp.creativeConcept.aestheticTitle}
                      </p>
                    </div>
                    <button
                      onClick={() => onQuickStartPreset(heroActivePreset)}
                      className="btn-electric btn-shimmer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md self-start sm:self-auto shrink-0"
                    >
                      <span>Open Blueprint in Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Swatches */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {selectedHeroBp.creativeConcept.colorPalette.map((swatch, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 transition-all hover:border-slate-700">
                        <div
                          className="h-10 w-full rounded-lg shadow-inner ring-1 ring-black/40 mb-2"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div className="text-[11px] font-semibold text-slate-200 truncate">{swatch.name}</div>
                        <div className="text-[10px] font-mono text-cyan-400/90">{swatch.hex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof Strip */}
            <div className="mt-14 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold block mb-4">
                Trusted by Independent Planners, Boutique Agencies & Production Leads
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-gradient-cyan tabular-nums">$18M+</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Budgets Orchestrated</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">4 Pillars</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Execution Deliverables</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">12 Questions</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Anti-Hidden Fee Shields</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">100%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Day-of Role Alignment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PRODUCT WORKBENCH PREVIEW */}
        <section id="preview" className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-950/40 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Inside The Studio
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mt-1">
                A Unified Command Center for Every Event Constraint
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Preview how PlanIQ dynamically transforms raw event constraints into four integrated, execution-ready deliverables.
              </p>
            </div>

            {/* Interactive Preview Frame */}
            <div className="glass-card rounded-2xl p-5 sm:p-7 shadow-2xl relative border border-indigo-500/20">
              {/* Tab selector */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInteractivePreviewTab('concept')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'concept'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    1. Creative Concept
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('budget')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'budget'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    2. Dynamic Budget Table
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('timeline')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'timeline'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    3. Milestones & Run of Show
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('vendors')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'vendors'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    4. Vendor Vetting Kit
                  </button>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open Full Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tab 1 Teaser */}
              {interactivePreviewTab === 'concept' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                    <span className="text-[11px] font-mono uppercase text-cyan-400 font-semibold">
                      Aesthetic Manifesto
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-white mt-1">
                      Ethereal Botanical Minimalist & Heritage Warmth
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Clean architectural silhouettes frame organic wildflower cascades, muted blush palettes, and textured raw linen, harmonizing traditional ceremonial richness with relaxed garden-party sociability.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { name: 'Oyster Linen', hex: '#EDE8E1', role: 'Neutral Grounding' },
                      { name: 'Blush Terracotta', hex: '#D99B82', role: 'Warm Accent' },
                      { name: 'Muted Sage', hex: '#8C9B86', role: 'Botanical Harmony' },
                      { name: 'Brushed Brass', hex: '#C29F5D', role: 'Metallic Hardware' },
                      { name: 'Smoked Slate', hex: '#2A2928', role: 'High-Contrast' },
                    ].map((sw, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                        <div
                          className="h-12 w-full rounded-lg mb-2 ring-1 ring-black/20"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="text-[11px] font-semibold text-slate-200 truncate">{sw.name}</div>
                        <div className="text-[10px] text-cyan-400/90 font-mono">{sw.hex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2 Teaser */}
              {interactivePreviewTab === 'budget' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Total Budget</span>
                      <div className="font-mono text-xl font-bold text-white mt-1">$45,000</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Per-Guest Ratio</span>
                      <div className="font-mono text-xl font-bold text-white mt-1">$300 / guest</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Contingency Reserve</span>
                      <div className="font-mono text-xl font-bold text-emerald-400 mt-1">$3,600 (8%)</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { cat: 'Food & Beverage', pct: '34%', amt: '$15,300', tip: 'Family-style platters cut server staffing by 25%.' },
                      { cat: 'Venue & Facilities', pct: '22%', amt: '$9,900', tip: 'Friday/Sunday crossover saves up to 30% on lawn access.' },
                      { cat: 'Decor & Spatial Lighting', pct: '16%', amt: '$7,200', tip: 'Repurpose ceremony arch flowers to reception sweetheart table.' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{row.cat}</span>
                          <span className="font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded text-[10px] border border-cyan-500/20">
                            {row.pct}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 italic">{row.tip}</div>
                        <div className="font-mono font-bold text-white tabular-nums">{row.amt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3 Teaser */}
              {interactivePreviewTab === 'timeline' && (
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { time: '08:00 AM – 10:30 AM', role: 'Logistics Director', act: 'Vendor Load-In & Structural Rigging', zone: 'Banquet Hall & Lawn' },
                    { time: '10:30 AM – 12:30 PM', role: 'Stage Manager', act: 'Tablescape Styling, Florals & Audio Soundcheck', zone: 'Indoor Banquet Space' },
                    { time: '03:30 PM – 04:15 PM', role: 'Master of Ceremonies', act: 'Wedding Ceremony & Vow Exchange', zone: 'Outdoor Lawn Centerpiece' },
                    { time: '06:00 PM – 07:30 PM', role: 'Catering Lead', act: 'Family-Style Fusion Dinner & Curated Speeches', zone: 'Indoor Banquet Hall' },
                  ].map((blk, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2 font-sans">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400 text-xs font-semibold">{blk.time}</span>
                        <span className="font-semibold text-white text-xs">{blk.act}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">{blk.zone}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-200 text-[10px] font-medium border border-slate-700">
                          {blk.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4 Teaser */}
              {interactivePreviewTab === 'vendors' && (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <span className="text-cyan-400 font-mono text-[11px] font-semibold block mb-1">
                      Catering & Beverage Vetting Question Q1
                    </span>
                    <h4 className="font-semibold text-white text-sm">
                      "Are service charges, admin fees, and server gratuities bundled, or is gratuity billed separately on top of the 22% admin fee?"
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-slate-300">
                        <strong className="text-emerald-400 block mb-0.5">Green Flag</strong>
                        "Our proposal clearly itemizes our 20% operational charge, which covers full living wage gratuity and liability insurance—no surprise extra tip required."
                      </div>
                      <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/30 text-slate-300">
                        <strong className="text-red-400 block mb-0.5">Red Flag</strong>
                        "The proposal shows labor; gratuity is discretionary and billed post-event, along with a variable fuel surcharge."
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <button
                  onClick={onGoToLogin}
                  className="btn-electric btn-shimmer inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold shadow-md"
                >
                  <span>Sign In to Access All 4 Deliverables</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE CAPABILITIES (BENTO GRID) */}
        <section id="features" className="py-16 md:py-24 border-b border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Architectural Capabilities
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mt-1">
                Engineered for High-Stakes Gatherings
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Every tool is purpose-built to eliminate operational vulnerabilities before doors open.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-4 shadow-sm shadow-indigo-500/10">
                    <Palette className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    01. Strategic Creative Conception
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    Bespoke aesthetic manifestos, 5-color architectural palettes with HEX codes, and 3 signature interactive elements crafted for your specific attendee demographics.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-indigo-400 font-medium">
                  Zero generic Pinterest tropes; genuine spatial cohesion.
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4 shadow-sm shadow-emerald-500/10">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    02. Forensic Capital Allocation
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    7-pillar mathematical budget modeling with dynamic sliders, live per-guest calculations, custom line item additions, and 2 proven cost-optimization tips per category.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-emerald-400 font-medium">
                  Multi-currency support: USD, INR, EUR, GBP, CAD, AUD, JPY.
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-4 shadow-sm shadow-cyan-500/10">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    03. Dual-Phased Master Timelines
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    Backward planning milestones from months out with task checkoffs, plus minute-by-minute day-of run of show filterable by designated operational roles.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-cyan-400 font-medium">
                  Print-ready run-of-show format for physical binders.
                </div>
              </div>

              {/* Card 4 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 mb-4 shadow-sm shadow-blue-500/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    04. Anti-Hidden Fee Vetting Kits
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    Dossiers across Catering, Photo/Cinema, Venue, and Decor. Exact booking deadlines, scopes of work, and forensic vetting questions with green/red flags.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-blue-400 font-medium">
                  Eliminates unexpected admin surcharges and overtime traps.
                </div>
              </div>

              {/* Card 5 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 mb-4 shadow-sm shadow-violet-500/10">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    05. RFP Proposal Decision Evaluator
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    Log and benchmark vendor proposals side-by-side with objective ratings on reliability, aesthetic match, scope completeness, and contract safety.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-violet-400 font-medium">
                  Side-by-side quote comparison matrix for informed awards.
                </div>
              </div>

              {/* Card 6 */}
              <div className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-4 shadow-sm shadow-cyan-500/10">
                    <Printer className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    06. Executive Handover & Export
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    Export complete blueprints formatted in clean Markdown, calendar ICS sync, or print field binders for day-of staff.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-cyan-400 font-medium">
                  Immediate handover to clients, coordinators, and suppliers.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. METHODOLOGY / HOW IT WORKS */}
        <section id="methodology" className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Operating Methodology
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mt-1">
                The 3-Phase Execution Architecture
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                From initial client brief to final load-out, every step is mathematically mapped and role-assigned.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
                <span className="font-mono text-2xl font-bold text-gradient-cyan block mb-2">Phase 01</span>
                <h3 className="text-lg font-bold text-white">Constraint Calibration</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Input event typology, total budget, guest count, spatial setting, and lead time. The system establishes baseline per-guest targets and reserve caps.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
                <span className="font-mono text-2xl font-bold text-gradient-electric block mb-2">Phase 02</span>
                <h3 className="text-lg font-bold text-white">Algorithmic & AI Blueprinting</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  The engine dynamically synthesizes aesthetic manifestos, palettes, 7-pillar budget allocations, backward milestones, and contract vetting kits.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
                <span className="font-mono text-2xl font-bold text-gradient-cyan block mb-2">Phase 03</span>
                <h3 className="text-lg font-bold text-white">Day-of Field Execution</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Command the event through role-filtered run of shows. Coordinators, audio leads, and catering leads execute against unambiguous operational cues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MASTER PRESETS */}
        <section id="presets" className="py-16 md:py-24 border-b border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Turnkey Director Presets
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mt-1">
                Explore Calibrated Archetypes
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Fully populated with creative concepts, 7-category budgets, milestones, run of shows, and vetting dossiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'preset-fusion-wedding',
                  title: 'Modern Fusion Wedding',
                  budget: '$45,000',
                  guests: '150 Guests',
                  theme: 'Minimalist pastel with warm brass & botanical architecture',
                  desc: 'Dual-heritage ceremonies, open lawn cocktail hour, family-style fusion dining, and midnight street food cart.',
                  badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
                },
                {
                  id: 'preset-30th-birthday',
                  title: '30th Birthday Celebration',
                  budget: '$12,000',
                  guests: '60 Guests',
                  theme: 'Moody editorial lounge, vinyl bar & bespoke cocktail pairings',
                  desc: 'Urban brick loft, guest vinyl request crates, liquid smoke mixology lab, and high-contrast flash polaroid archive.',
                  badgeColor: 'border-violet-500/30 text-violet-300 bg-violet-500/10',
                },
                {
                  id: 'preset-tech-gala',
                  title: 'Tech Community Gala & Awards',
                  budget: '$35,000',
                  guests: '250 Guests',
                  theme: 'Cyber-clean minimal, generative projection art & lightning pitches',
                  desc: '24ft LED video wall, audio-reactive NFC community badges, nitrogen culinary stations, and 90-second lightning pitch stage.',
                  badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10',
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="text-cyan-400 font-mono font-bold text-sm">{p.budget}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${p.badgeColor}`}>{p.guests}</span>
                    </div>
                    <h3 className="font-serif-title text-xl font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-xs text-slate-400 italic">{p.theme}</p>
                    <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">{p.desc}</p>
                  </div>

                  <button
                    onClick={() => onQuickStartPreset(p.id)}
                    className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white hover:border-cyan-500/40 transition-all"
                  >
                    <span>Launch Blueprint in Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. PRICING TIERS */}
        <section id="pricing" className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Transparent Studio Access
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mt-1">
                Predictable Plans for Every Stage
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Choose the access level that matches your event production volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Tier 1 */}
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Starter Producer
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-white">$0</div>
                  <span className="text-xs text-slate-500">Free prototyping tier</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>3 Master Presets Included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Dynamic 7-pillar budget table</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Full Markdown & iCal export</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Start Prototyping
                </button>
              </div>

              {/* Tier 2 (Featured) */}
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border-2 border-cyan-500 relative shadow-2xl shadow-cyan-500/20">
                <div className="absolute -top-3 right-5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-md">
                  Most Popular
                </div>

                <div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                    Studio Director
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-white">$49</div>
                  <span className="text-xs text-slate-400">per month / billed annually</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Unlimited custom blueprints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Gemini AI bespoke concept synthesis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Day-of role run-of-show print engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Interactive RFP candidate matrix</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="btn-electric btn-shimmer mt-8 w-full rounded-xl py-2.5 text-xs font-bold"
                >
                  Get Studio Access
                </button>
              </div>

              {/* Tier 3 */}
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Enterprise Agency
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-white">$199</div>
                  <span className="text-xs text-slate-500">per month / unlimited team</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Dedicated custom agency branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Multi-user collaboration & permissions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Priority SLA & custom master templates</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Contact Agency Desk
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ ACCORDION */}
        <section id="faq" className="py-16 md:py-24 border-b border-slate-800/80">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Common Inquiries
              </span>
              <h2 className="font-serif-title text-3xl font-bold text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="glass-card rounded-xl border border-slate-800 transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-slate-200 hover:text-white"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-slate-800/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. BOTTOM CONVERSION CALL TO ACTION */}
        <section className="py-16 md:py-24 relative overflow-hidden text-center bg-gradient-to-b from-slate-900/60 to-[#080b14]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-500/40 text-cyan-400 mb-4 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-serif-title text-3xl sm:text-5xl font-bold text-white">
              Eliminate Event Operational Chaos Today
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join master planners who deliver flawless executions with forensic budgets, minute-by-minute run of shows, and airtight vendor vetting.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={onGoToLogin}
                className="btn-electric btn-shimmer inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold transition-all shadow-xl"
              >
                <span>Enter PlanIQ Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. PRODUCT FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#080b14]/90 py-12 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-serif-title text-slate-200 text-base font-bold">PlanIQ</span>
            <span>· Master Event Strategy & Logistics Suite</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <a href="#features" className="hover:text-cyan-300 transition-colors">Features</a>
            <a href="#methodology" className="hover:text-cyan-300 transition-colors">Methodology</a>
            <a href="#pricing" className="hover:text-cyan-300 transition-colors">Pricing</a>
            <button onClick={onGoToLogin} className="hover:text-cyan-400 transition-colors">Sign In</button>
          </div>

          <div>
            <span>© 2026 PlanIQ Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
