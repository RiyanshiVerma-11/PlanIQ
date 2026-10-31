/**
 * Service orchestrating Gemini 2.5 Flash GenAI synthesis for Event Blueprints and Interactive Planning Assistant.
 * Integrates schema validation, response normalization, timeouts, and seamless algorithmic fallbacks.
 */

import { GoogleGenAI } from '@google/genai';
import type { EventConstraints, EventBlueprint, RunOfShowBlock } from '../../src/types/blueprint.ts';
import type { AssistantEventContext, AssistantChatResponse } from '../../src/types/assistant.ts';
import { generateAlgorithmicBlueprint } from '../../src/utils/blueprintEngine.ts';
import { generateExpertAssistantResponse } from '../../src/utils/assistantEngine.ts';
import {
  GEMINI_BLUEPRINT_SCHEMA,
  GEMINI_ASSISTANT_SCHEMA,
  type RawGeminiBlueprintPayload,
  type RawGeminiAssistantPayload,
} from '../schemas/geminiSchemas.ts';

let sharedGoogleGenAI: GoogleGenAI | null = null;

export function getGoogleGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!sharedGoogleGenAI) {
    sharedGoogleGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return sharedGoogleGenAI;
}

/**
 * Builds the master prompt for Gemini Event Blueprint generation.
 */
function buildBlueprintPrompt(constraints: EventConstraints): string {
  return `Act as a world-class master event strategist and logistics director. Generate a complete, execution-ready blueprint for the following event constraints:
Event Name: ${constraints.eventName || constraints.eventType}
Event Type: ${constraints.eventType}
Total Budget: ${constraints.totalBudget} ${constraints.currency}
Location / Setting: ${constraints.locationSetting}
Guest Count: ${constraints.guestCount} confirmed guests
Key Theme / Preferences: ${constraints.keyTheme}
Time Remaining: ${constraints.timeRemainingMonths} months
${constraints.specialRequests ? `Special Requests / Desired Activities: ${constraints.specialRequests}\n` : ''}
Be extremely specific, creative, and tailored to the exact setting and constraints.

Deliverables Required:
1. Personalized Creative Concept:
   - Core aesthetic title, manifesto statement, 3 decor focal points with materiality, curated 5-color palette (hex, name, role, notes), 3 signature interactive elements/activities customized for this exact demographic.
2. Dynamic Budget Breakdown Table:
   - 7 exact categories: Venue & Facilities, Food & Beverage, Decor & Spatial Lighting, Photography & Audio-Visual, Entertainment & Music, Attire/Favors/Touchpoints, Contingency & Reserve.
   - For each: suggested percentage (all 7 must sum to exactly 100%), exact allocated amount (${constraints.currency}), 2 actionable cost-optimization tips to save without lowering quality, and sample line items with costs.
3. Milestones & Day-of Timeline:
   - Backward planning timeline: 3-4 phase checkpoints from today to event day, each with categorized tasks and designated owner role.
   - Day-of Run of Show: 8-12 hourly/minute-by-minute blocks from setup to strike with activity, location, leadRole (Logistics Director, Master of Ceremonies, Stage Manager, Catering Lead, Photo/Video Lead, Event Host / VIP), cues and notes, equipment.
4. Vendor Sourcing & Vetting Kit:
   - 4 critical categories: Catering & Beverage, Photo & Cinema, Venue Operations, Floral & Spatial Decor.
   - For each: booking deadline, exact scope of work bullet points, staffing/equipment benchmark, and 3 vetting questions with why it matters, green flag answer, and red flag answer to avoid hidden fees.`;
}

/**
 * Synthesizes an EventBlueprint using Gemini 2.5 Flash with fallback to the algorithmic engine.
 */
