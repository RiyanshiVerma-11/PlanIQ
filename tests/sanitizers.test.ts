/**
 * Unit tests for server sanitizers and validators
 * Validates input cleansing, numeric clamping, currency constraints, and deterministic cache key creation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeText,
  clampNumber,
  sanitizeConstraints,
  sanitizeAssistantContext,
  buildConstraintsCacheKey,
  buildAssistantCacheKey,
} from '../server/utils/sanitizers.ts';

describe('Server Input Sanitizers & Constraints Validator', () => {
  it('sanitizeText strips ASCII control characters and truncates safely', () => {
    const raw = 'Hello\u0000 World\u001F!\u007F  ';
    const cleaned = sanitizeText(raw, 50);
    assert.equal(cleaned, 'Hello  World !');

    const truncated = sanitizeText('A'.repeat(100), 10);
    assert.equal(truncated.length, 10);

    assert.equal(sanitizeText(null, 50, 'fallback'), 'fallback');
    assert.equal(sanitizeText(undefined, 50, 'fallback'), 'fallback');
    assert.equal(sanitizeText(12345, 50, 'fallback'), 'fallback');
  });

  it('clampNumber enforces min and max boundaries with safe fallbacks', () => {
    assert.equal(clampNumber(50, 10, 100, 20), 50);
    assert.equal(clampNumber(5, 10, 100, 20), 10);
    assert.equal(clampNumber(200, 10, 100, 20), 100);
    assert.equal(clampNumber('invalid', 10, 100, 25), 25);
    assert.equal(clampNumber(NaN, 10, 100, 25), 25);
    assert.equal(clampNumber(Infinity, 10, 100, 25), 25);
  });

  it('sanitizeConstraints normalizes currencies, totalBudget, and guestCount', () => {
    const raw = {
      eventType: '   Beach Gala \u0000 ',
      totalBudget: 150000000, // exceeds max limit of 100M
      currency: 'inr' as any, // lowercase
      guestCount: -10, // below min of 1
      timeRemainingMonths: 120, // exceeds max of 60
    };

    const sanitized = sanitizeConstraints(raw);

    assert.equal(sanitized.eventType, 'Beach Gala');
    assert.equal(sanitized.totalBudget, 100_000_000, 'totalBudget should be clamped to max 100M');
    assert.equal(sanitized.currency, 'INR', 'currency should be normalized to uppercase supported currency');
    assert.equal(sanitized.guestCount, 1, 'guestCount should be clamped to minimum 1');
    assert.equal(sanitized.timeRemainingMonths, 60, 'timeRemainingMonths should be clamped to max 60');
    assert.ok(sanitized.id.startsWith('event-'));
  });

  it('sanitizeConstraints falls back to USD for unsupported currencies', () => {
    const raw = {
      eventType: 'Anniversary',
      totalBudget: 10000,
      currency: 'BITCOIN' as any,
    };

    const sanitized = sanitizeConstraints(raw);
    assert.equal(sanitized.currency, 'USD');
  });

  it('sanitizeAssistantContext parses context safely', () => {
    const ctx = sanitizeAssistantContext({
      eventType: 'Tech Summit',
      guestCount: 250,
      totalBudget: 40000,
      currency: 'EUR',
    });

    assert.equal(ctx.eventType, 'Tech Summit');
    assert.equal(ctx.guestCount, 250);
    assert.equal(ctx.totalBudget, 40000);
    assert.equal(ctx.currency, 'EUR');
    assert.equal(ctx.activeTab, 'tab-concept');
  });

  it('buildConstraintsCacheKey produces deterministic, normalized cache keys', () => {
    const c1 = sanitizeConstraints({
      eventType: 'Wedding',
      totalBudget: 35000,
      currency: 'USD',
      guestCount: 120,
      timeRemainingMonths: 6,
      locationSetting: 'Vineyard Estate',
      keyTheme: 'Rustic Elegance',
    });

    const c2 = sanitizeConstraints({
      eventType: '  wedding  ',
      totalBudget: 35000,
      currency: 'USD',
      guestCount: 120,
      timeRemainingMonths: 6,
      locationSetting: ' vineyard estate ',
      keyTheme: '  rustic elegance  ',
    });

    const key1 = buildConstraintsCacheKey(c1);
    const key2 = buildConstraintsCacheKey(c2);

    assert.equal(key1, key2, 'Keys with equivalent normalized content must match');
  });

  it('buildAssistantCacheKey produces case-insensitive matching cache keys', () => {
    const ctx = sanitizeAssistantContext({ eventType: 'Birthday', totalBudget: 5000, guestCount: 25, currency: 'USD' });
    const k1 = buildAssistantCacheKey('How to cut decor budget?', ctx);
    const k2 = buildAssistantCacheKey('  how to cut decor budget?  ', ctx);

    assert.equal(k1, k2);
  });
});
