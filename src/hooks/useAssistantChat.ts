/**
 * Custom React hook managing conversational state, message history,
 * API requests, action dispatching, and fallback handling for the GenAI Planning Assistant.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { EventBlueprint } from '../types/blueprint.ts';
import type {
  AssistantMessage,
  AssistantActionSuggestion,
  AssistantChatResponse,
} from '../types/assistant.ts';
import { generateExpertAssistantResponse } from '../utils/assistantEngine.ts';
import { formatCurrency } from '../utils/blueprintEngine.ts';

export interface UseAssistantChatOptions {
  blueprint: EventBlueprint;
  onApplyAction?: (action: AssistantActionSuggestion) => void;
}

export interface UseAssistantChatReturn {
  messages: AssistantMessage[];
  inputQuery: string;
  isLoading: boolean;
  copiedId: string | null;
  appliedActionId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setInputQuery: (query: string) => void;
  sendMessage: (queryText?: string) => Promise<void>;
  copyMessageText: (id: string, text: string) => Promise<void>;
  applyAction: (action: AssistantActionSuggestion, msgId: string) => void;
  resetChat: () => void;
}

export function useAssistantChat({
  blueprint,
  onApplyAction,
}: UseAssistantChatOptions): UseAssistantChatReturn {
  const buildWelcomeMessage = useCallback(
    (bp: EventBlueprint): AssistantMessage => ({
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **PlanIQ GenAI Planning Assistant**.

I am tuned to your **${bp.constraints.eventName || bp.constraints.eventType}** (${bp.constraints.guestCount} guests, ${formatCurrency(bp.budgetBreakdown.totalBudget, bp.budgetBreakdown.currency)} budget in *${bp.constraints.locationSetting}*).

How can I help elevate your event today? You can ask for creative ideas, budget trimming advice, vendor vetting tactics, or day-of timeline flow!`,
      suggestions: [
        '💡 Suggest 3 unique interactive ideas for my guests',
        '💰 How can I trim 10% from my catering budget?',
        '⏱️ What are the lead role responsibilities on event day?',
        '📋 What hidden fees should I watch for in the venue contract?',
      ],
    }),
    []
  );

  const [messages, setMessages] = useState<AssistantMessage[]>(() => [buildWelcomeMessage(blueprint)]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedActionId, setAppliedActionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (queryText?: string) => {
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
        const timeoutId = setTimeout(() => controller.abort(), 14000);

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
      } catch (err) {
        console.error('Interactive Assistant API request error, utilizing client-side expert strategist:', err);
      } finally {
        setIsLoading(false);
      }

      // Offline / Error Fallback
      const fallback = generateExpertAssistantResponse(textToSend, contextPayload);
      const fallbackMsg: AssistantMessage = {
        id: `ai-expert-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallback.reply,
        suggestions: fallback.suggestions,
        actionSuggestion: fallback.actionSuggestion,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    },
    [blueprint, inputQuery, isLoading]
  );

  const copyMessageText = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Graceful fallback for clipboard permissions
    }
  }, []);

  const applyAction = useCallback(
    (action: AssistantActionSuggestion, msgId: string) => {
      if (onApplyAction) {
        onApplyAction(action);
        setAppliedActionId(msgId);
        setTimeout(() => setAppliedActionId(null), 3000);
      }
    },
    [onApplyAction]
  );

  const resetChat = useCallback(() => {
    setMessages([buildWelcomeMessage(blueprint)]);
    setInputQuery('');
    setAppliedActionId(null);
  }, [blueprint, buildWelcomeMessage]);

  return {
    messages,
    inputQuery,
    isLoading,
    copiedId,
    appliedActionId,
    messagesEndRef,
    setInputQuery,
    sendMessage,
    copyMessageText,
    applyAction,
    resetChat,
  };
}
