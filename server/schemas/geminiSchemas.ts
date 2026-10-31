/**
 * Google GenAI JSON response schemas and strict TypeScript interface contracts.
 * Enforces zero-any safety when transforming raw LLM outputs into PlanIQ domain models.
 */

import { Type } from '@google/genai';

/**
 * Raw JSON payload structure returned by Gemini 2.5 Flash for Event Blueprint synthesis.
 */
export interface RawGeminiBlueprintPayload {
  creativeConcept?: {
    aestheticTitle?: string;
    aestheticManifesto?: string;
    focalPoints?: Array<{
      area: string;
      description: string;
      materiality: string;
    }>;
    colorPalette?: Array<{
      name: string;
      hex: string;
      role: string;
      notes: string;
    }>;
    interactiveElements?: Array<{
      title: string;
      targetMoment: string;
      description: string;
      guestExperience: string;
      logisticalRequirement: string;
    }>;
  };
  budgetCategories?: Array<{
    id?: string;
    category?: string;
    percentage?: number;
    allocatedAmount?: number;
    description?: string;
    costOptimizationTips?: string[];
    lineItems?: Array<{
      name: string;
      estimatedCost: number;
    }>;
  }>;
  runOfShow?: Array<{
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    activity?: string;
    location?: string;
    leadRole?: string;
    cuesAndNotes?: string;
    equipmentOrSupplies?: string;
  }>;
  milestones?: Array<{
    timeframe?: string;
    phase?: string;
    tasks?: Array<{
      title?: string;
      category?: string;
      ownerRole?: string;
      priority?: string;
      deadlineNote?: string;
    }>;
  }>;
  vendorVettingKit?: Array<{
    category?: string;
    bookingDeadline?: string;
    staffingOrEquipmentBenchmark?: string;
    scopeOfWork?: string[];
    vettingQuestions?: Array<{
      question?: string;
      whyItMatters?: string;
      greenFlagAnswer?: string;
      redFlagAnswer?: string;
    }>;
  }>;
}

/**
 * Raw JSON payload structure returned by Gemini 2.5 Flash for Assistant chat.
 */
export interface RawGeminiAssistantPayload {
  reply?: string;
  suggestions?: string[];
  actionSuggestion?: {
    type?: 'rebalance_budget' | 'add_task' | 'add_vendor_question' | 'add_concept_idea';
    label?: string;
    description?: string;
    payload?: Record<string, unknown>;
  };
}

/**
 * Structured schema for Gemini 2.5 Flash blueprint generation.
 */
export const GEMINI_BLUEPRINT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    creativeConcept: {
      type: Type.OBJECT,
      properties: {
        aestheticTitle: { type: Type.STRING },
        aestheticManifesto: { type: Type.STRING },
        focalPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              area: { type: Type.STRING },
              description: { type: Type.STRING },
              materiality: { type: Type.STRING },
            },
            required: ['area', 'description', 'materiality'],
          },
        },
        colorPalette: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hex: { type: Type.STRING },
              role: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ['name', 'hex', 'role', 'notes'],
          },
        },
        interactiveElements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              targetMoment: { type: Type.STRING },
              description: { type: Type.STRING },
              guestExperience: { type: Type.STRING },
              logisticalRequirement: { type: Type.STRING },
            },
            required: ['title', 'targetMoment', 'description', 'guestExperience', 'logisticalRequirement'],
          },
        },
      },
      required: ['aestheticTitle', 'aestheticManifesto', 'focalPoints', 'colorPalette', 'interactiveElements'],
    },
    budgetCategories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
          allocatedAmount: { type: Type.NUMBER },
          description: { type: Type.STRING },
          costOptimizationTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          lineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
              },
              required: ['name', 'estimatedCost'],
            },
          },
        },
        required: ['id', 'category', 'percentage', 'allocatedAmount', 'description', 'costOptimizationTips'],
      },
    },
    runOfShow: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startTime: { type: Type.STRING },
          endTime: { type: Type.STRING },
          durationMinutes: { type: Type.NUMBER },
          activity: { type: Type.STRING },
          location: { type: Type.STRING },
          leadRole: { type: Type.STRING },
          cuesAndNotes: { type: Type.STRING },
          equipmentOrSupplies: { type: Type.STRING },
        },
        required: ['startTime', 'endTime', 'durationMinutes', 'activity', 'location', 'leadRole', 'cuesAndNotes'],
      },
    },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timeframe: { type: Type.STRING },
          phase: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                ownerRole: { type: Type.STRING },
                priority: { type: Type.STRING },
                deadlineNote: { type: Type.STRING },
              },
              required: ['title', 'category', 'ownerRole'],
            },
          },
        },
        required: ['timeframe', 'phase', 'tasks'],
      },
    },
    vendorVettingKit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          bookingDeadline: { type: Type.STRING },
          staffingOrEquipmentBenchmark: { type: Type.STRING },
          scopeOfWork: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          vettingQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                greenFlagAnswer: { type: Type.STRING },
                redFlagAnswer: { type: Type.STRING },
              },
              required: ['question', 'whyItMatters', 'greenFlagAnswer', 'redFlagAnswer'],
            },
          },
        },
        required: ['category', 'bookingDeadline', 'staffingOrEquipmentBenchmark', 'scopeOfWork', 'vettingQuestions'],
      },
    },
  },
  required: ['creativeConcept', 'budgetCategories', 'runOfShow', 'milestones', 'vendorVettingKit'],
};

/**
 * Structured schema for Gemini 2.5 Flash assistant chat responses.
 */
export const GEMINI_ASSISTANT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    actionSuggestion: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        label: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ['type', 'label', 'description'],
    },
  },
  required: ['reply', 'suggestions'],
};
