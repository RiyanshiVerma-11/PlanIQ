/**
 * Types for PlanIQ GenAI Planning Assistant
 */

export interface AssistantActionSuggestion {
  type: 'rebalance_budget' | 'add_task' | 'add_vendor_question' | 'add_concept_idea';
  label: string;
  description: string;
  payload: any;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestions?: string[];
  actionSuggestion?: AssistantActionSuggestion;
}

export interface AssistantEventContext {
  eventType: string;
  eventName?: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  locationSetting: string;
  keyTheme: string;
  timeRemainingMonths?: number;
  activeTab?: string;
}

export interface AssistantChatRequest {
  message: string;
  context: AssistantEventContext;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AssistantChatResponse {
  reply: string;
  suggestions: string[];
  actionSuggestion?: AssistantActionSuggestion;
  source: 'gemini-ai' | 'expert-strategist';
}
