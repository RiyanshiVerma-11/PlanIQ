import React, { useState } from 'react';
import { Palette, Layers, Sparkles, Copy, Check, Info, Compass, Shield, HeartHandshake, Eye } from 'lucide-react';
import type { CreativeConcept } from '../types/blueprint.ts';

interface DeliverableConceptProps {
  concept: CreativeConcept;
  eventType: string;
}

export const DeliverableConcept: React.FC<DeliverableConceptProps> = ({ concept, eventType }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyToClipboard = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setToastMessage(`Copied ${name} (${hex}) to clipboard!`);
    setTimeout(() => {
      setCopiedHex(null);
      setToastMessage(null);
    }, 2200);
  };

  return (
    <section className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-zinc-900/95 px-4 py-3 text-xs font-semibold text-amber-300 shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Check className="h-3 w-3" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Aesthetic Manifesto Bento Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8 backdrop-blur-md shadow-xl">
        {/* Subtle Ambient Violet / Amber Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/15 via-violet-600/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/10 via-amber-500/5 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Deliverable 01 · Strategic Creative Direction</span>
          </div>

          <h2 className="font-serif-title text-2xl md:text-3xl lg:text-4xl font-normal text-zinc-100 tracking-tight">
            {concept.aestheticTitle}
          </h2>

          <p className="mt-2 text-base md:text-lg leading-relaxed text-zinc-300 max-w-4xl font-normal">
            {concept.aestheticManifesto}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
              <Compass className="h-3.5 w-3.5" />
              <span>Tailored for {eventType}</span>
            </span>
            <span className="text-xs text-zinc-400">
              Curated across 5 architectural color harmonies, 3 spatial focal installations, and 3 sensory activities.
            </span>
          </div>
        </div>
      </div>

      {/* Curated Color Scheme Swatches (Large Rectangular Aesthetic Cards) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Curated Color Architecture</h3>
              <p className="text-xs text-zinc-400">Harmonized 5-tier spectrum calibrated for mood, lighting, and textiles</p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Click card to copy HEX</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {concept.colorPalette.map((swatch, idx) => {
            const isCopied = copiedHex === swatch.hex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => copyToClipboard(swatch.hex, swatch.name)}
                className="group relative flex flex-col rounded-xl border border-white/10 bg-zinc-950/70 p-3.5 text-left transition-all duration-200 hover:scale-[1.02] hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 overflow-hidden"
              >
                {/* Large Visual Color Preview Block */}
                <div
                  className="h-28 w-full rounded-lg shadow-inner relative flex items-center justify-center transition-all overflow-hidden border border-black/20"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/15" />

                  {/* Copy Badge */}
                  <div
                    className={`rounded-full bg-zinc-950/85 px-3 py-1.5 text-xs font-mono font-medium backdrop-blur-md transition-all duration-200 shadow-md ${
                      isCopied
                        ? 'opacity-100 text-emerald-400 scale-105'
                        : 'opacity-0 group-hover:opacity-100 text-zinc-200 group-hover:scale-100'
                    }`}
                  >
                    {isCopied ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Copy className="h-3.5 w-3.5" /> Copy HEX
                      </span>
                    )}
                  </div>
                </div>

                {/* Swatch Info & Role */}
                <div className="mt-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-xs font-bold text-zinc-100 truncate">{swatch.name}</span>
                      <span className="font-mono text-[11px] font-semibold text-amber-400/90 tabular-nums">
                        {swatch.hex}
                      </span>
                    </div>
                    <span className="mt-1 inline-block text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                      {swatch.role}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 leading-snug line-clamp-3">
                    {swatch.notes}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decor Focal Points (3-Column Bento Cards) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-5 flex items-center gap-2.5 border-b border-white/5 pb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Decor Focal Points & Materiality Architecture</h3>
            <p className="text-xs text-zinc-400">Three high-impact spatial moments engineered for visual cadence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {concept.focalPoints.map((point, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-zinc-950/70 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-amber-400/40 hover:shadow-xl hover:shadow-black/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-amber-400 font-mono text-xs font-bold shadow-sm">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                    Spatial Zone
                  </span>
                </div>

                <h4 className="text-base font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {point.area}
                </h4>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">{point.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-400 block mb-1">
                  Tactile Materiality & Hardware
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{point.materiality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Signature Interactive Elements & Activities (3-Column Bento Grid) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                3 Signature Interactive Moments & Activities
              </h3>
              <p className="text-xs text-zinc-400">Custom engagement rituals tailored to guest psychology</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            Demographic Fit: {eventType}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {concept.interactiveElements.map((elem, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-zinc-950/70 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-amber-400/40 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                      {elem.title}
                    </h4>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] font-mono font-semibold uppercase text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                    {elem.targetMoment}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-zinc-300">{elem.description}</p>
              </div>

              <div className="mt-5 space-y-2.5 pt-3.5 border-t border-white/10 text-xs">
                <div className="rounded-lg bg-zinc-900/80 p-2.5 border border-white/5">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                    Guest Sensory Experience
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{elem.guestExperience}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/80 p-2.5 border border-white/5">
                  <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">
                    Logistical & Staffing Requirement
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{elem.logisticalRequirement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
