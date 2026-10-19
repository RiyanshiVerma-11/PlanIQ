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
} from 'lucide-react';
import { formatCurrency } from '../utils/blueprintEngine.ts';

interface ProductLandingPageProps {
  onGoToLogin: () => void;
  onQuickStartPreset: (presetId: string) => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({
  onGoToLogin,
  onQuickStartPreset,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interactivePreviewTab, setInteractivePreviewTab] = useState<'concept' | 'budget' | 'timeline' | 'vendors'>('concept');

  const faqs = [
    {
      q: 'How does PlanIQ protect against hidden vendor fees?',
      a: 'Every blueprint comes equipped with a Procurement Defense Kit containing 3 forensic vetting questions per vendor category. It spells out exact "Green Flag" answers vs "Red Flag" traps (such as unbundled 22% admin fees, surprise corkage surcharges, or punitive 30-minute overtime rates), along with staffing benchmarks and non-negotiable scopes of work.',
    },
    {
      q: 'Can I export the timeline and run-of-show for printing on event day?',
      a: 'Yes. With one click, you can export the full dossier as structured Markdown or trigger our dedicated print engine, which produces clean, role-specific day-of run-of-show binders for your clipboards and coordinators.',
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* 1. TOP BAR / HEADER CONTRACT */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-stone-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-serif-title tracking-normal text-xl">PlanIQ</span>
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs tracking-wide uppercase font-medium text-stone-400">
            <a href="#features" className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#methodology" className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0">
              Methodology
            </a>
            <a href="#presets" className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0">
              Presets
            </a>
            <a href="#pricing" className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
            <a href="#faq" className="hover:text-stone-100 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: 1 primary action + Log In */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span>Log In</span>
            </button>
            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-stone-800/80">
          {/* Subtle ambient amber lighting */}
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Operating System for Master Event Strategists</span>
            </div>

            <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-100 max-w-4xl mx-auto leading-tight">
              Architect Unforgettable Events With Execution-Grade Blueprints
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-stone-300 max-w-2xl mx-auto">
              Replace chaotic spreadsheets with forensic 7-pillar budget allocations, minute-by-minute day-of run of shows, bespoke creative concepts, and contract-hardened vendor vetting kits.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span>Launch Director Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#preview"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/90 px-6 py-3.5 text-sm font-medium text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
              >
                <span>Explore Live Workbench</span>
              </a>
            </div>

            {/* Social Proof Strip */}
            <div className="mt-14 pt-8 border-t border-stone-800/60 max-w-4xl mx-auto">
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold block mb-3">
                Trusted by Independent Planners, Boutique Agencies & Production Leads
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-2">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-stone-100 tabular-nums">$18M+</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Budgets Orchestrated</div>
                </div>
                <div className="p-2">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-stone-100 tabular-nums">4 Pillars</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Execution Deliverables</div>
                </div>
                <div className="p-2">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-stone-100 tabular-nums">12 Questions</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Anti-Hidden Fee Shields</div>
                </div>
                <div className="p-2">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-stone-100 tabular-nums">100%</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Day-of Role Alignment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PRODUCT WORKBENCH PREVIEW */}
        <section id="preview" className="py-16 md:py-24 border-b border-stone-800/80 bg-stone-950/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Inside The Studio
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100 mt-1">
                A Unified Command Center for Every Event Constraint
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-400">
                Preview how PlanIQ dynamically transforms raw event constraints into four integrated, execution-ready deliverables.
              </p>
            </div>

            {/* Interactive Preview Frame */}
            <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 sm:p-7 shadow-2xl relative">
              {/* Tab selector */}
              <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-6 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInteractivePreviewTab('concept')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'concept'
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    1. Creative Concept
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('budget')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'budget'
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    2. Dynamic Budget Table
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('timeline')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'timeline'
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    3. Milestones & Run of Show
                  </button>
                  <button
                    onClick={() => setInteractivePreviewTab('vendors')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      interactivePreviewTab === 'vendors'
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    4. Vendor Vetting Kit
                  </button>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open Full Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tab 1 Teaser */}
              {interactivePreviewTab === 'concept' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-5">
                    <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold">
                      Aesthetic Manifesto
                    </span>
                    <h3 className="font-serif-title text-xl font-normal text-stone-100 mt-1">
                      Ethereal Botanical Minimalist & Heritage Warmth
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
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
                      <div key={idx} className="rounded-lg border border-stone-800 bg-stone-950 p-2.5">
                        <div
                          className="h-12 w-full rounded mb-2 ring-1 ring-black/20"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="text-[11px] font-semibold text-stone-200 truncate">{sw.name}</div>
                        <div className="text-[10px] text-amber-400/90 font-mono">{sw.hex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2 Teaser */}
              {interactivePreviewTab === 'budget' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-stone-950 p-4 border border-stone-800">
                      <span className="text-[11px] text-stone-400">Total Budget</span>
                      <div className="font-mono text-xl font-bold text-stone-100 mt-1">$45,000</div>
                    </div>
                    <div className="rounded-xl bg-stone-950 p-4 border border-stone-800">
                      <span className="text-[11px] text-stone-400">Per-Guest Ratio</span>
                      <div className="font-mono text-xl font-bold text-stone-100 mt-1">$300 / guest</div>
                    </div>
                    <div className="rounded-xl bg-stone-950 p-4 border border-stone-800">
                      <span className="text-[11px] text-stone-400">Contingency Reserve</span>
                      <div className="font-mono text-xl font-bold text-emerald-400 mt-1">$3,600 (8%)</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { cat: 'Food & Beverage', pct: '34%', amt: '$15,300', tip: 'Family-style platters cut server staffing by 25%.' },
                      { cat: 'Venue & Facilities', pct: '22%', amt: '$9,900', tip: 'Friday/Sunday crossover saves up to 30% on lawn access.' },
                      { cat: 'Decor & Spatial Lighting', pct: '16%', amt: '$7,200', tip: 'Repurpose ceremony arch flowers to reception sweetheart table.' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800/80 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-200">{row.cat}</span>
                          <span className="font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px]">
                            {row.pct}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 italic">{row.tip}</div>
                        <div className="font-mono font-bold text-stone-100 tabular-nums">{row.amt}</div>
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
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800/80 gap-2 font-sans">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-amber-400 text-xs">{blk.time}</span>
                        <span className="font-semibold text-stone-100 text-xs">{blk.act}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-stone-400">{blk.zone}</span>
                        <span className="rounded bg-stone-800 px-2 py-0.5 text-stone-200 text-[10px] font-medium">
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
                  <div className="rounded-xl border border-stone-800 bg-stone-950 p-4">
                    <span className="text-amber-400 font-mono text-[11px] font-semibold block mb-1">
                      Catering & Beverage Vetting Question Q1
                    </span>
                    <h4 className="font-semibold text-stone-100 text-sm">
                      "Are service charges, admin fees, and server gratuities bundled, or is gratuity billed separately on top of the 22% admin fee?"
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/30 text-stone-300">
                        <strong className="text-emerald-400 block mb-0.5">Green Flag</strong>
                        "Our proposal clearly itemizes our 20% operational charge, which covers full living wage gratuity and liability insurance—no surprise extra tip required."
                      </div>
                      <div className="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-stone-300">
                        <strong className="text-red-400 block mb-0.5">Red Flag</strong>
                        "The proposal shows labor; gratuity is discretionary and billed post-event, along with a variable fuel surcharge."
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-stone-800 text-center">
                <button
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors"
                >
                  <span>Sign In to Access All 4 Deliverables</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE CAPABILITIES (BENTO GRID) */}
        <section id="features" className="py-16 md:py-24 border-b border-stone-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Architectural Capabilities
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100 mt-1">
                Engineered for High-Stakes Gatherings
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-400">
                Every tool is purpose-built to eliminate operational vulnerabilities before doors open.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                    <Palette className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    01. Strategic Creative Conception
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    Bespoke aesthetic manifestos, 5-color architectural palettes with HEX codes, and 3 signature interactive elements crafted for your specific attendee demographics.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Zero generic Pinterest tropes; genuine spatial cohesion.
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    02. Forensic Capital Allocation
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    7-pillar mathematical budget modeling with dynamic sliders, live per-guest calculations, custom line item additions, and 2 proven cost-optimization tips per category.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Multi-currency support: USD, INR, EUR, GBP, CAD, AUD, JPY.
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    03. Dual-Phased Master Timelines
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    Backward planning milestones from months out with task checkoffs, plus minute-by-minute day-of run of show filterable by designated operational roles.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Print-ready run-of-show format for physical binders.
                </div>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    04. Anti-Hidden Fee Vetting Kits
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    Dossiers across Catering, Photo/Cinema, Venue, and Decor. Exact booking deadlines, scopes of work, and 3 vetting questions with green/red flags.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Eliminates unexpected admin surcharges and overtime traps.
                </div>
              </div>

              {/* Card 5 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    05. RFP Proposal Decision Evaluator
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    Log and benchmark vendor proposals side-by-side with objective ratings on reliability, aesthetic match, scope completeness, and contract safety.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Side-by-side quote comparison matrix for informed awards.
                </div>
              </div>

              {/* Card 6 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                    <Printer className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">
                    06. Executive Handover & Export
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                    Export complete blueprints formatted in clean Markdown, copy directly to your clipboard, or print field binders for day-of staff.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                  Immediate handover to clients, coordinators, and suppliers.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. METHODOLOGY / HOW IT WORKS */}
        <section id="methodology" className="py-16 md:py-24 border-b border-stone-800/80 bg-stone-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Operating Methodology
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100 mt-1">
                The 3-Phase Execution Architecture
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-400">
                From initial client brief to final load-out, every step is mathematically mapped and role-assigned.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
                <span className="font-mono text-2xl font-bold text-amber-400 block mb-2">Phase 01</span>
                <h3 className="text-lg font-semibold text-stone-100">Constraint Calibration</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                  Input event typology, total budget, guest count, spatial setting, and lead time. The system establishes baseline per-guest targets and reserve caps.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
                <span className="font-mono text-2xl font-bold text-amber-400 block mb-2">Phase 02</span>
                <h3 className="text-lg font-semibold text-stone-100">Algorithmic & AI Blueprinting</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                  The engine dynamically synthesizes aesthetic manifestos, palettes, 7-pillar budget allocations, backward milestones, and contract vetting kits.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
                <span className="font-mono text-2xl font-bold text-amber-400 block mb-2">Phase 03</span>
                <h3 className="text-lg font-semibold text-stone-100">Day-of Field Execution</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-300">
                  Command the event through role-filtered run of shows. Coordinators, audio leads, and catering leads execute against unambiguous operational cues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MASTER PRESETS */}
        <section id="presets" className="py-16 md:py-24 border-b border-stone-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Turnkey Director Presets
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100 mt-1">
                Explore Calibrated Archetypes
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-400">
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
                },
                {
                  id: 'preset-30th-birthday',
                  title: '30th Birthday Celebration',
                  budget: '$12,000',
                  guests: '60 Guests',
                  theme: 'Moody editorial lounge, vinyl bar & bespoke cocktail pairings',
                  desc: 'Urban brick loft, guest vinyl request crates, liquid smoke mixology lab, and high-contrast flash polaroid archive.',
                },
                {
                  id: 'preset-tech-gala',
                  title: 'Tech Community Gala & Awards',
                  budget: '$35,000',
                  guests: '250 Guests',
                  theme: 'Cyber-clean minimal, generative projection art & lightning pitches',
                  desc: '24ft LED video wall, audio-reactive NFC community badges, nitrogen culinary stations, and 90-second lightning pitch stage.',
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                      <span className="text-amber-400 font-mono font-semibold">{p.budget}</span>
                      <span>{p.guests}</span>
                    </div>
                    <h3 className="font-serif-title text-xl font-normal text-stone-100">{p.title}</h3>
                    <p className="mt-2 text-xs text-stone-400 italic">{p.theme}</p>
                    <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed">{p.desc}</p>
                  </div>

                  <button
                    onClick={() => onQuickStartPreset(p.id)}
                    className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
                  >
                    <span>Launch Blueprint in Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. PRICING TIERS */}
        <section id="pricing" className="py-16 md:py-24 border-b border-stone-800/80 bg-stone-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Transparent Studio Access
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100 mt-1">
                Predictable Plans for Every Stage
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-400">
                Choose the access level that matches your event production volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Tier 1 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Starter Producer
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-stone-100">$0</div>
                  <span className="text-xs text-stone-500">Free prototyping tier</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>3 Master Presets Included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Dynamic 7-pillar budget table</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Full Markdown export</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="mt-8 w-full rounded-xl border border-stone-700 bg-stone-800 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700"
                >
                  Start Prototyping
                </button>
              </div>

              {/* Tier 2 (Featured) */}
              <div className="rounded-2xl border-2 border-amber-500 bg-stone-900 p-6 flex flex-col justify-between shadow-xl shadow-amber-500/10 relative">
                <div className="absolute -top-3 right-5 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-bold text-stone-950 uppercase tracking-wide">
                  Most Popular
                </div>

                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Studio Director
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-stone-100">$49</div>
                  <span className="text-xs text-stone-400">per month / billed annually</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-stone-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Unlimited custom blueprints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Gemini AI bespoke concept synthesis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Day-of role run-of-show print engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Interactive RFP candidate matrix</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="mt-8 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-md"
                >
                  Get Studio Access
                </button>
              </div>

              {/* Tier 3 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Enterprise Agency
                  </span>
                  <div className="mt-3 font-mono text-3xl font-bold text-stone-100">$199</div>
                  <span className="text-xs text-stone-500">per month / unlimited team</span>

                  <ul className="mt-6 space-y-2.5 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Dedicated custom agency branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Multi-user collaboration & permissions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Priority SLA & custom master templates</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={onGoToLogin}
                  className="mt-8 w-full rounded-xl border border-stone-700 bg-stone-800 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700"
                >
                  Contact Agency Desk
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ ACCORDION */}
        <section id="faq" className="py-16 md:py-24 border-b border-stone-800/80">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Common Inquiries
              </span>
              <h2 className="font-serif-title text-3xl font-normal text-stone-100 mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-800 bg-stone-900/50 transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-stone-200 hover:text-white"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-stone-400 transition-transform ${
                          isOpen ? 'rotate-180 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm leading-relaxed text-stone-300 border-t border-stone-800/60 pt-3">
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
        <section className="py-16 md:py-24 relative overflow-hidden text-center bg-gradient-to-b from-stone-900/60 to-stone-950">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-stone-100">
              Eliminate Event Operational Chaos Today
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
              Join master planners who deliver flawless executions with forensic budgets, minute-by-minute run of shows, and airtight vendor vetting.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-xl hover:shadow-amber-500/25"
              >
                <span>Enter PlanIQ Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. PRODUCT FOOTER */}
      <footer className="border-t border-stone-800 bg-stone-950 py-12 text-xs text-stone-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-serif-title text-stone-300 text-sm">PlanIQ</span>
            <span>· Master Event Strategy & Logistics Suite</span>
          </div>

          <div className="flex items-center gap-6 text-stone-400">
            <a href="#features" className="hover:text-stone-200 transition-colors">Features</a>
            <a href="#methodology" className="hover:text-stone-200 transition-colors">Methodology</a>
            <a href="#pricing" className="hover:text-stone-200 transition-colors">Pricing</a>
            <button onClick={onGoToLogin} className="hover:text-amber-400 transition-colors">Sign In</button>
          </div>

          <div>
            <span>© 2026 PlanIQ Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
