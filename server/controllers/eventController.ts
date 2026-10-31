/**
 * Express Controller handling Event Blueprint generation and Planning Assistant endpoints.
 * Integrates LRU caching, input sanitization, and service delegation.
 */

import type { Request, Response } from 'express';
import type { EventBlueprint } from '../../src/types/blueprint.ts';
import type { AssistantChatResponse } from '../../src/types/assistant.ts';
import { FastLRUCache } from '../cache/lruCache.ts';
import {
  sanitizeConstraints,
  sanitizeAssistantContext,
  sanitizeText,
  buildConstraintsCacheKey,
  buildAssistantCacheKey,
} from '../utils/sanitizers.ts';
import { synthesizeBlueprint, synthesizeAssistantChat } from '../services/geminiService.ts';

// Dedicated LRU Caches for Blueprint synthesis and Assistant chat responses
export const blueprintCache = new FastLRUCache<EventBlueprint>(100, 1000 * 60 * 60);
export const assistantChatCache = new FastLRUCache<AssistantChatResponse>(200, 1000 * 60 * 30);

/**
 * GET /api/health
 * System health, memory telemetry, and cache statistics.
 */
export function handleHealthCheck(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    metrics: {
      uptimeSeconds: Math.round(process.uptime()),
      memoryHeapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      blueprintCache: blueprintCache.getStats(),
      assistantCache: assistantChatCache.getStats(),
    },
  });
}

/**
 * POST /api/generate-blueprint
 * Synthesizes a master event blueprint using Gemini with LRU cache acceleration and algorithmic fallback.
 */
export async function handleGenerateBlueprint(req: Request, res: Response): Promise<void> {
  const body = req.body;

  if (!body || typeof body !== 'object' || !body.eventType || !body.totalBudget) {
    res.status(400).json({ error: 'Missing required event constraints (eventType and totalBudget).' });
    return;
  }

  const constraints = sanitizeConstraints(body);
  const cacheKey = buildConstraintsCacheKey(constraints);
  const cached = blueprintCache.get(cacheKey);

  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.json({ blueprint: cached, source: 'cache-accelerated' });
    return;
  }

  res.setHeader('X-Cache', 'MISS');
  const result = await synthesizeBlueprint(constraints);

  // Cache successful result
  blueprintCache.set(cacheKey, result.blueprint);
  res.json(result);
}

/**
 * POST /api/assistant/chat
 * Handles conversational queries with the GenAI planning assistant.
 */
export async function handleAssistantChat(req: Request, res: Response): Promise<void> {
  const body = req.body;

  if (!body || typeof body !== 'object' || !body.message) {
    res.status(400).json({ error: 'Missing message in request body.' });
    return;
  }

  const userMessage = sanitizeText(body.message, 1000);
  const context = sanitizeAssistantContext(body.context);
  const cacheKey = buildAssistantCacheKey(userMessage, context);
  const cached = assistantChatCache.get(cacheKey);

  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.json(cached);
    return;
  }

  res.setHeader('X-Cache', 'MISS');
  const response = await synthesizeAssistantChat(userMessage, context);

  // Cache response
  assistantChatCache.set(cacheKey, response);
  res.json(response);
}
