import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExpertAssistantResponse } from '../src/utils/assistantEngine.ts';
import type { AssistantEventContext } from '../src/types/assistant.ts';

test('assistantEngine generates tailored creative concept and audio guestbook for Weddings', () => {
  const context: AssistantEventContext = {
    eventType: 'Modern Fusion Wedding',
    eventName: 'Heritage Fusion Nuptials',
    guestCount: 150,
    totalBudget: 45000,
    currency: 'USD',
    locationSetting: 'Indoor banquet + outdoor lawn',
    keyTheme: 'Minimalist pastel with warm brass & botanical architecture',
    timeRemainingMonths: 4,
  };

  const response = generateExpertAssistantResponse('What are unique decor and creative ideas for my wedding?', context);
  assert.ok(response.reply.includes('Wedding'));
  assert.ok(response.reply.includes('Audio Guestbook'));
  assert.ok(response.suggestions.length >= 2);
  assert.ok(response.actionSuggestion !== undefined);
  assert.equal(response.actionSuggestion?.type, 'add_concept_idea');
});

test('assistantEngine generates interactive vinyl bar and late night bites for Milestone Birthdays', () => {
  const context: AssistantEventContext = {
    eventType: '30th Birthday Celebration',
    eventName: 'Nocturne 30th Soirée',
    guestCount: 60,
    totalBudget: 12000,
    currency: 'USD',
    locationSetting: 'Urban brick loft + rooftop terrace',
    keyTheme: 'Moody editorial lounge, vinyl bar & cocktail pairings',
    timeRemainingMonths: 2,
  };

  const response = generateExpertAssistantResponse('Suggest interactive activities and party vibes', context);
  assert.ok(response.reply.includes('Milestone Celebration'));
  assert.ok(response.reply.includes('Vinyl'));
  assert.ok(response.actionSuggestion !== undefined);
  assert.equal(response.actionSuggestion?.type, 'add_concept_idea');
});

test('assistantEngine generates crowd flow and collaborative walls for Community Events', () => {
  const context: AssistantEventContext = {
    eventType: 'Tech Community Gala & Awards',
    eventName: 'Community Impact Gala',
    guestCount: 250,
    totalBudget: 35000,
    currency: 'USD',
    locationSetting: 'Waterfront industrial truss pavilion',
    keyTheme: 'Kinetic Monolith & Cyber-Clean Staging',
    timeRemainingMonths: 3,
  };

  const response = generateExpertAssistantResponse('How can we maximize attendee engagement and spatial layout?', context);
  assert.ok(response.reply.includes('Community Engagement'));
  assert.ok(response.suggestions.some((s) => s.toLowerCase().includes('safety') || s.toLowerCase().includes('av')));
});

test('assistantEngine provides high-impact budget trimming levers and executable rebalance action', () => {
  const context: AssistantEventContext = {
    eventType: 'Modern Fusion Wedding',
    guestCount: 120,
    totalBudget: 30000,
    currency: 'USD',
    locationSetting: 'Historic Manor',
    keyTheme: 'Garden Romance',
  };

  const response = generateExpertAssistantResponse('How do I cut budget and save 10% on costs?', context);
  assert.ok(response.reply.includes('Budget Optimization'));
  assert.ok(response.reply.includes('Repurpose Floral'));
  assert.ok(response.reply.includes('Beverage Format'));
  assert.equal(response.actionSuggestion?.type, 'rebalance_budget');
});

test('assistantEngine provides contract defense against hidden fees and overtime traps', () => {
  const context: AssistantEventContext = {
    eventType: '30th Birthday Celebration',
    guestCount: 80,
    totalBudget: 15000,
    currency: 'USD',
    locationSetting: 'Loft Space',
    keyTheme: 'Cocktail Chic',
  };

  const response = generateExpertAssistantResponse('What vendor contract traps and hidden fees should I check?', context);
  assert.ok(response.reply.includes('Procurement Defense'));
  assert.ok(response.reply.includes('All-Inclusive Rate'));
  assert.ok(response.reply.includes('Overtime'));
  assert.equal(response.actionSuggestion?.type, 'add_vendor_question');
});

test('assistantEngine analyzes run-of-show timing and proposes timeline checkpoint action', () => {
  const context: AssistantEventContext = {
    eventType: 'Tech Community Gala',
    guestCount: 200,
    totalBudget: 40000,
    currency: 'USD',
    locationSetting: 'Civic Auditorium',
    keyTheme: 'Tech & Art',
  };

  const response = generateExpertAssistantResponse('Evaluate my day-of schedule and timeline pacing', context);
  assert.ok(response.reply.includes('Run-of-Show Pacing'));
  assert.ok(response.reply.includes('Transition Buffer'));
  assert.equal(response.actionSuggestion?.type, 'add_task');
});

test('assistantEngine safely handles empty query and returns welcoming overview', () => {
  const context: AssistantEventContext = {
    eventType: 'Custom Gala',
    guestCount: 50,
    totalBudget: 10000,
    currency: 'EUR',
    locationSetting: 'Boutique Gallery',
    keyTheme: 'Contemporary Art',
  };

  const response = generateExpertAssistantResponse('', context);
  assert.ok(response.reply.includes('PlanIQ GenAI Event Strategist'));
  assert.ok(response.suggestions.length >= 3);
});
