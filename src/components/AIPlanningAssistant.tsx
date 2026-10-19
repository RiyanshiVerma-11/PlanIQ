import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  X,
  ArrowRight,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import type { EventBlueprint } from '../types/blueprint.ts';
import type {
  AssistantMessage,
  AssistantActionSuggestion,
  AssistantChatResponse,
} from '../types/assistant.ts';
import { generateExpertAssistantResponse } from '../utils/assistantEngine.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

interface AIPlanningAssistantProps {
  blueprint: EventBlueprint;
  onApplyAction?: (action: AssistantActionSuggestion) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const AIPlanningAssistant: React.FC<AIPlanningAssistantProps> = ({
  blueprint,
  onApplyAction,
  onClose,
  isDrawer = false,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **PlanIQ GenAI Planning Assistant**.

I am tuned to your **${blueprint.constraints.eventName || blueprint.constraints.eventType}** (${blueprint.constraints.guestCount} guests, ${formatCurrency(blueprint.budgetBreakdown.totalBudget, blueprint.budgetBreakdown.currency)} budget in *${blueprint.constraints.locationSetting}*).

How can I help elevate your event today? You can ask for creative ideas, budget trimming advice, vendor vetting tactics, or day-of timeline flow!`,
      suggestions: [
        '💡 Suggest 3 unique interactive ideas for my guests',
        '💰 How can I trim 10% from my catering budget?',
        '⏱️ What are the lead role responsibilities on event day?',
        '📋 What hidden fees should I watch for in the venue contract?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedActionId, setAppliedActionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const contextPayload = {
      eventType: blueprint.constraints.eventType,
      eventName: blueprint.constraints.eventName,
      guestCount: blueprint.constraints.guestCount,
      totalBudget: blueprint.budgetBreakdown.totalBudget,
      currency: blueprint.budgetBreakdown.currency,
      locationSetting: blueprint.constraints.locationSetting,
      keyTheme: blueprint.constraints.keyTheme,
      timeRemainingMonths: blueprint.constraints.timeRemainingMonths,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: contextPayload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: AssistantChatResponse = await res.json();
        const assistantMsg: AssistantMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.reply,
          suggestions: data.suggestions,
          actionSuggestion: data.actionSuggestion,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }
    } catch {
      // Graceful fallback to client-side expert strategist engine
    } finally {
      setIsLoading(false);
    }

    // Client fallback
    const fallback = generateExpertAssistantResponse(textToSend, contextPayload);
    const fallbackMsg: AssistantMessage = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: fallback.reply,
      suggestions: fallback.suggestions,
      actionSuggestion: fallback.actionSuggestion,
    };
    setMessages((prev) => [...prev, fallbackMsg]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyAction = (action: AssistantActionSuggestion, msgId: string) => {
    if (onApplyAction) {
      onApplyAction(action);
      setAppliedActionId(msgId);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Chat reset. I am ready to advise on **${blueprint.constraints.eventName || blueprint.constraints.eventType}**. What would you like to explore?`,
        suggestions: [
          '💡 Personalized ideas for my setting',
          '💰 Budget optimization advice',
          '⏱️ Day-of timeline pacing check',
          '📋 Vendor contract defense questions',
        ],
      },
    ]);
  };

  const quickPromptTopics = [
    { label: 'Decor & Ideas', query: 'Suggest personalized decor and unique interactive guest moments for this event' },
    { label: 'Cut 10% Budget', query: 'How can I trim 10% from my budget without impacting the guest experience?' },
    { label: 'Vendor Questions', query: 'What red flags and hidden fees should I watch for when vetting vendors?' },
    { label: 'Timeline Check', query: 'Evaluate my day-of schedule and suggest ideal pacing between milestones' },
    { label: 'Rain Backup', query: 'What is the best contingency and weather emergency plan for this venue?' },
  ];

  return (
    <div
      className={`flex flex-col bg-[#080d1a] text-slate-100 ${
        isDrawer
          ? 'h-full w-full'
          : 'rounded-2xl border border-cyan-500/20 shadow-2xl h-[calc(100vh-140px)] max-h-[850px]'
      }`}
    >
      {/* Sleek, Clean Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 bg-[#0a0f20]/90 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#080d1a]">
              <Bot className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                PlanIQ AI Co-Planner
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live Context
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {blueprint.constraints.eventName || blueprint.constraints.eventType} · {blueprint.constraints.guestCount} guests · {formatCurrency(blueprint.budgetBreakdown.totalBudget, blueprint.budgetBreakdown.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Reset Conversation"
            aria-label="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message History Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-[#080d1a]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-lg shadow-cyan-950/40'
                      : 'bg-[#0f172a] border border-slate-800/80 text-slate-100 rounded-tl-none shadow-md'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap space-y-2.5">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-bold text-cyan-300 text-sm sm:text-base mt-2 mb-1 tracking-tight">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return <p key={pIdx} className="text-slate-200">{paragraph}</p>;
                    })}
                  </div>

                  {/* Executable Action Suggestion Card */}
                  {!isUser && msg.actionSuggestion && (
                    <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 text-xs shadow-inner">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-cyan-400" />
                          Recommended Action
                        </span>
                        {appliedActionId === msg.id ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <Check className="h-3.5 w-3.5" /> Applied to Event
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyAction(msg.actionSuggestion!, msg.id)}
                            className="btn-electric inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                          >
                            <span>Apply</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {msg.actionSuggestion.description}
                      </p>
                    </div>
                  )}

                  {/* Message Action Footer */}
                  {!isUser && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 hover:text-cyan-300 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Follow-up Suggestions Chips */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        className="rounded-xl border border-slate-800 bg-[#0f172a]/90 hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-200 px-3 py-1.5 text-xs text-slate-300 transition-all text-left disabled:opacity-50 shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white mt-0.5 font-bold shadow-md shadow-cyan-500/20">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-[#0f172a] px-4 py-3 text-xs text-slate-300 flex items-center gap-2.5 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Analyzing context & synthesizing strategic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Starters (Docked above input) */}
      <div className="border-t border-slate-800/80 bg-[#0a0f20]/95 px-4 pt-3 pb-1 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
          Quick queries:
        </span>
        {quickPromptTopics.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(topic.query)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0f172a] hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-200 px-2.5 py-1 text-xs text-slate-300 transition-all whitespace-nowrap disabled:opacity-50"
          >
            <span>{topic.label}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-[#0a0f20]/95 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about decor ideas, budget cuts, vendor vetting, or timeline..."
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-[#080d1a] px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="btn-electric flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
            title="Send query"
            aria-label="Send query"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Press Enter to send</span>
          <span>Google Gemini + PlanIQ Expert Engine</span>
        </div>
      </div>
    </div>
  );
};
