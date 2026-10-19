import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  UserCheck,
  AlertCircle,
  MapPin,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Shield,
  Tag,
} from 'lucide-react';
import type { MilestoneCheckpoint, RunOfShowBlock } from '../types/blueprint.ts';

interface DeliverableTimelineProps {
  milestones: MilestoneCheckpoint[];
  runOfShow: RunOfShowBlock[];
  onToggleTask: (phaseId: string, taskId: string) => void;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
}

// Distinct vibrant styling per designated role
const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Master of Ceremonies': {
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  'Catering Lead': {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  'Photo/Video Lead': {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  'Logistics Director': {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  'Stage Manager': {
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  'Event Host / VIP': {
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

const DEFAULT_ROLE_STYLE = {
  bg: 'bg-amber-500/15',
  text: 'text-amber-300',
  border: 'border-amber-500/30',
  dot: 'bg-amber-400',
};

export const DeliverableTimeline: React.FC<DeliverableTimelineProps> = ({
  milestones,
  runOfShow,
  onToggleTask,
  selectedRole: controlledSelectedRole,
  onSelectRole: controlledOnSelectRole,
}) => {
  const [activeView, setActiveView] = useState<'runOfShow' | 'backward'>('runOfShow');
  const [internalSelectedRole, setInternalSelectedRole] = useState<string>('All Roles');

  const selectedRole = controlledSelectedRole !== undefined ? controlledSelectedRole : internalSelectedRole;
  const handleRoleChange = (role: string) => {
    if (controlledOnSelectRole) {
      controlledOnSelectRole(role);
    } else {
      setInternalSelectedRole(role);
    }
  };

  const allTasks = milestones.flatMap((m) => m.tasks);
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const progressPct = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const roles = [
    'All Roles',
    'Logistics Director',
    'Master of Ceremonies',
    'Stage Manager',
    'Catering Lead',
    'Photo/Video Lead',
    'Event Host / VIP',
  ];

  const filteredRunOfShow =
    selectedRole === 'All Roles'
      ? runOfShow
      : runOfShow.filter((block) => block.leadRole === selectedRole);

  return (
    <section className="space-y-8 relative">
      {/* View Switcher Bento Header */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
            <Clock className="h-4 w-4" />
            <span>Deliverable 03 · Operational Timelines</span>
          </div>
          <h2 className="font-serif-title text-2xl font-normal text-zinc-100 mt-1">
            Execution Timelines & Day-of Orchestration
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Chronological run-of-show orchestration and backward milestone checkpoints.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950 p-1.5 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveView('runOfShow')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === 'runOfShow'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Day-of Run of Show ({runOfShow.length})</span>
          </button>
          <button
            onClick={() => setActiveView('backward')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === 'backward'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Backward Milestones ({completedTasks}/{allTasks.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAY-OF RUN OF SHOW (Proper Chronological Vertical Stepper) */}
      {activeView === 'runOfShow' && (
        <div className="space-y-6">
          {/* Role Filter Bar */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Filter className="h-4 w-4 text-amber-400" />
              <span className="font-semibold">Filter by Lead Role:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {roles.map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap shrink-0 transition-all font-semibold ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 shadow-md scale-105'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/5'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Stepper Container */}
          <div className="relative pl-6 sm:pl-10 space-y-6">
            {/* Connected Vertical Glowing Line */}
            <div className="absolute left-[13px] sm:left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-500 via-amber-400/30 to-zinc-800 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />

            {filteredRunOfShow.map((block, idx) => {
              const roleStyle = ROLE_BADGE_STYLES[block.leadRole] || DEFAULT_ROLE_STYLE;

              return (
                <div key={block.id} className="relative group">
                  {/* Glowing Stepper Node */}
                  <div className="absolute -left-[24px] sm:-left-[32px] top-5 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                      <div className={`h-2 w-2 rounded-full ${roleStyle.dot}`} />
                    </div>
                  </div>

                  {/* Card Content with Bento Glassmorphism */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl transition-all duration-200 hover:scale-[1.01] hover:border-amber-400/40">
                    {/* Header: Time Window, Duration, Role, and Location */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Time Window Pill */}
                        <div className="font-mono text-xs font-bold text-zinc-100 bg-zinc-950 px-3 py-1 rounded-xl border border-white/10 shadow-inner tabular-nums">
                          {block.startTime} – {block.endTime}
                        </div>

                        {/* Duration Pill */}
                        <span className="font-mono text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-lg border border-white/5">
                          {block.durationMinutes}m
                        </span>

                        {/* Vibrant Role Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border} shadow-sm`}
                        >
                          <UserCheck className="h-3 w-3" />
                          <span>{block.leadRole}</span>
                        </span>
                      </div>

                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-zinc-200">{block.location}</span>
                      </div>
                    </div>

                    {/* Main Activity Title */}
                    <div className="mt-3">
                      <h4 className="text-base font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                        {block.activity}
                      </h4>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs">
                      <div className="rounded-xl bg-zinc-950/70 p-3 border border-white/5">
                        <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block mb-1">
                          Operational Cues & Scripting
                        </span>
                        <p className="text-zinc-300 text-xs leading-relaxed">{block.cuesAndNotes}</p>
                      </div>

                      <div className="rounded-xl bg-zinc-950/70 p-3 border border-white/5">
                        <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                          Designated Staging & Gear
                        </span>
                        <p className="text-zinc-300 text-xs leading-relaxed">
                          {block.equipmentOrSupplies || 'Standard department equipment'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: BACKWARD MILESTONES (Interactive Planning Checkpoints) */}
      {activeView === 'backward' && (
        <div className="space-y-6">
          {/* Progress Header Card */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                Milestone Readiness Index
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-extrabold text-zinc-100">
                  {completedTasks} of {allTasks.length} Completed
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  {progressPct}% Executed
                </span>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <div className="h-2.5 w-full rounded-full bg-zinc-950 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phase Accordion Checkpoints */}
          <div className="space-y-5">
            {milestones.map((phase) => (
              <div
                key={phase.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2.5 py-0.5 rounded">
                      {phase.timeframe}
                    </span>
                    <h3 className="text-base font-bold text-zinc-100 mt-1.5">{phase.phase}</h3>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {phase.tasks.filter((t) => t.completed).length} / {phase.tasks.length} Checkpoints Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(phase.id, task.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        task.completed
                          ? 'border-emerald-500/30 bg-emerald-950/20 text-zinc-300'
                          : 'border-white/5 bg-zinc-950/70 hover:border-white/20 text-zinc-200'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          task.completed
                            ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                            : 'border-white/20 bg-zinc-900'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              task.completed ? 'line-through text-zinc-400' : 'text-zinc-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                            {task.category}
                          </span>
                        </div>
                        {task.deadlineNote && (
                          <p className="mt-1 text-[11px] text-zinc-400">{task.deadlineNote}</p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                        {task.ownerRole}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
