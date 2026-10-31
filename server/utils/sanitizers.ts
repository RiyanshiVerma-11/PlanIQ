/**
 * Input sanitization, normalization, and safety utilities for server endpoints.
 */

import type { EventConstraints, CurrencyCode } from '../../src/types/blueprint.ts';
import type { AssistantEventContext } from '../../src/types/assistant.ts';
import { VALIDATION_LIMITS, SUPPORTED_CURRENCIES } from '../../src/constants/eventConstants.ts';

/**
 * Removes dangerous control characters, trims whitespace, and truncates to safe length.
 */
export function sanitizeText(input: unknown, maxLen = 300, fallback = ''): string {
  if (typeof input !== 'string') return fallback;
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen) || fallback;
}

/**
 * Safely parses and clamps numeric values between min and max bounds.
 */
export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

/**
 * Validates and sanitizes incoming EventConstraints payloads.
 */
export function sanitizeConstraints(raw: Partial<EventConstraints>): EventConstraints {
  const currencyCandidate = typeof raw.currency === 'string' ? raw.currency.toUpperCase() : 'USD';
  const currency: CurrencyCode = SUPPORTED_CURRENCIES.includes(currencyCandidate as CurrencyCode)
    ? (currencyCandidate as CurrencyCode)
    : 'USD';

  const totalBudget = clampNumber(
    raw.totalBudget,
    VALIDATION_LIMITS.BUDGET.MIN,
    VALIDATION_LIMITS.BUDGET.MAX,
    VALIDATION_LIMITS.BUDGET.DEFAULT
  );

  const guestCount = Math.round(
    clampNumber(
      raw.guestCount,
      VALIDATION_LIMITS.GUESTS.MIN,
      VALIDATION_LIMITS.GUESTS.MAX,
      VALIDATION_LIMITS.GUESTS.DEFAULT
    )
  );

  const timeRemainingMonths = Math.round(
    clampNumber(
      raw.timeRemainingMonths,
      VALIDATION_LIMITS.TIMELINE_MONTHS.MIN,
      VALIDATION_LIMITS.TIMELINE_MONTHS.MAX,
      VALIDATION_LIMITS.TIMELINE_MONTHS.DEFAULT
    )
  );

  const eventType = sanitizeText(
    raw.eventType,
    VALIDATION_LIMITS.STRING_LENGTHS.EVENT_TYPE_MAX,
    'Custom Celebration'
  );

  const eventName = sanitizeText(
    raw.eventName,
    VALIDATION_LIMITS.STRING_LENGTHS.EVENT_NAME_MAX,
    eventType
  );

  return {
    id: sanitizeText(raw.id, 100, `event-${Date.now()}`),
    eventName,
    eventType,
    totalBudget,
    currency,
    locationSetting: sanitizeText(
      raw.locationSetting,
      VALIDATION_LIMITS.STRING_LENGTHS.LOCATION_MAX,
      'Indoor & Outdoor Venue'
    ),
    guestCount,
    keyTheme: sanitizeText(
      raw.keyTheme,
      VALIDATION_LIMITS.STRING_LENGTHS.THEME_MAX,
      'Modern tailored celebration'
    ),
    timeRemainingMonths,
    specialRequests: raw.specialRequests
      ? sanitizeText(raw.specialRequests, VALIDATION_LIMITS.STRING_LENGTHS.SPECIAL_REQUESTS_MAX)
      : undefined,
  };
}

/**
 * Validates and sanitizes contextual metadata sent with assistant chat requests.
 */
export function sanitizeAssistantContext(raw?: Partial<AssistantEventContext>): AssistantEventContext {
  const validCurrencyCandidate = typeof raw?.currency === 'string' ? raw.currency.toUpperCase() : 'USD';
  const currency = SUPPORTED_CURRENCIES.includes(validCurrencyCandidate as CurrencyCode)
    ? validCurrencyCandidate
    : 'USD';

  return {
    eventType: sanitizeText(raw?.eventType, VALIDATION_LIMITS.STRING_LENGTHS.EVENT_TYPE_MAX, 'Celebration Event'),
    eventName: raw?.eventName ? sanitizeText(raw.eventName, VALIDATION_LIMITS.STRING_LENGTHS.EVENT_NAME_MAX) : undefined,
    guestCount: Math.round(clampNumber(raw?.guestCount, VALIDATION_LIMITS.GUESTS.MIN, VALIDATION_LIMITS.GUESTS.MAX, 100)),
    totalBudget: clampNumber(raw?.totalBudget, VALIDATION_LIMITS.BUDGET.MIN, VALIDATION_LIMITS.BUDGET.MAX, 25000),
    currency,
    locationSetting: sanitizeText(raw?.locationSetting, VALIDATION_LIMITS.STRING_LENGTHS.LOCATION_MAX, 'Indoor & Outdoor Venue'),
    keyTheme: sanitizeText(raw?.keyTheme, VALIDATION_LIMITS.STRING_LENGTHS.THEME_MAX, 'Modern Tailored Celebration'),
    timeRemainingMonths: Math.round(clampNumber(raw?.timeRemainingMonths, VALIDATION_LIMITS.TIMELINE_MONTHS.MIN, VALIDATION_LIMITS.TIMELINE_MONTHS.MAX, 3)),
    activeTab: sanitizeText(raw?.activeTab, 50, 'tab-concept'),
  };
}

/**
 * Generates a unique, deterministic hash key for caching EventBlueprint synthesis requests.
 */
export function buildConstraintsCacheKey(c: EventConstraints): string {
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

/**
 * Generates a unique, deterministic hash key for caching Assistant chat responses.
 */
export function buildAssistantCacheKey(query: string, context: AssistantEventContext): string {
  return [
    query.trim().toLowerCase(),
    context.eventType.toLowerCase().trim(),
    context.totalBudget,
    context.guestCount,
    context.currency,
  ].join('|');
}
