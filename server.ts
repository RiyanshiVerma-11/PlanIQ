import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { generateAlgorithmicBlueprint } from './src/utils/blueprintEngine.ts';
import type { EventConstraints, EventBlueprint } from './src/types/blueprint.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '256kb' }));

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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
        setTimeout(() => reject(new Error('Gemini synthesis timeout')), 25000)
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
  res.json({ blueprint, source: 'algorithmic-dynamic' });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
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
