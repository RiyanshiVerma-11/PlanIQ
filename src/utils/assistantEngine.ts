import type {
  AssistantEventContext,
  AssistantChatResponse,
  AssistantActionSuggestion,
} from '../types/assistant.ts';
import { formatCurrency } from './blueprintEngine.ts';

/**
 * Intelligent PlanIQ Expert Event Strategist
 * Generates tailored, contextual advice, creative ideas, budget recommendations,
 * and executable actions for Weddings, Birthdays, and Community Events.
 */
export function generateExpertAssistantResponse(
  userQuery: string,
  context: AssistantEventContext
): AssistantChatResponse {
  const query = userQuery.toLowerCase().trim();
  const eventType = context.eventType || 'Celebration Event';
  const isWedding = /wedding|nuptial|bridal|matrimony/i.test(eventType) || /wedding/i.test(query);
  const isBirthday = /birthday|milestone|anniversary|soiree|party/i.test(eventType) || /birthday/i.test(query);
  const isCommunity = /community|gala|festival|charity|conference|awards|public/i.test(eventType) || /community|gala|festival/i.test(query);

  const currency = (context.currency as any) || 'USD';
  const totalBudget = context.totalBudget || 25000;
  const guestCount = context.guestCount || 100;
  const perGuest = Math.round(totalBudget / (guestCount || 1));

  let reply = '';
  let suggestions: string[] = [];
  let actionSuggestion: AssistantActionSuggestion | undefined;

  // 1. Budget Trimming & Savings Queries
  if (/cut budget|save money|trim budget|reduce cost|cheaper|lower budget|over budget|rebalance/i.test(query)) {
    reply = `### 💰 Tactical Budget Optimization Plan for ${context.eventName || eventType}

With a total budget of **${formatCurrency(totalBudget, currency)}** across **${guestCount} guests** (~**${formatCurrency(perGuest, currency)}/guest**), here are 3 high-impact, non-destructive cost trimming levers:

1. **Repurpose Floral & Spatial Decor (Save ~8–12%)**:
   - Transfer ceremony aisle arrangements to frame the head table and bar during cocktail hour.
   - Utilize high-impact ambient warm uplighting rather than dense overhead hanging installations.

2. **Streamline Beverage Format (Save ~15–20% on F&B)**:
   - Switch from a full premium open bar to a curated bar: 2 signature cocktails + craft beer & regional wines.
   - Restrict hard liquor to cocktail hour, transitioning to wine and beer for the dancing phase.

3. **Vendor Crew Catering Rationalization (Save ~$300–$800)**:
   - Confirm hot vendor meals (photographers, DJ, coordinators) via a specialized crew menu rather than standard guest plate pricing.`;

    suggestions = [
      'How to negotiate with caterers without lowering food quality?',
      'Suggest a 5% contingency reserve reallocation',
      'What are the biggest hidden fees in venue contracts?',
    ];

    actionSuggestion = {
      type: 'rebalance_budget',
      label: 'Optimize F&B & Decor Allocations',
      description: 'Reallocate 2% from Decor to Contingency Reserve for added financial safety.',
      payload: { categoryId: 'cat-contingency', percentageIncrease: 2 },
    };
  }
  // 2. Decor, Activities & Creative Concept Ideas
  else if (/decor|theme|aesthetic|ideas|concept|colors|palette|creative|look|activit|interactive|vibe|engagement|spatial/i.test(query)) {
    if (isWedding) {
      reply = `### 💍 Personalized Creative Concept for Your Wedding

**Theme Direction**: *${context.keyTheme || 'Botanical Warmth & Timeless Architecture'}*  
**Setting**: *${context.locationSetting}*

**1. Entrance & First Impression**:
- A minimalist sculptural Welcome Arch framed with textured stone pedestals, linen drape, and localized garden roses.
- A personalized **Audio Guestbook Station** featuring a vintage rotary phone where guests record heartfelt voicemail blessings.

**2. Tabletop & Lighting Architecture**:
- Low-profile floral meadows allowing unimpeded conversation across tables.
- Warm amber candlelight (pillar candles enclosed in glass hurricane cylinders compliant with venue fire codes).

**3. Signature Keepsake Touchpoint**:
- Hand-pressed wax seal menu cards customized with individual guest calligraphy.`;

      suggestions = [
        'Suggest 3 signature cocktail pairings for wedding guests',
        'How to arrange the ceremony-to-reception transition?',
        'What lighting works best for evening photography?',
      ];

      actionSuggestion = {
        type: 'add_concept_idea',
        label: 'Add Audio Guestbook Experience',
        description: 'Incorporate vintage rotary phone audio guestbook to your interactive concept moments.',
        payload: {
          title: 'Vintage Audio Guestbook Station',
          description: 'A dedicated acoustically damped lounge corner with a retro telephone for recorded guest well-wishes.',
        },
      };
    } else if (isBirthday) {
      reply = `### 🎂 Tailored Vibe & Interactive Concept for Your Milestone Celebration

**Theme Direction**: *${context.keyTheme || 'Moody Editorial Chic & High-Energy Celebration'}*  
**Venue Atmosphere**: *${context.locationSetting}*

**1. The Arrival Moment**:
- A dramatic back-lit acrylic signage wall with ambient neon or brass lettering celebrating the guest of honor.
- Welcome glass of sparkling wine topped with edible gold leaf or dehydrated citrus wheel.

**2. Interactive Highlight**:
- **Custom Vinyl Listening & Request Bar**: A retro turntable station where guests flip through curated records to cue up their nostalgic tracks with the DJ.
- **Instant Polaroid Memory Board**: Dedicated cameras with metallic markers for guests to pin snaps and notes to a wire grid.

**3. Late-Night Pivot**:
- At hour 3, dim main lights and introduce a secret late-night bite pass (e.g., gourmet truffle sliders or churro bites).`;

      suggestions = [
        'What is the ideal music pacing for a 30th birthday?',
        'How many drinks per person should I budget for?',
        'Suggest photo booth vendor vetting questions',
      ];

      actionSuggestion = {
        type: 'add_concept_idea',
        label: 'Add Vinyl Request Lounge Idea',
        description: 'Add the interactive vinyl request station to your creative elements list.',
        payload: {
          title: 'Custom Vinyl Request Bar',
          description: 'Interactive turntable setup where guests select vinyl favorites to be mixed into the party set.',
        },
      };
    } else {
      reply = `### 🎪 Personalized Spatial & Community Engagement Concept

**Event Vertical**: *${eventType}* (${guestCount} attendees)  
**Setting**: *${context.locationSetting}*

**1. Kinetic Spatial Hub**:
- Modular high-top networking clusters centered around dynamic digital sponsor showcases and interactive polling stations.
- Central lighting truss that shifts hues between key programming segments (e.g., warm amber for mingling, cobalt blue for awards/speeches).

**2. Community Engagement Catalyst**:
- **Collaborative Expression Wall**: A physical or projection-mapped canvas where attendees contribute thoughts, pledges, or community milestones.
- **Lightning Demo & Speed Networking Circle**: Structured 10-minute micro-breakout sessions spaced during the reception.

**3. Memorable Swag / Takeaway**:
- Reusable zero-waste branded items (custom seed-paper passes, insulated artisan drinkware) that align with community values.`;

      suggestions = [
        'How to optimize attendee flow and avoid registration bottlenecks?',
        'What AV equipment is necessary for speeches & awards?',
        'Checklist for community event safety and city permits',
      ];
    }
  }
  // 3. Timeline, Run-of-Show & Schedule Queries
  else if (/timeline|run of show|schedule|hours|time|pacing|flow|delay|agenda/i.test(query)) {
    reply = `### ⏱️ Strategic Run-of-Show Pacing Analysis

For an event of **${guestCount} guests** in a **${context.locationSetting}**, timing precision is key to keeping momentum high and preventing guest fatigue.

**Key Pacing Benchmarks**:
- **Guest Arrival & Welcome Buffer**: 30–45 mins max. Never leave guests waiting with empty glasses. Background music should sit at 65 dB (comfortable for chatter).
- **Core Programming / Ceremony / Keynote**: Limit formal speeches or presentations to **20–30 minutes total**. Any speech over 5 minutes loses 40% of room attention.
- **Transition Buffer**: Build a **15-minute logistical cushion** between cocktail phase and dinner seating. Moving 100+ guests through a door takes 12–14 minutes.
- **Peak Energy Phase**: The final 90 minutes should remain free of administrative announcements or interruptions to let guests immerse in dancing and socializing.

**Logistical Tip**: Share the run-of-show with all leads (Catering, DJ, Photo) 48 hours in advance with synchronized clock times.`;

    suggestions = [
      'Export Run-of-Show to .ICS Google / Apple Calendar',
      'What are the lead role responsibilities during strike / load-out?',
      'How to handle weather delays for outdoor spaces?',
    ];

    actionSuggestion = {
      type: 'add_task',
      label: 'Add Final Vendor Sync Check to Milestones',
      description: 'Add a mandatory 48-hour timeline alignment call with DJ, Caterer, and Photo Lead.',
      payload: {
        title: 'Conduct 48h Final Run-of-Show Alignment Call with Leads',
        category: 'Logistics',
        ownerRole: 'Logistics Director',
        priority: 'Critical',
      },
    };
  }
  // 4. Vendor Vetting & Negotiation Queries
  else if (/vendor|contract|negotiate|vetting|quote|hidden fee|caterer|photographer|dj|venue/i.test(query)) {
    reply = `### 📋 Procurement Defense: Vendor Vetting & Negotiation Guide

When signing contracts for **${context.eventName || eventType}**, always protect your **${formatCurrency(totalBudget, currency)}** budget with these 4 non-negotiable clauses:

1. **The "All-Inclusive Rate" Clause**:
   - *Trap*: Caterers and venues quoting a low baseline, then tacking on 22% administrative charge + 8% tax + 15% mandatory gratuity (a 45% hidden markup!).
   - *Defense Question*: *"Does your quote represent the out-the-door invoice including all gratuities, service charges, setup/breakdown fees, and local taxes?"*

2. **Overtime & Strike Buffer**:
   - *Trap*: Venues billing $500–$1,000 for every 15 minutes guests linger past midnight.
   - *Defense Question*: *"What is your grace period for load-out, and is overtime billed in 15-minute or full-hour increments?"*

3. **Power & AV Rider Verification**:
   - *Trap*: Bands or DJs blowing circuit breakers because the venue's single 15A outlet cannot handle subwoofers and lighting rigs.
   - *Defense Question*: *"Do you require dedicated 20A circuits, and do you supply your own commercial-grade power distribution boxes?"*`;

    suggestions = [
      'Generate sample email script to inquire with photographers',
      'What staffing ratio is needed for 100 guests at dinner?',
      'How to verify vendor liability insurance certificates (COI)',
    ];

    actionSuggestion = {
      type: 'add_vendor_question',
      label: 'Add COI & Insurance Check to Vendor Kit',
      description: 'Add Certificate of Insurance verification to all vendor candidate profiles.',
      payload: {
        question: 'Can you provide an active $1M-$2M Certificate of Insurance naming the venue as additional insured 30 days prior?',
      },
    };
  }
  // 5. Emergency, Rain & Risk Contingency
  else if (/rain|weather|emergency|crisis|risk|backup|contingency|cancellation/i.test(query)) {
    reply = `### 🚨 Crisis & Weather Contingency Architecture

Every flawless event requires an airtight "Plan B" that feels just as intentional as Plan A:

1. **The 48-Hour Weather Trigger**:
   - Establish a firm decision deadline at **48 hours prior** with the rental company. If chance of precipitation exceeds 40%, trigger the marquee tent / indoor salon layout immediately.
   - Never wait until morning of the event to source sidewalls or heaters.

2. **Power & Audio Redundancy**:
   - For outdoor lawns or lofts, confirm an on-site or rental 5.5kW inverter generator to safeguard lighting and refrigeration from venue power surges.

3. **Financial Contingency Reserve**:
   - PlanIQ automatically reserves **${formatCurrency(Math.round(totalBudget * 0.05), currency)} (5%)** as an untouched emergency buffer. Do not allocate this to decorative extras.`;

    suggestions = [
      'Review my current 5% contingency reserve in the budget',
      'What tasks belong in the Final Week countdown?',
      'How to brief coordinators on emergency egress routes?',
    ];
  }
  // 6. Default / General Event Assistant
  else {
    reply = `### 🤖 PlanIQ GenAI Event Strategist

I am your active planning co-pilot for **${context.eventName || eventType}** (${guestCount} guests, ${formatCurrency(totalBudget, currency)} budget in ${context.locationSetting}).

Here is what I can help you orchestrate right now:

- 💡 **Personalized Ideas**: Bespoke aesthetic themes, signature activities, and curated color palettes.
- 💰 **Budget Optimizer**: Forensic 7-pillar allocations, per-guest benchmarking, and cost-trimming tactics.
- ⏱️ **Run-of-Show Schedules**: Hourly timeline cues with designated roles and equipment notes.
- 📋 **Vendor Checklists**: Anti-hidden fee vetting questions, scopes of work, and contract defense.
- 🚨 **Risk & Contingencies**: Weather backup triggers and emergency operational plans.

What aspect of your celebration would you like to refine next?`;

    suggestions = [
      '💡 Suggest 3 unique interactive ideas for my guests',
      '💰 How can I trim 10% from my event budget?',
      '⏱️ What should my day-of timeline look like?',
      '📋 What questions should I ask when booking vendors?',
    ];
  }

  return {
    reply,
    suggestions,
    actionSuggestion,
    source: 'expert-strategist',
  };
}