export async function synthesizeBlueprint(
  constraints: EventConstraints,
  timeoutMs = 45000
): Promise<{ blueprint: EventBlueprint; source: string }> {
  const ai = getGoogleGenAIClient();
  const baseline = generateAlgorithmicBlueprint(constraints);

  if (!ai) {
    return { blueprint: baseline, source: 'algorithmic-dynamic' };
  }

  try {
    const prompt = buildBlueprintPrompt(constraints);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini synthesis timeout')), timeoutMs)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_BLUEPRINT_SCHEMA,
      },
    });

    const aiResponse = await Promise.race([callPromise, timeoutPromise]);
    const responseText = aiResponse.text;

    if (!responseText) {
      return { blueprint: baseline, source: 'algorithmic-dynamic' };
    }

    const parsed: RawGeminiBlueprintPayload = JSON.parse(responseText);

    // Normalize budget categories
    let categories = baseline.budgetBreakdown.categories;
    if (parsed.budgetCategories && parsed.budgetCategories.length >= 7) {
      categories = parsed.budgetCategories.map((c, idx) => {
        const rawPct = Number(c.percentage) || baseline.budgetBreakdown.categories[idx]?.percentage || 14;
        const pct = rawPct <= 1 && rawPct > 0 ? Math.round(rawPct * 100) : Math.round(rawPct);
        const tips: [string, string] =
          Array.isArray(c.costOptimizationTips) && c.costOptimizationTips.length >= 2
            ? [c.costOptimizationTips[0]!, c.costOptimizationTips[1]!]
            : baseline.budgetBreakdown.categories[idx]?.costOptimizationTips || [
                'Negotiate off-peak terms',
                'Package bundle services',
              ];

        return {
          id: c.id || baseline.budgetBreakdown.categories[idx]?.id || `cat-${idx}`,
          category: c.category || baseline.budgetBreakdown.categories[idx]?.category || `Category ${idx + 1}`,
          percentage: pct,
          allocatedAmount: Math.round((constraints.totalBudget * pct) / 100),
          description: c.description || baseline.budgetBreakdown.categories[idx]?.description || '',
          costOptimizationTips: tips,
          lineItems: Array.isArray(c.lineItems) && c.lineItems.length > 0
            ? c.lineItems
            : baseline.budgetBreakdown.categories[idx]?.lineItems,
        };
      });
    }

    // Normalize Run of Show
    let ros: RunOfShowBlock[] = baseline.runOfShow;
    if (Array.isArray(parsed.runOfShow) && parsed.runOfShow.length >= 4) {
      ros = parsed.runOfShow.map((b, bIdx) => ({
        id: `ros-ai-${bIdx}`,
        startTime: b.startTime || '09:00 AM',
        endTime: b.endTime || '10:00 AM',
        durationMinutes: Number(b.durationMinutes) || 60,
        activity: b.activity || 'Event Block',
        location: b.location || constraints.locationSetting,
        leadRole: (b.leadRole as RunOfShowBlock['leadRole']) || 'Logistics Director',
        cuesAndNotes: b.cuesAndNotes || '',
        equipmentOrSupplies: b.equipmentOrSupplies || '',
      }));
    }

    // Normalize Milestones
    let milestones = baseline.milestones;
    if (Array.isArray(parsed.milestones) && parsed.milestones.length >= 2) {
      milestones = parsed.milestones.map((m, mIdx) => ({
        id: `m-ai-${mIdx}`,
        timeframe: m.timeframe || `Phase ${mIdx + 1}`,
        phase: (m.phase as EventBlueprint['milestones'][0]['phase']) || 'Strategy & Foundations',
        tasks: Array.isArray(m.tasks)
          ? m.tasks.map((t, tIdx) => ({
              id: `t-ai-${mIdx}-${tIdx}`,
              title: t.title || 'Action task',
              category: (t.category as EventBlueprint['milestones'][0]['tasks'][0]['category']) || 'Operations' as const,
              ownerRole: t.ownerRole || 'Logistics Director',
              completed: false,
              priority: (t.priority === 'Critical' || t.priority === 'High' || t.priority === 'Medium') ? t.priority : 'High',
              deadlineNote: t.deadlineNote || '',
            }))
          : baseline.milestones[mIdx]?.tasks || [],
      }));
    }

    // Normalize Vendor Vetting Kit
    let vendorVettingKit = baseline.vendorVettingKit;
    if (Array.isArray(parsed.vendorVettingKit) && parsed.vendorVettingKit.length >= 3) {
      vendorVettingKit = parsed.vendorVettingKit.map((v, vIdx) => ({
        id: `vendor-ai-${vIdx}`,
        category: v.category || `Vendor Category ${vIdx + 1}`,
        bookingDeadline: v.bookingDeadline || '6 Weeks Prior',
        scopeOfWork: Array.isArray(v.scopeOfWork) && v.scopeOfWork.length > 0
          ? v.scopeOfWork
          : ['Full service delivery', 'Dedicated account manager', 'On-site execution'],
        staffingOrEquipmentBenchmark: v.staffingOrEquipmentBenchmark || '1 lead coordinator plus dedicated crew',
        vettingQuestions: Array.isArray(v.vettingQuestions)
          ? v.vettingQuestions.map((q, qIdx) => ({
              id: `vq-ai-${vIdx}-${qIdx}`,
              question: q.question || 'What additional charges apply?',
              whyItMatters: q.whyItMatters || 'To eliminate unexpected surcharge inflation.',
              greenFlagAnswer: q.greenFlagAnswer || 'All-inclusive binding rate schedule.',
              redFlagAnswer: q.redFlagAnswer || 'Vague clauses reserving right to bill ad-hoc.',
            }))
          : baseline.vendorVettingKit[vIdx]?.vettingQuestions || [],
      }));
    }

    const aiBlueprint: EventBlueprint = {
      constraints,
      creativeConcept: {
        aestheticTitle: parsed.creativeConcept?.aestheticTitle || baseline.creativeConcept.aestheticTitle,
        aestheticManifesto: parsed.creativeConcept?.aestheticManifesto || baseline.creativeConcept.aestheticManifesto,
        focalPoints: parsed.creativeConcept?.focalPoints?.length ? parsed.creativeConcept.focalPoints : baseline.creativeConcept.focalPoints,
        colorPalette: parsed.creativeConcept?.colorPalette?.length ? parsed.creativeConcept.colorPalette : baseline.creativeConcept.colorPalette,
        interactiveElements: parsed.creativeConcept?.interactiveElements?.length === 3 ? parsed.creativeConcept.interactiveElements : baseline.creativeConcept.interactiveElements,
      },
      budgetBreakdown: {
        totalBudget: constraints.totalBudget,
        currency: constraints.currency,
        perGuestCost: Math.round(constraints.totalBudget / (constraints.guestCount || 1)),
        contingencyReserve: Math.round(constraints.totalBudget * 0.05),
        categories,
      },
      milestones,
      runOfShow: ros,
      vendorVettingKit,
      generatedAt: new Date().toISOString(),
      version: '3.0.0-gemini-ai',
    };

    return { blueprint: aiBlueprint, source: 'gemini-2.5-flash' };
  } catch (err) {
    console.error('Gemini synthesis failed, utilizing dynamic algorithmic engine:', err);
    return { blueprint: baseline, source: 'algorithmic-dynamic' };
  }
}

