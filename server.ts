import express from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { generateAlgorithmicBlueprint } from './src/utils/blueprintEngine.ts';
import { generateExpertAssistantResponse } from './src/utils/assistantEngine.ts';
import type { EventConstraints, EventBlueprint } from './src/types/blueprint.ts';
import type { AssistantEventContext, AssistantChatResponse } from './src/types/assistant.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(compression());
app.use(express.json({ limit: '256kb' }));

// Performance telemetry & Security headers middleware
app.use((req, res, next) => {
  const startHrTime = process.hrtime.bigint();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - startHrTime) / 1e6;
    res.setHeader('X-Response-Time', `${elapsedMs.toFixed(2)}ms`);
  });
  next();
});

// High-Performance In-Memory LRU Cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class FastLRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxEntries: number;
  private defaultTTLMs: number;

  constructor(maxEntries = 150, defaultTTLMs = 1000 * 60 * 30) {
    this.maxEntries = maxEntries;
    this.defaultTTLMs = defaultTTLMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlMs = this.defaultTTLMs): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  size(): number {
    return this.cache.size;
  }
}

const blueprintCache = new FastLRUCache<EventBlueprint>(100, 1000 * 60 * 60);
const assistantChatCache = new FastLRUCache<AssistantChatResponse>(200, 1000 * 60 * 30);

let sharedGoogleGenAI: GoogleGenAI | null = null;
function getSharedGoogleGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!sharedGoogleGenAI) {
    sharedGoogleGenAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return sharedGoogleGenAI;
}

function getConstraintsCacheKey(c: EventConstraints): string {
  return [
    (c.eventType || '').toLowerCase().trim(),
    c.totalBudget,
    c.currency,
    c.guestCount,
    c.timeRemainingMonths,
    (c.locationSetting || '').toLowerCase().trim(),
    (c.keyTheme || '').toLowerCase().trim(),
    (c.specialRequests || '').toLowerCase().trim(),
  ].join('|');
}

function sanitizeText(input: unknown, maxLen = 300, fallback = ''): string {
  if (typeof input !== 'string') return fallback;
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen) || fallback;
}

function sanitizeConstraints(raw: Partial<EventConstraints>): EventConstraints {
  const validCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as const;
  const currency = validCurrencies.includes(raw.currency as any) ? raw.currency! : 'USD';
  const totalBudget = Math.min(100_000_000, Math.max(100, Number(raw.totalBudget) || 25000));
  const guestCount = Math.min(100_000, Math.max(1, Math.round(Number(raw.guestCount) || 100)));
  const timeRemainingMonths = Math.min(60, Math.max(1, Math.round(Number(raw.timeRemainingMonths) || 3)));
  const eventType = sanitizeText(raw.eventType, 160, 'Custom Event');

  return {
    id: sanitizeText(raw.id, 100, `event-${Date.now()}`),
    eventName: sanitizeText(raw.eventName, 160, eventType),
    eventType,
    totalBudget,
    currency,
    locationSetting: sanitizeText(raw.locationSetting, 200, 'Indoor & Outdoor Venue'),
    guestCount,
    keyTheme: sanitizeText(raw.keyTheme, 300, 'Modern tailored celebration'),
    timeRemainingMonths,
    specialRequests: raw.specialRequests ? sanitizeText(raw.specialRequests, 400) : undefined,
  };
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    metrics: {
      uptimeSeconds: Math.round(process.uptime()),
      memoryHeapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      blueprintCacheSize: blueprintCache.size(),
      assistantCacheSize: assistantChatCache.size(),
    },
  });
});

// Endpoint: Generate bespoke blueprint via Gemini (with intelligent dynamic fallback)
app.post('/api/generate-blueprint', async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || !body.eventType || !body.totalBudget) {
    res.status(400).json({ error: 'Missing required event constraints.' });
    return;
  }

  const constraints: EventConstraints = sanitizeConstraints(body);
  const cacheKey = getConstraintsCacheKey(constraints);
  const cachedBlueprint = blueprintCache.get(cacheKey);

  if (cachedBlueprint) {
    res.setHeader('X-Cache', 'HIT');
    res.json({ blueprint: cachedBlueprint, source: 'cache-accelerated' });
    return;
  }
  res.setHeader('X-Cache', 'MISS');

  // If Gemini API key is configured, synthesize via Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Act as a world-class master event strategist and logistics director. Generate a complete, execution-ready blueprint for the following event constraints:
