/**
 * Types for PlanIQ GenAI Planning Assistant
 */

export interface RebalanceBudgetPayload {
  categoryId?: string;
  categoryName?: string;
  percentageAdjustment?: number;
  newPercentage?: number;
  newTotal?: number;
}

export interface AddTaskPayload {
  title: string;
  category?: 'Venue' | 'Vendors' | 'Guest' | 'Design' | 'Logistics' | 'Finance';
  phaseId?: string;
  priority?: 'High' | 'Medium' | 'Critical';
  deadlineNote?: string;
}

export interface AddVendorQuestionPayload {
  category: string;
  question: string;
  whyItMatters?: string;
  greenFlagAnswer?: string;
  redFlagAnswer?: string;
}

export interface AddConceptIdeaPayload {
  title: string;
  description: string;
  targetMoment?: string;
  materiality?: string;
}

export type AssistantActionPayload =
  | RebalanceBudgetPayload
  | AddTaskPayload
  | AddVendorQuestionPayload
  | AddConceptIdeaPayload
  | Record<string, unknown>;

export interface AssistantActionSuggestion {
  type: 'rebalance_budget' | 'add_task' | 'add_vendor_question' | 'add_concept_idea';
  label: string;
  description: string;
  payload: AssistantActionPayload;
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