/**
 * Builds the prompt for the interactive GenAI Planning Assistant.
 */
function buildAssistantPrompt(userMessage: string, context: AssistantEventContext): string {
  const systemPrompt = `You are PlanIQ's Master Event Strategist & Celebration Co-Planner. You provide expert, tactical, and creative advice for weddings, birthdays, and community gatherings.
Current Event Context:
- Event: ${context.eventName || context.eventType} (${context.eventType})
- Scale: ${context.guestCount} guests
- Budget: ${context.totalBudget} ${context.currency} (Approx ${Math.round(context.totalBudget / (context.guestCount || 1))} / guest)
- Venue / Setting: ${context.locationSetting}
- Theme: ${context.keyTheme}
- Horizon: ${context.timeRemainingMonths} months remaining

Instructions:
1. Provide actionable, concise, high-value advice formatted with clear Markdown headers and bullet points.
2. Directly address the user query with realistic pricing, logistics, or creative suggestions.
3. Keep response under 350 words so it is easily scannable and conversational.
4. Provide 3 relevant follow-up query suggestions.
5. If applicable, recommend 1 concrete action (rebalance_budget, add_task, add_vendor_question, or add_concept_idea).`;

  return `${systemPrompt}\n\nUser Query: "${userMessage}"`;
}

/**
 * Synthesizes an interactive assistant response using Gemini 2.5 Flash with fallback to expert engine.
 */
export async function synthesizeAssistantChat(
  userMessage: string,
  context: AssistantEventContext,
  timeoutMs = 15000
): Promise<AssistantChatResponse> {
  const ai = getGoogleGenAIClient();
  const fallback = generateExpertAssistantResponse(userMessage, context);

  if (!ai) {
    return fallback;
  }

  try {
    const prompt = buildAssistantPrompt(userMessage, context);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Assistant synthesis timeout')), timeoutMs)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_ASSISTANT_SCHEMA,
      },
    });

    const aiResponse = await Promise.race([callPromise, timeoutPromise]);

    if (aiResponse.text) {
      let parsed: RawGeminiAssistantPayload | null = null;
      try {
        parsed = JSON.parse(aiResponse.text) as RawGeminiAssistantPayload;
      } catch {
        const cleaned = aiResponse.text
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/i, '')
          .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ');
        try {
          parsed = JSON.parse(cleaned) as RawGeminiAssistantPayload;
        } catch {
          parsed = null;
        }
      }

      if (parsed && parsed.reply) {
        return {
          reply: parsed.reply,
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
          actionSuggestion: parsed.actionSuggestion
            ? {
                type: parsed.actionSuggestion.type || 'add_task',
                label: parsed.actionSuggestion.label || 'Apply Suggestion',
                description: parsed.actionSuggestion.description || '',
                payload: parsed.actionSuggestion.payload || {},
              }
            : undefined,
          source: 'gemini-ai',
        };
      }
    }
  } catch (err) {
    console.error('Gemini Assistant chat fallback to expert strategist engine:', err);
  }

  return fallback;
}
