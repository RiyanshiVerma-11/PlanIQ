/**
 * Domain constants and configuration for PlanIQ Master Event Strategy & Logistics Suite.
 * Centralizes currency metadata, budget pillar definitions, designated lead roles,
 * and input validation constraints across client and server.
 */

import type { CurrencyCode, CurrencyConfig } from '../types/blueprint.ts';

/**
 * 7 internationally supported currencies with ISO code, symbols, USD exchange basis, and locales.
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
] as const;

export const CURRENCY_METADATA: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1, locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', rateToUSD: 83.5, locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', rateToUSD: 1.36, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', rateToUSD: 1.52, locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', rateToUSD: 154.0, locale: 'ja-JP' },
};

/**
 * The 7 standard budget pillars strictly mandated by PlanIQ event strategy.
 */
export const STANDARD_BUDGET_PILLARS = [
  'Venue & Facilities',
  'Food & Beverage',
  'Decor & Spatial Lighting',
  'Photography & Audio-Visual',
  'Entertainment & Music',
  'Attire/Favors/Touchpoints',
  'Contingency & Reserve',
] as const;

export type StandardBudgetPillar = (typeof STANDARD_BUDGET_PILLARS)[number];

/**
 * 6 designated lead roles for day-of Run-of-Show block assignments.
 */
export const DESIGNATED_LEAD_ROLES = [
  'Logistics Director',
  'Master of Ceremonies',
  'Stage Manager',
  'Catering Lead',
  'Event Host / VIP',
  'Photo/Video Lead',
] as const;

export type DesignatedLeadRole = (typeof DESIGNATED_LEAD_ROLES)[number];

/**
 * 4 core vendor vetting categories.
 */
export const CORE_VENDOR_CATEGORIES = [
  'Catering & Beverage',
  'Photo & Cinema',
  'Venue Operations',
  'Floral & Spatial Decor',
] as const;

export type CoreVendorCategory = (typeof CORE_VENDOR_CATEGORIES)[number];

/**
 * Bounds and validation limits for event constraints to prevent integer overflows and invalid states.
 */
export const VALIDATION_LIMITS = {
  BUDGET: {
    MIN: 100,
    MAX: 100_000_000,
    DEFAULT: 25_000,
  },
  GUESTS: {
    MIN: 1,
    MAX: 100_000,
    DEFAULT: 100,
  },
  TIMELINE_MONTHS: {
    MIN: 1,
    MAX: 60,
    DEFAULT: 3,
  },
  STRING_LENGTHS: {
    EVENT_NAME_MAX: 160,
    EVENT_TYPE_MAX: 160,
    LOCATION_MAX: 200,
    THEME_MAX: 300,
    SPECIAL_REQUESTS_MAX: 400,
    USER_QUERY_MAX: 1000,
  },
} as const;

/**
 * Workspace Tab Identifiers
 */
export const WORKSPACE_TAB_IDS = [
  'tab-dashboard',
  'tab-concept',
  'tab-budget',
  'tab-timeline',
  'tab-vendors',
] as const;

export type WorkspaceTabKey = (typeof WORKSPACE_TAB_IDS)[number];
