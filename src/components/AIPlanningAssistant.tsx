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
      className={`flex flex-col bg-zinc-950 text-zinc-100 ${
        isDrawer
          ? 'h-full w-full'
          : 'rounded-2xl border border-white/10 shadow-2xl h-[calc(100vh-140px)] max-h-[850px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-zinc-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100 truncate">
                PlanIQ AI Co-Planner
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                Active Context
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {blueprint.constraints.eventName || blueprint.constraints.eventType} · {blueprint.constraints.guestCount} guests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Reset Conversation"
            aria-label="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Context Badge Strip */}
      <div className="border-b border-white/5 bg-zinc-900/40 px-5 py-2.5 flex items-center justify-between text-xs text-zinc-400 overflow-x-auto gap-4 shrink-0">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-emerald-400" />
            <strong className="text-zinc-200 font-mono">
              {formatCurrency(blueprint.budgetBreakdown.totalBudget, blueprint.budgetBreakdown.currency)}
            </strong>
          </span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="truncate max-w-[200px]">
            Venue: <strong className="text-zinc-200">{blueprint.constraints.locationSetting}</strong>
          </span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="truncate max-w-[200px]">
            Theme: <strong className="text-zinc-200">{blueprint.constraints.keyTheme}</strong>
          </span>
        </div>
        <span className="text-[10px] uppercase font-mono text-amber-400/80 tracking-wider shrink-0">
          GenAI Assisted
        </span>
      </div>

      {/* Quick Topic Chips Strip */}
      <div className="border-b border-white/5 bg-zinc-950 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
        <span className="text-[11px] text-zinc-400 whitespace-nowrap pl-1">
          Quick queries:
        </span>
        {quickPromptTopics.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(topic.query)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <span>{topic.label}</span>
          </button>
        ))}
      </div>

      {/* Message History Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-semibold text-zinc-100 text-sm mt-1 mb-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Executable Action Suggestion Card */}
                  {!isUser && msg.actionSuggestion && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Recommended Action
                        </span>
                        {appliedActionId === msg.id ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <Check className="h-3.5 w-3.5" /> Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyAction(msg.actionSuggestion!, msg.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm"
                          >
                            <span>Execute</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        {msg.actionSuggestion.description}
                      </p>
                    </div>
                  )}

                  {/* Message Action Footer */}
                  {!isUser && (
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 hover:text-zinc-200 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
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
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        className="rounded-full border border-white/10 bg-zinc-900/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-amber-500/30 hover:text-amber-300 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-zinc-950 mt-0.5 font-bold">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-white/10 bg-zinc-900 px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
              <span>Analyzing context & synthesizing strategic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-white/10 p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-md shrink-0">
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
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
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
        <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-400">
          <span>Press Enter to send</span>
          <span>Dual-Engine: Google Gemini + PlanIQ Expert Engine</span>
        </div>
      </div>
    </div>
  );
};
