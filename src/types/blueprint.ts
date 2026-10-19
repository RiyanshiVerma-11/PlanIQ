/**
 * Types for Master Event Strategy & Logistics Suite
 */

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateToUSD: number;
  locale: string;
}

export interface EventConstraints {
  id: string;
  eventName?: string;
  eventType: string;
  totalBudget: number;
  currency: CurrencyCode;
  locationSetting: string;
  guestCount: number;
  keyTheme: string;
  timeRemainingMonths: number;
  specialRequests?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
  notes: string;
}

export interface CreativeConcept {
  aestheticTitle: string;
  aestheticManifesto: string;
  focalPoints: {
    area: string;
    description: string;
    materiality: string;
  }[];
  colorPalette: ColorSwatch[];
  interactiveElements: {
    title: string;
    targetMoment: string;
    description: string;
    guestExperience: string;
    logisticalRequirement: string;
  }[];
}

export interface BudgetCategoryAllocation {
  id: string;
  category: string;
  percentage: number; // e.g. 28 = 28%
  allocatedAmount: number;
  description: string;
  costOptimizationTips: [string, string];
  lineItems?: {
    name: string;
    estimatedCost: number;
    isCustom?: boolean;
  }[];
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: CurrencyCode;
  categories: BudgetCategoryAllocation[];
  perGuestCost: number;
  contingencyReserve: number;
}

export interface MilestoneCheckpoint {
  id: string;
  timeframe: string; // e.g. "3 Months Out", "6 Weeks Out"
  phase: 'Strategy & Foundations' | 'Vendor Lock-in' | 'Design & Production' | 'Final Coordination' | 'Event Week';
  tasks: {
    id: string;
    title: string;
    category: 'Venue' | 'Vendors' | 'Guest' | 'Design' | 'Logistics' | 'Finance';
    ownerRole: string;
    completed: boolean;
    priority: 'High' | 'Medium' | 'Critical';
    deadlineNote?: string;
  }[];
}

export interface RunOfShowBlock {
  id: string;
  startTime: string; // e.g. "08:00 AM"
  endTime: string;   // e.g. "09:30 AM"
  durationMinutes: number;
  activity: string;
  location: string;
  leadRole: 'Logistics Director' | 'Master of Ceremonies' | 'Stage Manager' | 'Catering Lead' | 'Event Host / VIP' | 'Photo/Video Lead';
  cuesAndNotes: string;
  equipmentOrSupplies: string;
}

export interface VendorVettingItem {
  id: string;
  category: string;
  bookingDeadline: string;
  scopeOfWork: string[];
  staffingOrEquipmentBenchmark: string;
  vettingQuestions: {
    id?: string;
    question: string;
    whyItMatters: string;
    greenFlagAnswer: string;
    redFlagAnswer: string;
  }[];
}

export interface VendorCandidate {
  id: string;
  category: string;
  vendorName: string;
  quoteAmount: number;
  reliabilityScore: number; // 1-5
  portfolioMatchScore: number; // 1-5
  scopeCompletenessScore: number; // 1-5
  communicationScore: number; // 1-5
  notes: string;
}

export interface EventBlueprint {
  constraints: EventConstraints;
  creativeConcept: CreativeConcept;
  budgetBreakdown: BudgetBreakdown;
  milestones: MilestoneCheckpoint[];
  runOfShow: RunOfShowBlock[];
  vendorVettingKit: VendorVettingItem[];
  vendorCandidates?: VendorCandidate[];
  generatedAt: string;
  version: string;
}