Event Name: ${constraints.eventName || constraints.eventType}
Event Type: ${constraints.eventType}
Total Budget: ${constraints.totalBudget} ${constraints.currency}
Location / Setting: ${constraints.locationSetting}
Guest Count: ${constraints.guestCount} confirmed guests
Key Theme / Preferences: ${constraints.keyTheme}
Time Remaining: ${constraints.timeRemainingMonths} months
${constraints.specialRequests ? `Special Requests / Desired Activities: ${constraints.specialRequests}\n` : ''}
Be extremely specific, creative, and tailored to the exact setting and constraints (e.g. if it is a pet birthday party on a houseboat, or an underwater tech hackathon, customize every single activity, safety rule, vendor vetting question, and menu item to that exact scenario).

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

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini synthesis timeout')), 45000)
      );

      const aiResponse = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
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
          },
        },
      }),
      timeoutPromise,
    ])) as any;

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        const baseline = generateAlgorithmicBlueprint(constraints);

        // Normalize budget categories
        let categories = baseline.budgetBreakdown.categories;
        if (parsed.budgetCategories && parsed.budgetCategories.length >= 7) {
          categories = parsed.budgetCategories.map((c: any, idx: number) => {
            const rawPct = Number(c.percentage) || baseline.budgetBreakdown.categories[idx]?.percentage || 14;
            const pct = rawPct <= 1 && rawPct > 0 ? Math.round(rawPct * 100) : Math.round(rawPct);
            return {
              id: c.id || baseline.budgetBreakdown.categories[idx]?.id || `cat-${idx}`,
              category: c.category || baseline.budgetBreakdown.categories[idx]?.category,
              percentage: pct,
              allocatedAmount: Math.round((constraints.totalBudget * pct) / 100),
              description: c.description || baseline.budgetBreakdown.categories[idx]?.description,
              costOptimizationTips: Array.isArray(c.costOptimizationTips) && c.costOptimizationTips.length >= 2
                ? [c.costOptimizationTips[0], c.costOptimizationTips[1]]
                : baseline.budgetBreakdown.categories[idx]?.costOptimizationTips,
              lineItems: Array.isArray(c.lineItems) && c.lineItems.length > 0
                ? c.lineItems
                : baseline.budgetBreakdown.categories[idx]?.lineItems,
            };
          });
        }

        // Run of Show from Gemini
        let ros = baseline.runOfShow;
        if (Array.isArray(parsed.runOfShow) && parsed.runOfShow.length >= 4) {
          ros = parsed.runOfShow.map((b: any, bIdx: number) => ({
            id: `ros-ai-${bIdx}`,
            startTime: b.startTime || '09:00 AM',
            endTime: b.endTime || '10:00 AM',
            durationMinutes: Number(b.durationMinutes) || 60,
            activity: b.activity || 'Event Block',
            location: b.location || constraints.locationSetting,
            leadRole: b.leadRole || 'Logistics Director',
            cuesAndNotes: b.cuesAndNotes || '',
            equipmentOrSupplies: b.equipmentOrSupplies || '',
          }));
        }

        // Milestones backward planning from Gemini
        let milestones = baseline.milestones;
        if (Array.isArray(parsed.milestones) && parsed.milestones.length >= 2) {
          milestones = parsed.milestones.map((m: any, mIdx: number) => ({
            id: `m-ai-${mIdx}`,
            timeframe: m.timeframe || `Phase ${mIdx + 1}`,
            phase: m.phase || `Planning Phase ${mIdx + 1}`,
            tasks: Array.isArray(m.tasks)
              ? m.tasks.map((t: any, tIdx: number) => ({
                  id: `t-ai-${mIdx}-${tIdx}`,
                  title: t.title || 'Action task',
                  category: t.category || 'Operations',
                  ownerRole: t.ownerRole || 'Logistics Director',
                  completed: false,
                  priority: (t.priority === 'Critical' || t.priority === 'High' || t.priority === 'Medium') ? t.priority : 'High',
                  deadlineNote: t.deadlineNote || '',
                }))
              : baseline.milestones[mIdx]?.tasks || [],
          }));
        }

        // Vendor Vetting Kit from Gemini
        let vendorVettingKit = baseline.vendorVettingKit;
        if (Array.isArray(parsed.vendorVettingKit) && parsed.vendorVettingKit.length >= 3) {
          vendorVettingKit = parsed.vendorVettingKit.map((v: any, vIdx: number) => ({
            id: `vendor-ai-${vIdx}`,
            category: v.category || `Vendor Category ${vIdx + 1}`,
            bookingDeadline: v.bookingDeadline || '6 Weeks Prior',
            scopeOfWork: Array.isArray(v.scopeOfWork) && v.scopeOfWork.length > 0
              ? v.scopeOfWork
              : ['Full service delivery', 'Dedicated account manager', 'On-site execution'],
            staffingOrEquipmentBenchmark: v.staffingOrEquipmentBenchmark || '1 lead coordinator plus dedicated crew',
            vettingQuestions: Array.isArray(v.vettingQuestions)
              ? v.vettingQuestions.map((q: any, qIdx: number) => ({
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
            aestheticTitle: parsed.creativeConcept.aestheticTitle || baseline.creativeConcept.aestheticTitle,
            aestheticManifesto: parsed.creativeConcept.aestheticManifesto || baseline.creativeConcept.aestheticManifesto,
            focalPoints: parsed.creativeConcept.focalPoints?.length ? parsed.creativeConcept.focalPoints : baseline.creativeConcept.focalPoints,
            colorPalette: parsed.creativeConcept.colorPalette?.length ? parsed.creativeConcept.colorPalette : baseline.creativeConcept.colorPalette,
            interactiveElements: parsed.creativeConcept.interactiveElements?.length === 3 ? parsed.creativeConcept.interactiveElements : baseline.creativeConcept.interactiveElements,
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

        res.json({ blueprint: aiBlueprint, source: 'gemini-3.8-flash' });
        return;
      }
    } catch (err) {
      console.error('Gemini synthesis failed, utilizing dynamic algorithmic engine:', err);
    }
  }

  // Dynamic Algorithmic Master Blueprint fallback
  const blueprint = generateAlgorithmicBlueprint(constraints);
  blueprintCache.set(cacheKey, blueprint);
  res.json({ blueprint, source: 'algorithmic-dynamic' });
});

// Endpoint: Interactive GenAI Planning Assistant Chat
app.post('/api/assistant/chat', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || !body.message) {
    res.status(400).json({ error: 'Missing message in request body.' });
    return;
  }

  const userMessage = sanitizeText(body.message, 1000);
  const context: AssistantEventContext = {
    eventType: sanitizeText(body.context?.eventType, 160, 'Celebration Event'),
    eventName: body.context?.eventName ? sanitizeText(body.context.eventName, 160) : undefined,
    guestCount: Math.min(100_000, Math.max(1, Number(body.context?.guestCount) || 100)),
    totalBudget: Math.min(100_000_000, Math.max(100, Number(body.context?.totalBudget) || 25000)),
    currency: sanitizeText(body.context?.currency, 10, 'USD'),
    locationSetting: sanitizeText(body.context?.locationSetting, 200, 'Indoor & Outdoor Venue'),
    keyTheme: sanitizeText(body.context?.keyTheme, 300, 'Modern Tailored Celebration'),
    timeRemainingMonths: Number(body.context?.timeRemainingMonths) || 3,
    activeTab: sanitizeText(body.context?.activeTab, 50, 'tab-concept'),
  };

  const assistantCacheKey = `${userMessage.trim().toLowerCase()}|${context.eventType}|${context.totalBudget}|${context.guestCount}`;
  const cachedAssistant = assistantChatCache.get(assistantCacheKey);
  if (cachedAssistant) {
    res.setHeader('X-Cache', 'HIT');
    res.json(cachedAssistant);
    return;
  }
  res.setHeader('X-Cache', 'MISS');

  // If Gemini API key is configured, synthesize response with Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const systemPrompt = `You are PlanIQ's Master Event Strategist & Celebration Co-Planner. You provide expert, tactical, and creative advice for weddings, birthdays, and community gatherings.
Current Event Context:
- Event: ${context.eventName || context.eventType} (${context.eventType})
- Scale: ${context.guestCount} guests
- Budget: ${context.totalBudget} ${context.currency} (Approx ${Math.round(context.totalBudget / context.guestCount)} / guest)
- Venue / Setting: ${context.locationSetting}
- Theme: ${context.keyTheme}
- Horizon: ${context.timeRemainingMonths} months remaining

Instructions:
1. Provide actionable, concise, high-value advice formatted with clear Markdown headers and bullet points.
2. Directly address the user query with realistic pricing, logistics, or creative suggestions.
3. Keep response under 350 words so it is easily scannable and conversational.
4. Provide 3 relevant follow-up query suggestions.
5. If applicable, recommend 1 concrete action (rebalance_budget, add_task, add_vendor_question, or add_concept_idea).`;

      const prompt = `${systemPrompt}\n\nUser Query: "${userMessage}"\n\nReturn a JSON object with:
{
  "reply": "Markdown text with your advice",
  "suggestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"],
  "actionSuggestion": {
    "type": "rebalance_budget" | "add_task" | "add_vendor_question" | "add_concept_idea",
    "label": "Short button label",
    "description": "Short explanation",
    "payload": {}
  }
}`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Assistant synthesis timeout')), 15000)
      );

      const aiResponse = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
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
            },
          },
        }),
        timeoutPromise,
      ])) as any;

      if (aiResponse.text) {
        let parsed: any = null;
        try {
          parsed = JSON.parse(aiResponse.text);
        } catch {
          const cleaned = aiResponse.text
            .replace(/^```json\s*/i, '')
            .replace(/\s*```$/i, '')
            .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ');
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            parsed = null;
          }
        }

        if (parsed && parsed.reply) {
          const responsePayload: AssistantChatResponse = {
            reply: parsed.reply,
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
            actionSuggestion: parsed.actionSuggestion,
            source: 'gemini-ai',
          };
          assistantChatCache.set(assistantCacheKey, responsePayload);
          res.json(responsePayload);
          return;
        }
      }
    } catch (err) {
      console.error('Gemini Assistant chat fallback to expert strategist engine:', err);
    }
  }

  // Deterministic Expert Engine Fallback (guarantees 100% offline and test reliability)
  const fallback = generateExpertAssistantResponse(userMessage, context);
  assistantChatCache.set(assistantCacheKey, fallback);
  res.json(fallback);
});

async function startServer() {
  const distDir = path.join(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction || hasDist) {
    if (hasDist) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(distIndex);
      });
    } else {
      console.error(
        '[PlanIQ ERROR] dist/index.html was not found! In your Render Web Service settings, ensure your Build Command is: npm install && npm run build'
      );
      app.get('*', (_req, res) => {
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>PlanIQ Studio — Build Step Required</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0A0D14; color: #F3F4F6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #121826; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 32px; max-width: 600px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #F59E0B; margin-top: 0; font-size: 24px; }
                p { line-height: 1.6; color: #9CA3AF; margin: 16px 0; }
                code { background: #1E293B; color: #10B981; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
                .box { background: #0A0D14; border: 1px solid #1E293B; padding: 12px; border-radius: 8px; margin: 20px 0; font-family: monospace; color: #34D399; font-size: 15px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚠️ PlanIQ Web Service Started — Build Required</h1>
                <p>The Express server is running successfully, but the frontend distribution bundle was not found at <code>dist/index.html</code>.</p>
                <p>To resolve this on <strong>Render</strong>:</p>
                <div class="box">Build Command: npm install && npm run build</div>
                <p>Then trigger a redeploy from your Render Dashboard: <strong>Manual Deploy &gt; Clear build cache &amp; deploy</strong>.</p>
              </div>
            </body>
          </html>
        `);
      });
    }
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Master Event Strategist suite running on port ${port}`);
  });
}

startServer();
