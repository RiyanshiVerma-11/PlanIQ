import type {
  CurrencyCode,
  CurrencyConfig,
  EventConstraints,
  EventBlueprint,
  BudgetBreakdown,
  BudgetCategoryAllocation,
  CreativeConcept,
  MilestoneCheckpoint,
  RunOfShowBlock,
  VendorVettingItem,
} from '../types/blueprint.ts';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1, locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', rateToUSD: 83.5, locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', rateToUSD: 1.36, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', rateToUSD: 1.52, locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', rateToUSD: 154.0, locale: 'ja-JP' },
};

/**
 * Format currency with international formatting standards
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const cfg = CURRENCIES[currency] || CURRENCIES.USD;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      maximumFractionDigits: cfg.code === 'JPY' ? 0 : 0,
    }).format(Math.round(amount));
  } catch {
    return `${cfg.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Calculate per-guest cost metrics
 */
export function calculatePerGuestCost(totalBudget: number, guestCount: number): number {
  if (guestCount <= 0) return 0;
  return Math.round(totalBudget / guestCount);
}

/**
 * Calculate allocated amount from percentage
 */
export function calculateCategoryAmount(totalBudget: number, percentage: number): number {
  return Math.round((totalBudget * percentage) / 100);
}

/**
 * Recompute category amounts from percentages
 */
export function rebalanceBudgetCategories(
  categories: BudgetCategoryAllocation[],
  totalBudget: number
): BudgetCategoryAllocation[] {
  return categories.map((cat) => ({
    ...cat,
    allocatedAmount: calculateCategoryAmount(totalBudget, cat.percentage),
  }));
}

/**
 * Normalize category percentages so they sum to 100%
 */
export function normalizePercentages(categories: BudgetCategoryAllocation[]): BudgetCategoryAllocation[] {
  const sum = categories.reduce((acc, c) => acc + c.percentage, 0);
  if (sum === 0 || categories.length === 0) return categories;

  let runningSum = 0;
  return categories.map((c, idx) => {
    if (idx === categories.length - 1) {
      const remaining = Math.max(1, 100 - runningSum);
      return {
        ...c,
        percentage: remaining,
      };
    }
    const normalized = Math.max(1, Math.round((c.percentage / sum) * 100));
    runningSum += normalized;
    return {
      ...c,
      percentage: normalized,
    };
  });
}

// ---------------- PRESET 1: MODERN FUSION WEDDING ----------------
export const PRESET_MODERN_FUSION_WEDDING: EventBlueprint = {
  constraints: {
    id: 'preset-fusion-wedding',
    eventType: 'Modern Fusion Wedding',
    totalBudget: 45000,
    currency: 'USD',
    locationSetting: 'Indoor banquet + outdoor lawn',
    guestCount: 150,
    keyTheme: 'Minimalist pastel with warm brass & botanical architecture',
    timeRemainingMonths: 4,
  },
  creativeConcept: {
    aestheticTitle: 'Ethereal Botanical Minimalist & Heritage Warmth',
    aestheticManifesto:
      'A seamless synthesis of contemporary restraint and celebratory warmth. Clean architectural silhouettes frame organic wildflower cascades, muted blush palettes, and textured raw linen, harmonizing traditional ceremonial richness with relaxed garden-party sociability.',
    focalPoints: [
      {
        area: 'Lawn Ceremony & Exchange Threshold',
        description: 'An open-air asymmetric curved floral ground-nest arch framing the natural meadow horizon, flanked by tiered low brass lanterns.',
        materiality: 'Bleached Ruscus, garden roses in dusty peach, brushed antique brass, polished raw stone',
      },
      {
        area: 'Banquet Transition Portal',
        description: 'Double-sided botanical seating chart installation with hand-deckled calligraphy paper pinned on linen panels under warm pin-spot lighting.',
        materiality: 'Belgian oyster linen, architectural bronze framing, handmade cotton paper',
      },
      {
        area: 'Tablescape Architecture',
        description: 'Alternating high sculptural single-species stems in fluted smoked glass with low pooling floral frogs, matte stoneware charger plates, and tapered beeswax candles.',
        materiality: 'Smoked crystal glassware, nude stoneware, raw silk napkins, honey beeswax',
      },
    ],
    colorPalette: [
      { name: 'Oyster Linen', hex: '#EDE8E1', role: 'Neutral Grounding', notes: 'Base table linens, structural drapery, stationery paper' },
      { name: 'Blush Terracotta', hex: '#D99B82', role: 'Warm Accent', notes: 'Florals, velvet lounge pillows, cocktail garnishes' },
      { name: 'Muted Sage', hex: '#8C9B86', role: 'Botanical Harmony', notes: 'Eucalyptus foliage, outdoor terrace accents' },
      { name: 'Brushed Brass', hex: '#C29F5D', role: 'Metallic Hardware', notes: 'Candelabras, cutlery, structural arch fittings' },
      { name: 'Smoked Slate', hex: '#2A2928', role: 'High-Contrast Depth', notes: 'Signage typography, evening illumination shadows' },
    ],
    interactiveElements: [
      {
        title: 'Bespoke Dual-Heritage Fragrance & Tea Blending Bar',
        targetMoment: 'Transition Cocktail Hour on Outdoor Lawn',
        description: 'Guests curate their personalized keepsake tea blend or scent sachet combining East/West botanicals (cardamom, bergamot, saffron, chamomile, dried rose petals) packaged in custom stamped linen pouches.',
        guestExperience: 'Tactile, sensory keepsake that bridges the two cultural lineages of the couple.',
        logisticalRequirement: '1 trained attendant, 6 apothecary glass decanters, brass scoops, custom printed label stamper.',
      },
      {
        title: 'Audio Guestbook in Vintage Brass Telephone Booth',
        targetMoment: 'All Evening (Lounge Corner near Bar)',
        description: 'A restored 1940s rotary telephone fitted with high-fidelity internal digital recording. Guests pick up the receiver, hear a recorded voice prompt from the couple, and leave raw voice messages and toasts.',
        guestExperience: 'Intimate, emotional, spontaneous voice memories without the stiffness of a pen-and-paper book.',
        logisticalRequirement: 'Self-powered battery unit, dedicated cocktail table with directional acoustic dampening scrim.',
      },
      {
        title: 'Midnight Fusion Street Food Cart & Chai Service',
        targetMoment: '10:30 PM Late-Night Dance Floor Energy Surge',
        description: 'Live rolling culinary cart wheeling onto the dance floor serving gourmet mini fusion sliders, warm cardamom spiced cutting chai in terracotta kulhads, and churro-jalebi bites.',
        guestExperience: 'Revitalizes party momentum, satisfies late-night cravings, and delivers a memorable send-off high.',
        logisticalRequirement: 'Rolling food cart permit with venue kitchen, 1 dedicated hot-plate chef, compostable kulhad cups.',
      },
    ],
  },
  budgetBreakdown: {
    totalBudget: 45000,
    currency: 'USD',
    perGuestCost: 300,
    contingencyReserve: 3600,
    categories: [
      {
        id: 'venue',
        category: 'Venue & Facilities',
        percentage: 22,
        allocatedAmount: 9900,
        description: 'Lawn ceremony rental, indoor climate-controlled banquet hall, bridal suites, baseline cleaning & facility insurance.',
        costOptimizationTips: [
          'Book during non-peak crossover window (Friday or Sunday afternoon transition) to negotiate complimentary lawn access fees.',
          'Verify if venue provides in-house neutral cross-back chairs and standard banquet tables before contracting third-party rental companies.',
        ],
        lineItems: [
          { name: 'Indoor Banquet & Lawn Dual-Site Rental', estimatedCost: 7500 },
          { name: 'Bridal & Groom Prep Suites (8 hrs)', estimatedCost: 1200 },
          { name: 'Mandatory Venue Insurance & Janitorial Strike Fee', estimatedCost: 1200 },
        ],
      },
      {
        id: 'fnb',
        category: 'Food & Beverage',
        percentage: 34,
        allocatedAmount: 15300,
        description: 'Cocktail hour hors d’oeuvres, dual-heritage family-style dinner for 150 guests, premium open bar, service staff gratuity.',
        costOptimizationTips: [
          'Choose elevated family-style platters over plated courses: cuts server staffing requirements by ~25% while creating warmer communal bonding.',
          'Supply your own alcohol under a corkage agreement if permitted; purchase wine and spirits through wholesale distributors with returnable unopened cases.',
        ],
        lineItems: [
          { name: 'Cocktail Hour 4 Passed Canapés (150 guests)', estimatedCost: 2800 },
          { name: '3-Course Fusion Family-Style Dinner ($55/pp)', estimatedCost: 8250 },
          { name: 'Curated 4-Hour Open Bar + Mocktail Station', estimatedCost: 3000 },
          { name: 'Event Staffing & Bartender Gratuities', estimatedCost: 1250 },
        ],
      },
      {
        id: 'decor',
        category: 'Decor & Spatial Lighting',
        percentage: 16,
        allocatedAmount: 7200,
        description: 'Ceremony floral arch, 15 tablescapes, architectural pin-spot lighting, custom signage, ambient uplighting.',
        costOptimizationTips: [
          'Repurpose ceremony floral nest: have the logistics lead transport the ceremony arch flowers to frame the sweetheart table or photo backdrop during cocktail hour.',
          'Prioritize warm architectural lighting over dense floral mass: amber uplights and candle clusters transform spacious rooms for a fraction of stem costs.',
        ],
        lineItems: [
          { name: 'Ceremony Floral Nest (Repurposed for Reception)', estimatedCost: 2400 },
          { name: '15 Low Architectural Tablescapes & Candles', estimatedCost: 2700 },
          { name: 'Warm Ambient Uplighting & Pin-Spots', estimatedCost: 1400 },
          { name: 'Custom Welcome & Escort Display Signage', estimatedCost: 700 },
        ],
      },
      {
        id: 'photo_av',
        category: 'Photography & Audio-Visual',
        percentage: 12,
        allocatedAmount: 5400,
        description: '10-hour lead photographer + second shooter, ceremony sound system with wireless lavaliers, cinematic 4K highlight reel.',
        costOptimizationTips: [
          'Contract combined photo/video boutique teams rather than separate agencies to reduce redundant gear, travel expenses, and timeline friction.',
          'Request full raw footage delivery on an external SSD instead of paying for lengthy 60-minute documentary cuts upfront.',
        ],
        lineItems: [
          { name: 'Lead & Associate Photographer (10 hours)', estimatedCost: 3300 },
          { name: 'Ceremony & Lawn PA Audio System + Wireless Lavs', estimatedCost: 900 },
          { name: 'Cinematic 5-Minute Highlight Film', estimatedCost: 1200 },
        ],
      },
      {
        id: 'entertainment',
        category: 'Entertainment & Music',
        percentage: 8,
        allocatedAmount: 3600,
        description: 'Live acoustic ceremony string duo, dynamic multilingual DJ & MC, dance floor audio & intelligent lighting package.',
        costOptimizationTips: [
          'Hire an acoustic soloist/duo that doubles for ceremony and cocktail hour, then hand off seamlessly to a dedicated club-level DJ for dancing.',
          'Provide a curated "must-play" and "do-not-play" list with pre-mixed transition cues to maximize DJ efficiency without extra production equipment.',
        ],
        lineItems: [
          { name: 'Acoustic Cello/Guitar Duo for Ceremony & Lawn', estimatedCost: 1200 },
          { name: 'Master DJ & Bilingual MC (Reception, 5 hrs)', estimatedCost: 2000 },
          { name: 'Dance Floor Wireless Mic & Audio Monitoring', estimatedCost: 400 },
        ],
      },
      {
        id: 'attire_favors',
        category: 'Attire, Stationery & Favors',
        percentage: 4,
        allocatedAmount: 1800,
        description: 'Letterpress invitation suites, interactive tea favor bags, printed day-of menus, bridal emergency kits.',
        costOptimizationTips: [
          'Utilize digital RSVP tracking via custom wedding web portal to halve paper printing and postage expenses while gaining instant dietary counts.',
          'Turn the interactive fragrance/tea blending station into the guest favors, eliminating separate novelty favors that guests often leave behind.',
        ],
        lineItems: [
          { name: 'Bespoke Invitation Suite + Digital RSVPs', estimatedCost: 650 },
          { name: 'Day-of Menu Booklets & Foil Name Cards', estimatedCost: 450 },
          { name: 'Linen Tea Pouches & Raw Materials for Favors', estimatedCost: 700 },
        ],
      },
      {
        id: 'contingency',
        category: 'Contingency & Weather Buffer',
        percentage: 4,
        allocatedAmount: 1800,
        description: 'Dedicated reserve for weather tent deposits, overtime hour extensions, last-minute vendor meals, and emergency repair supplies.',
        costOptimizationTips: [
          'Keep this buffer untouched until T-7 days; any unspent funds can be converted into vendor tips or a post-wedding recovery brunch.',
          'Ensure the outdoor lawn contract has a predetermined 24-hour weather call deadline to avoid paying both lawn and indoor setup overtime fees.',
        ],
        lineItems: [
          { name: 'Weather Backup Rain Contingency Reserve', estimatedCost: 1000 },
          { name: 'Day-of Overtime & Unforeseen Logistics Pool', estimatedCost: 800 },
        ],
      },
    ],
  },
  milestones: [
    {
      id: 'm1',
      timeframe: 'Month 1 (16 to 12 Weeks Out)',
      phase: 'Strategy & Foundations',
      tasks: [
        { id: 't1-1', title: 'Sign dual-space venue agreement & verify outdoor sound curfew bylaws', category: 'Venue', ownerRole: 'Logistics Director', completed: true, priority: 'Critical', deadlineNote: 'Required for sound permits' },
        { id: 't1-2', title: 'Lock catering partner and confirm fusion tasting menu session', category: 'Vendors', ownerRole: 'Event Host / VIP', completed: true, priority: 'Critical' },
        { id: 't1-3', title: 'Contract Lead Photographer & Videographer team with raw capture clause', category: 'Vendors', ownerRole: 'Logistics Director', completed: true, priority: 'High' },
        { id: 't1-4', title: 'Finalize core color swatch palette and send mood board to floral designer', category: 'Design', ownerRole: 'Logistics Director', completed: true, priority: 'Medium' },
      ],
    },
    {
      id: 'm2',
      timeframe: 'Month 2 (12 to 8 Weeks Out)',
      phase: 'Vendor Lock-in',
      tasks: [
        { id: 't2-1', title: 'Send formal invitation suite with digital dietary restriction collection', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'High' },
        { id: 't2-2', title: 'Contract DJ & Ceremony live musicians; review cultural transition music cue list', category: 'Vendors', ownerRole: 'Stage Manager', completed: false, priority: 'High' },
        { id: 't2-3', title: 'Inspect venue electrical breaker capacity for outdoor lighting and catering warmers', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'Critical', deadlineNote: 'Ensure 40A dedicated circuits' },
        { id: 't2-4', title: 'Order custom stamped linen pouches and apothecary glass for tea blending station', category: 'Design', ownerRole: 'Logistics Director', completed: false, priority: 'Medium' },
      ],
    },
    {
      id: 'm3',
      timeframe: 'Month 3 (8 to 4 Weeks Out)',
      phase: 'Design & Production',
      tasks: [
        { id: 't3-1', title: 'Conduct comprehensive site walk-through with florist, caterer, and stage manager', category: 'Venue', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
        { id: 't3-2', title: 'Lock exact floral stem orders and finalize ceremony arch repurposing protocol', category: 'Design', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
        { id: 't3-3', title: 'Review finalized guest dietary spreadsheet with executive head chef', category: 'Vendors', ownerRole: 'Catering Lead', completed: false, priority: 'High' },
        { id: 't3-4', title: 'Compile draft Day-of Run of Show timeline and distribute to wedding party', category: 'Logistics', ownerRole: 'Stage Manager', completed: false, priority: 'Medium' },
      ],
    },
    {
      id: 'm4',
      timeframe: 'Month 4 (4 Weeks Out to Event Week)',
      phase: 'Final Coordination',
      tasks: [
        { id: 't4-1', title: 'Collect all final RSVP counts and issue printed seating chart to calligrapher', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'Critical' },
        { id: 't4-2', title: 'Execute final vendor balance payments & assemble tip envelopes in cash', category: 'Finance', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
        { id: 't4-3', title: 'Perform 48-hour weather monitoring and execute rain call protocol if forecast >40%', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
        { id: 't4-4', title: 'Conduct ceremony rehearsal and mic check on the lawn with officiant', category: 'Logistics', ownerRole: 'Stage Manager', completed: false, priority: 'High' },
      ],
    },
  ],
  runOfShow: [
    {
      id: 'ros-1',
      startTime: '08:00 AM',
      endTime: '10:30 AM',
      durationMinutes: 150,
      activity: 'Vendor Load-In & Structural Rigging',
      location: 'Banquet Hall & Lawn',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Direct lighting trucks, floral vans, and rental delivery teams. Verify venue loading dock clearance and drop floor protection.',
      equipmentOrSupplies: 'Site layout blueprints, vendor contact directory, tape measures, power drop cords.',
    },
    {
      id: 'ros-2',
      startTime: '10:30 AM',
      endTime: '12:30 PM',
      durationMinutes: 120,
      activity: 'Tablescape Styling, Florals & Audio Soundcheck',
      location: 'Indoor Banquet Space',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Place tablecloths, stoneware chargers, menus. Inspect candle heights and light test. Audio lead conducts frequency check on wireless lavs.',
      equipmentOrSupplies: 'Table numbers, seating cards, battery testers, sound level meter.',
    },
    {
      id: 'ros-3',
      startTime: '01:00 PM',
      endTime: '02:30 PM',
      durationMinutes: 90,
      activity: 'First Look, Bridal Party & VIP Photography',
      location: 'Garden Lawn & Courtyard',
      leadRole: 'Photo/Video Lead',
      cuesAndNotes: 'Coordinate private first look moment. Manage portrait family groupings systematically according to shot list.',
      equipmentOrSupplies: 'Family portrait shot list, bridal emergency kit (pins, lint roller, wipes).',
    },
    {
      id: 'ros-4',
      startTime: '03:00 PM',
      endTime: '03:30 PM',
      durationMinutes: 30,
      activity: 'Guest Arrival & Welcome Refreshment',
      location: 'Lawn Arrival Terrace',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Acoustic duo begins ambient prelude set. Catering serves chilled cucumber-rose water and infused iced tea. Ushers seat early guests.',
      equipmentOrSupplies: 'Welcome signage easel, umbrella stand, refreshment beverage dispensers.',
    },
    {
      id: 'ros-5',
      startTime: '03:30 PM',
      endTime: '04:15 PM',
      durationMinutes: 45,
      activity: 'Wedding Ceremony & Vow Exchange',
      location: 'Outdoor Lawn Centerpiece',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Processional begins on cue. Officiant mic level balanced. Ring exchange, cultural garland rituals, recessional fanfare.',
      equipmentOrSupplies: 'Ceremony script, rings box, vow booklets, cultural ritual brass trays.',
    },
    {
      id: 'ros-6',
      startTime: '04:15 PM',
      endTime: '05:30 PM',
      durationMinutes: 75,
      activity: 'Cocktail Hour & Interactive Fragrance Station',
      location: 'Lawn Veranda & Patio',
      leadRole: 'Catering Lead',
      cuesAndNotes: 'Passed canapés commence immediately. Open bar active. Tea blending attendant initiates guest keepsake blending. Floral team strikes ceremony flowers to banquet sweetheart table.',
      equipmentOrSupplies: 'Apothecary station, 4 hors d’oeuvre trays, bar glassware, cocktail napkins.',
    },
    {
      id: 'ros-7',
      startTime: '05:45 PM',
      endTime: '06:00 PM',
      durationMinutes: 15,
      activity: 'Grand Reception Entrance & Welcome Toast',
      location: 'Indoor Banquet Hall',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Guests seated via escort installation. MC announces wedding party entrance with high-energy track. Host delivers brief 3-minute welcome gratitude.',
      equipmentOrSupplies: 'Wireless handheld mic, entrance spotlight, DJ cue sheet.',
    },
    {
      id: 'ros-8',
      startTime: '06:00 PM',
      endTime: '07:30 PM',
      durationMinutes: 90,
      activity: 'Family-Style Fusion Dinner & Curated Speeches',
      location: 'Indoor Banquet Hall',
      leadRole: 'Catering Lead',
      cuesAndNotes: 'Three waves of hot family-style platters served. 3 speech blocks staggered between courses (Father of bride, Maid of Honor, Best Man).',
      equipmentOrSupplies: 'Serving spoons, wine carafes, speech timing clock for MC.',
    },
    {
      id: 'ros-9',
      startTime: '07:30 PM',
      endTime: '08:00 PM',
      durationMinutes: 30,
      activity: 'First Dance & Generational Open Floor',
      location: 'Central Dance Floor',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Couple takes floor for slow first dance; transitions into upbeat celebratory anthem inviting all guests onto the floor.',
      equipmentOrSupplies: 'Low fog machine (optional), intelligent amber beam lighting.',
    },
    {
      id: 'ros-10',
      startTime: '10:00 PM',
      endTime: '10:30 PM',
      durationMinutes: 30,
      activity: 'Midnight Fusion Street Food Cart Deployment',
      location: 'Dance Floor Perimeter',
      leadRole: 'Catering Lead',
      cuesAndNotes: 'Catering rolls out live cart with sliders and spiced cutting chai in kulhads. DJ hypes the midnight snack arrival.',
      equipmentOrSupplies: 'Rolling cart, warming chafers, 150 clay kulhad cups, napkins.',
    },
    {
      id: 'ros-11',
      startTime: '11:30 PM',
      endTime: '12:00 AM',
      durationMinutes: 30,
      activity: 'Last Dance, Sparkler Send-Off & Guest Departure',
      location: 'Grand Exterior Terrace Portico',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Final slow anthem. Guests directed to terrace for cold-spark or flashlight arch. Shuttles depart for designated hotel block.',
      equipmentOrSupplies: 'Torch lighters, sand buckets for safety, coach departure manifests.',
    },
    {
      id: 'ros-12',
      startTime: '12:00 AM',
      endTime: '01:30 AM',
      durationMinutes: 90,
      activity: 'Vendor Strike, Load-Out & Security Inspection',
      location: 'Full Property',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Rental items counted and packed into crates. Florals wrapped for donation or guest gifting. Final venue supervisor walk-through for security deposit sign-off.',
      equipmentOrSupplies: 'Inventory checklists, packing tape, moving dollies, facility sign-off clipboard.',
    },
  ],
  vendorVettingKit: [
    {
      id: 'vet-catering',
      category: 'Catering & Beverage',
      bookingDeadline: '10 to 14 Weeks Prior to Event Day',
      scopeOfWork: [
        'Complete food preparation, transport, and heating in compliance with venue prep kitchen limitations.',
        '1 server per 15 guests for family-style service, plus 1 head captain and 1 busser per 30 guests.',
        'Full setup and teardown of buffet/stations, bread baskets, wine pouring, and water glass maintenance.',
        'Eco-friendly disposal and composting of organic food scrap in accordance with zero-waste goals.',
      ],
      staffingOrEquipmentBenchmark: '1 Server per 15-18 guests; 1 Bartender per 50 guests for cocktail rush.',
      vettingQuestions: [
        {
          question: 'Are service charges, admin fees, and server gratuities bundled, or is gratuity billed separately on top of the 22% admin fee?',
          whyItMatters: 'Many quotes look competitive until an unannounced 22% administrative fee + separate 18% gratuity is added at final invoicing.',
          greenFlagAnswer: '"Our proposal clearly itemizes our 20% operational charge, which covers full living wage gratuity and liability insurance—no surprise extra tip required."',
          redFlagAnswer: '"The proposal shows labor; gratuity is discretionary and billed post-event, along with a variable fuel surcharge."',
        },
        {
          question: 'What is your exact policy and hourly rate if speeches or dinner service run 30 minutes over schedule?',
          whyItMatters: 'Dinners frequently run 15-30 minutes behind. Punitive overtime fees ($150/hr per server) can obliterate contingency buffers.',
          greenFlagAnswer: '"We include a complimentary 30-minute operational grace window before standard overtime billing starts at $45/staff hour."',
          redFlagAnswer: '"Every minute beyond the contracted strike time incurs automatic 1.5x overtime across our entire 12-person crew without warning."',
        },
        {
          question: 'Do you charge a cake-cutting or dessert plating fee if we source our wedding cake or pastries from an outside specialty bakery?',
          whyItMatters: 'Outside cake plating fees often range from $3.50 to $7.00 per guest ($525-$1050 for 150 guests) for cutting and paper plates.',
          greenFlagAnswer: '"No cake cutting fee is charged if our servers plate it alongside coffee, provided you supply the cake knives and boxes."',
          redFlagAnswer: '"Yes, all non-in-house food incurs a $5.00 per guest outside food liability inspection and cutting surcharge."',
        },
      ],
    },
    {
      id: 'vet-photo',
      category: 'Photo & Cinema',
      bookingDeadline: '12 to 16 Weeks Prior to Event Day',
      scopeOfWork: [
        '10 continuous hours of coverage with 1 principal photographer and 1 dedicated associate photographer.',
        'Minimum 600 color-graded, high-resolution JPEG images delivered via private password-protected online gallery.',
        'Full personal print and digital reproduction rights with zero watermarks.',
        'Delivery of raw unedited video footage on external hard drive within 14 days of the wedding.',
      ],
      staffingOrEquipmentBenchmark: 'Dual shooters with dual SD card slots per camera body to guarantee real-time backup.',
      vettingQuestions: [
        {
          question: 'Do you record simultaneous backup copies to dual card slots, and what is your offsite cloud redundancy workflow on the night of the event?',
          whyItMatters: 'Corrupt memory cards or lost gear represent an irreversible catastrophe for once-in-a-lifetime events.',
          greenFlagAnswer: '"All cameras record dual RAW files simultaneously. Within 2 hours of strike, footage is cloned to two physical RAID drives and offsite cloud storage."',
          redFlagAnswer: '"We use high-grade single cards and offload files to our desktop once we return to the studio on Monday."',
        },
        {
          question: 'Is the person we are interviewing guaranteed to be our actual lead shooter on the day, or could our wedding be assigned to an associate contractor?',
          whyItMatters: 'Boutique studios often sell on the founder’s portfolio but dispatch junior freelance contractors on the event date.',
          greenFlagAnswer: '"I am personally contracted as your lead shooter and named in Section 2 of our contract; associates are strictly vetted second shooters."',
          redFlagAnswer: '"Our studio manager assigns the best available staff shooter based on regional scheduling 2 weeks prior."',
        },
        {
          question: 'Are travel, lodging, meal breaks, and parking fees fully included in this fixed quote, or will they be billed as reimbursements?',
          whyItMatters: 'Hidden travel fees, hotel per-diems, and equipment transport charges can add $600-$1200.',
          greenFlagAnswer: '"Our quote is 100% all-inclusive for locations within 75 miles; hot vendor meals during dinner are the only requested requirement."',
          redFlagAnswer: '"Mileage is calculated at federal rates post-event, along with standard parking and accommodation receipts."',
        },
      ],
    },
    {
      id: 'vet-venue',
      category: 'Venue Operations',
      bookingDeadline: '16 to 20 Weeks Prior (Priority Zero)',
      scopeOfWork: [
        'Exclusive access to banquet hall, lawn grounds, bridal prep suites, and restrooms from 08:00 AM to 01:30 AM.',
        'Facility manager on duty throughout the entire setup, execution, and strike period.',
        'Standard electrical tie-in power, potable water access for caterers, and climate control.',
        'Post-event standard janitorial trash removal and recycling consolidation.',
      ],
      staffingOrEquipmentBenchmark: 'Dedicated venue supervisor on-site + loading dock bay reservation.',
      vettingQuestions: [
        {
          question: 'What are the exact decibel restrictions and municipal cutoff times for outdoor amplified sound on the lawn?',
          whyItMatters: 'Violating neighborhood sound bylaws can result in the police shutting down ceremonies or cocktail music midway.',
          greenFlagAnswer: '"Outdoor music must stay below 75dB and transition indoors by 10:00 PM; our indoor ballroom has zero curfew until 02:00 AM."',
          redFlagAnswer: '"Just keep it reasonable, but the neighbors sometimes call the city if the bass is too heavy."',
        },
        {
          question: 'Are there any mandatory exclusive vendor lists (caterer, AV, florist) with buy-out penalties if we bring our preferred licensed professionals?',
          whyItMatters: 'Many venues charge a 15-20% penalty fee on outside caterers or force you into exorbitant in-house AV vendors.',
          greenFlagAnswer: '"You may use any vendor as long as they provide a $1M general liability certificate and sign our vendor code of conduct."',
          redFlagAnswer: '"You must choose from our list of 3 caterers; bringing an outside caterer requires a $2,500 kitchen buy-out fee."',
        },
        {
          question: 'What are the exact load-in and strike windows, and what is the fee if our decor team requires an extra hour for teardown?',
          whyItMatters: 'Strict 45-minute teardown windows lead to rushed packing, broken glassware, and forfeiture of the $1,000 security deposit.',
          greenFlagAnswer: '"You have a full 90-minute load-out buffer post-event; overtime is billed in 30-minute increments at $200/hr."',
          redFlagAnswer: '"All items and trash must be out the door exactly 30 minutes after event end or the $1,500 deposit is forfeited."',
        },
      ],
    },
    {
      id: 'vet-decor',
      category: 'Floral & Spatial Decor',
      bookingDeadline: '8 to 12 Weeks Prior to Event Day',
      scopeOfWork: [
        'Design, supply, conditioning, and on-site assembly of ceremony floral nest, tablescapes, and focal installations.',
        'Provision of high-grade rental vessels, brass candelabras, floral frogs, and dripless candles.',
        'Mid-event repurposing and transfer of ceremony florals to the reception dinner sweetheart table.',
        'Post-event breakdown and strike of all vessels and mechanics at 12:00 AM.',
      ],
      staffingOrEquipmentBenchmark: 'Team of 3 florists on-site for 4-hour morning build + 2 assistants for midnight strike.',
      vettingQuestions: [
        {
          question: 'Is complete post-event strike and breakdown included in your quote, or are we responsible for collecting and returning all rental vases and brass candelabras?',
          whyItMatters: 'Having to clean, pack, and return 40 vases to a floral studio the morning after your wedding ruins the post-wedding experience.',
          greenFlagAnswer: '"Our team returns at midnight to strike all installations, pack our rental vessels, and wrap flowers into bouquets for guests to take home."',
          redFlagAnswer: '"We drop off and install; vessel returns to our studio are due by Monday morning at 10:00 AM."',
        },
        {
          question: 'What is your substitution protocol if severe weather or seasonal market shortages prevent sourcing specific planned flower varieties?',
          whyItMatters: 'Global flower auctions can face sudden frost or freight delays. You need a guarantee of aesthetic consistency.',
          greenFlagAnswer: '"Our contract specifies aesthetic mood and color integrity rather than rigid single stems; any substitute will be of equal or greater value."',
          redFlagAnswer: '"We reserve the right to substitute with whatever fresh flowers our local wholesaler has in stock that morning."',
        },
        {
          question: 'Are mock-up sample tablescape viewings or floral stem mockups included in the proposal prior to final stem ordering?',
          whyItMatters: 'Seeing the physical scale, scent, and candle glow in person avoids catastrophic disconnects on wedding day.',
          greenFlagAnswer: '"Yes, our package includes a full sample centerpiece and linen review at our studio 6 weeks prior to the event."',
          redFlagAnswer: '"Mockups are an additional $350 fee plus wholesale stem costs."',
        },
      ],
    },
  ],
  generatedAt: '2026-10-19T00:00:00.000Z',
  version: '1.0.0',
};

// ---------------- PRESET 2: 30TH BIRTHDAY CELEBRATION ----------------
export const PRESET_30TH_BIRTHDAY: EventBlueprint = {
  constraints: {
    id: 'preset-30th-birthday',
    eventType: '30th Birthday Celebration',
    totalBudget: 12000,
    currency: 'USD',
    locationSetting: 'Urban loft with exposed brick & private rooftop',
    guestCount: 60,
    keyTheme: 'Moody editorial lounge, vinyl bar & bespoke cocktail pairings',
    timeRemainingMonths: 2,
  },
  creativeConcept: {
    aestheticTitle: 'Nocturne Vinyl Lounge & Warm Velvet Chic',
    aestheticManifesto:
      'An intimate, cinematic soiree celebrating a milestone threshold. Warm vintage pendant lamps, lush velvet seating nooks, rich amber glassware, and a curated analog vinyl selector table replace predictable party tropes with magnetic, relaxed adult sophistication.',
    focalPoints: [
      {
        area: 'Analog Vinyl Selector Bar & Audio Booth',
        description: 'Mid-century teak console housing twin Technics turntables and curated wooden crates of funk, soul, and deep disco vinyl records.',
        materiality: 'Warm oiled walnut, matte black vinyl, spun brass tone-arms, custom neon typography',
      },
      {
        area: 'Custom Mixology Speakeasy Counter',
        description: 'Exposed brick backdrop lined with illuminated fluted glass shelves, displaying house-infused botanicals, smoked bitters, and block ice stamped with the celebrant’s monogram.',
        materiality: 'Hand-blown amber tumblers, honed black soapstone, brass barware, rosemary smoke',
      },
      {
        area: 'Editorial Flash Portrait Studio',
        description: 'A velvet backdrop corner with a vintage tripod studio camera and direct monochrome instant photo printer producing high-contrast gallery prints for guests.',
        materiality: 'Heavy chocolate velvet, raw canvas backdrop, studio silver umbrella lighting',
      },
    ],
    colorPalette: [
      { name: 'Espresso Velvet', hex: '#261B16', role: 'Foundation Canvas', notes: 'Upholstery, drapery, architectural contrast' },
      { name: 'Amber Glow', hex: '#D97724', role: 'Warm Atmospheric Accent', notes: 'Filament lighting, cocktail tinctures, velvet cushions' },
      { name: 'Smoked Plum', hex: '#582C3E', role: 'Editorial Depth', notes: 'Florals, custom matchbooks, signature cocktail syrup' },
      { name: 'Burnished Gold', hex: '#D4AF37', role: 'Metallic Shimmer', notes: 'Bar tools, rimmed glassware, typography accents' },
      { name: 'Warm Cream', hex: '#F5EFEB', role: 'Textural Highlight', notes: 'Linen cocktail napkins, gallery photo cardstock' },
    ],
    interactiveElements: [
      {
        title: 'Guest Vinyl Drop: "The Soundtrack of 30"',
        targetMoment: 'All Evening (Continuous Lounge Activity)',
        description: 'Guests browse 4 curated wooden record crates containing 100 hand-picked vintage vinyl albums across 3 decades. Guests select a track, write their birthday toast on an analog index card, and hand it to the selector DJ.',
        guestExperience: 'Engaging, tactile musical curation where guests actively craft the party’s sonic narrative.',
        logisticalRequirement: 'Analog DJ setup with twin turntables, custom printed liner note cards, archival pens.',
      },
      {
        title: 'Interactive Smoke & Botanical Cocktail Lab',
        targetMoment: '08:30 PM Speakeasy Cocktail Rush',
        description: 'Head mixologist guides small groups of 4-6 guests through torching cedar boards, capturing aromatic smoke in chilled coupes, and selecting personalized bitters for their bespoke birthday libation.',
        guestExperience: 'Multi-sensory theatrical culinary experience that sparks effortless conversation.',
        logisticalRequirement: 'Butane torch with safety permit, 4 glass cloches, charred cedar blocks, artisanal bitters.',
      },
      {
        title: 'High-Contrast Monochrome Polaroid Wall & Keepsake Archive',
        targetMoment: 'From Arrival to Late Night',
        description: 'Attendant captures guests using classic black-and-white peel-apart film. One print is pegged onto an illuminated wire grid with a metallic marker dedication; the duplicate is slipped into a custom velvet keepsake folio for the guest.',
        guestExperience: 'Instant tactile vanity keepsake that builds a stunning visual mosaic over the course of the night.',
        logisticalRequirement: '2 instant cameras, 12 packs monochrome film, brass mini clips, velvet guestbook album.',
      },
    ],
  },
  budgetBreakdown: {
    totalBudget: 12000,
    currency: 'USD',
    perGuestCost: 200,
    contingencyReserve: 960,
    categories: [
      {
        id: 'venue',
        category: 'Venue & Facilities',
        percentage: 25,
        allocatedAmount: 3000,
        description: 'Private industrial brick loft + rooftop terrace access for 8 hours (setup to strike), facility manager, prep kitchen.',
        costOptimizationTips: [
          'Book an evening loft buyout on a Thursday or Sunday evening to save 20-30% compared to Saturday night rates.',
          'Verify that the loft includes existing lounge seating and sound equipment before spending on external furniture rentals.',
        ],
        lineItems: [
          { name: 'Urban Loft 8-Hour Exclusive Buyout', estimatedCost: 2400 },
          { name: 'Facility Cleaning & Security Deposit Coverage', estimatedCost: 600 },
        ],
      },
      {
        id: 'fnb',
        category: 'Food & Beverage',
        percentage: 38,
        allocatedAmount: 4560,
        description: 'Artisanal grazing table, 6 passed gourmet tapas, 2 signature craft cocktail bars, craft beer & organic wine, 2 mixologists.',
        costOptimizationTips: [
          'Feature a lavish, bountiful Mediterranean grazing table during first 2 hours rather than a seated dinner: cuts server headcount in half.',
          'Curate 2 signature cocktails with batch-infusion bases rather than a full open liquor bar to control beverage costs and accelerate service.',
        ],
        lineItems: [
          { name: 'Lush 12-Foot Artisanal Charcuterie & Grazing Table', estimatedCost: 1400 },
          { name: 'Passed Late-Night Tapas & Mini Sliders (60 guests)', estimatedCost: 1600 },
          { name: 'Curated 2-Cocktail Bar Package + Wine & Spirits', estimatedCost: 1100 },
          { name: '2 Craft Mixologists & Bar Prep Attendant', estimatedCost: 460 },
        ],
      },
      {
        id: 'decor',
        category: 'Decor & Spatial Lighting',
        percentage: 12,
        allocatedAmount: 1440,
        description: 'Vintage Edison filament bulbs, amber uplights, dried floral arrangements with dark plum accents, custom neon sign.',
        costOptimizationTips: [
          'Rely on architectural lighting and dim Edison filament clusters to create moody drama rather than costly fresh floral centerpieces.',
          'Rent a custom neon sign or brass photo backdrop rather than buying single-use custom fabrication.',
        ],
        lineItems: [
          { name: 'Amber Uplighting & Edison Bulb Drop Rigs', estimatedCost: 550 },
          { name: '4 Dark Plum & Dried Floral Accent Installations', estimatedCost: 450 },
          { name: 'Custom Acrylic Signage & Printed Vinyl Menus', estimatedCost: 440 },
        ],
      },
      {
        id: 'photo_av',
        category: 'Photography & Audio-Visual',
        percentage: 11,
        allocatedAmount: 1320,
        description: '5-hour editorial flash photographer capturing candids and styled portrait studio, instant film supplies.',
        costOptimizationTips: [
          'Hire an editorial fashion-forward photographer for 4-5 focused hours during peak celebration rather than paying for all-day coverage.',
          'Provide the camera and film supplies directly to avoid vendor retail markup on instant film packs.',
        ],
        lineItems: [
          { name: '5-Hour Editorial Flash Photographer', estimatedCost: 1000 },
          { name: 'Instant Camera Film Packs & Velvet Guestbook', estimatedCost: 320 },
        ],
      },
      {
        id: 'entertainment',
        category: 'Entertainment & Music',
        percentage: 8,
        allocatedAmount: 960,
        description: 'Curated Vinyl DJ selector spinning 70s funk, rare groove, and contemporary deep house for 5 hours.',
        costOptimizationTips: [
          'Book an independent vinyl selector DJ who brings their own turntables and mixer to utilize the loft’s in-house PA sound system.',
          'Collaborate directly with the DJ on a customized 30-song cornerstone playlist to ensure flawless vibe alignment.',
        ],
        lineItems: [
          { name: '5-Hour Vinyl DJ & Sound Specialist', estimatedCost: 800 },
          { name: 'Audio Patch Rigs & Monitor Speaker Rental', estimatedCost: 160 },
        ],
      },
      {
        id: 'attire_favors',
        category: 'Attire, Favors & Keepsakes',
        percentage: 3,
        allocatedAmount: 360,
        description: 'Custom foil-stamped matchboxes, vinyl-label cocktail coasters, birthday cake and candle presentation.',
        costOptimizationTips: [
          'Custom matchboxes and vinyl-label coasters serve as functional table decor and coveted takeaways for under $1.50 per guest.',
          'Order a minimalist single-tier sculptural cake paired with gourmet mini pastry bites instead of an oversized fondant cake.',
        ],
        lineItems: [
          { name: 'Custom Foil Matchboxes & Vinyl Coasters', estimatedCost: 160 },
          { name: 'Artisanal Birthday Cake & Sparkler Presentation', estimatedCost: 200 },
        ],
      },
      {
        id: 'contingency',
        category: 'Contingency & Reserve',
        percentage: 3,
        allocatedAmount: 360,
        description: 'Reserve for unexpected drink overages, bartender tip booster, and taxi/rideshare vouchers for guests.',
        costOptimizationTips: [
          'Reserve unspent funds for surprise late-night pizza delivery or premium rideshare credits for guests.',
          'Pre-authorize a set limit with the bartender to avoid open-ended bar tab surprises.',
        ],
        lineItems: [
          { name: 'Late-Night Logistics & Emergency Reserve', estimatedCost: 360 },
        ],
      },
    ],
  },
  milestones: [
    {
      id: 'mb1',
      timeframe: '8 to 6 Weeks Out',
      phase: 'Strategy & Foundations',
      tasks: [
        { id: 'tb1-1', title: 'Sign urban loft contract and confirm rooftop curfew and sound regulations', category: 'Venue', ownerRole: 'Logistics Director', completed: true, priority: 'Critical' },
        { id: 'tb1-2', title: 'Lock craft cocktail caterer and define 2 signature cocktail recipes', category: 'Vendors', ownerRole: 'Event Host / VIP', completed: true, priority: 'High' },
        { id: 'tb1-3', title: 'Confirm Vinyl DJ selector and finalize sound system patch specifications', category: 'Vendors', ownerRole: 'Stage Manager', completed: true, priority: 'High' },
        { id: 'tb1-4', title: 'Send digital save-the-dates with RSVP countdown', category: 'Guest', ownerRole: 'Event Host / VIP', completed: true, priority: 'Medium' },
      ],
    },
    {
      id: 'mb2',
      timeframe: '5 to 3 Weeks Out',
      phase: 'Vendor Lock-in',
      tasks: [
        { id: 'tb2-1', title: 'Order custom matchboxes, vinyl coasters, and instant film cartridges', category: 'Design', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
        { id: 'tb2-2', title: 'Contract editorial photographer for 5 hours of low-light flash documentation', category: 'Vendors', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
        { id: 'tb2-3', title: 'Verify loft electrical capacity and load-in freight elevator access codes', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
      ],
    },
    {
      id: 'mb3',
      timeframe: '2 Weeks to Event Week',
      phase: 'Final Coordination',
      tasks: [
        { id: 'tb3-1', title: 'Finalize RSVP guest roster and send dietary restrictions to catering team', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'Critical' },
        { id: 'tb3-2', title: 'Curate the "Soundtrack of 30" record list with DJ and print vinyl index cards', category: 'Design', ownerRole: 'Stage Manager', completed: false, priority: 'Medium' },
        { id: 'tb3-3', title: 'Confirm bar ice delivery (clear monogram blocks + cocktail cubes)', category: 'Vendors', ownerRole: 'Catering Lead', completed: false, priority: 'High' },
        { id: 'tb3-4', title: 'Conduct day-of operational walk-through and distribute timeline to suppliers', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
      ],
    },
  ],
  runOfShow: [
    {
      id: 'ros-b1',
      startTime: '04:00 PM',
      endTime: '06:00 PM',
      durationMinutes: 120,
      activity: 'Loft Access, Sound Check & Bar Staging',
      location: 'Urban Loft Main Room',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Freight elevator load-in. DJ rigs turntables and tests sound levels at 85dB. Bar team prepares syrups, crystal glassware, and garnishes.',
      equipmentOrSupplies: 'Elevator key fob, ice chests, glassware racks, audio patch cables.',
    },
    {
      id: 'ros-b2',
      startTime: '06:00 PM',
      endTime: '07:30 PM',
      durationMinutes: 90,
      activity: 'Lighting Mood Set, Charcuterie Build & Host Arrival',
      location: 'Loft & Rooftop Terrace',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Dim overheads, ignite candles, activate amber uplights. Caterer constructs 12-foot grazing table. Host arrives for portraits.',
      equipmentOrSupplies: 'Candle lighters, matchboxes, guestbook pens, coat check racks.',
    },
    {
      id: 'ros-b3',
      startTime: '07:30 PM',
      endTime: '08:30 PM',
      durationMinutes: 60,
      activity: 'Guest Arrival, Welcome Cocktails & Vinyl Curation',
      location: 'Loft Entry & Bar Lounge',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Guests greeted with signature welcome drink. DJ spins warm vintage soul. Guests begin browsing vinyl crates and writing song dedications.',
      equipmentOrSupplies: 'Coat check tags, welcome drink trays, vinyl request slips.',
    },
    {
      id: 'ros-b4',
      startTime: '08:30 PM',
      endTime: '09:45 PM',
      durationMinutes: 75,
      activity: 'Interactive Smoke Cocktail Lab & Passed Tapas',
      location: 'Bar Counter & Lounge Nooks',
      leadRole: 'Catering Lead',
      cuesAndNotes: 'Passed hot gourmet tapas circulate. Head mixologist demonstrates botanical smoked cocktails to small guest groups. Flash photographer shoots candids.',
      equipmentOrSupplies: 'Smoker cloches, cedar planks, tapas service platters.',
    },
    {
      id: 'ros-b5',
      startTime: '09:45 PM',
      endTime: '10:00 PM',
      durationMinutes: 15,
      activity: 'Milestone 30th Birthday Toast & Cake Presentation',
      location: 'Center Lounge',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Music lowers smoothly. Celebrant’s closest friend offers 2-minute toast. Sculptural cake illuminated with sparkler candles. Cheers and champagne pour.',
      equipmentOrSupplies: 'Cake stand, sparkler candles, champagne coupes.',
    },
    {
      id: 'ros-b6',
      startTime: '10:00 PM',
      endTime: '12:00 AM',
      durationMinutes: 120,
      activity: 'Late-Night Dance Floor Surge & Rooftop Stargazing',
      location: 'Loft Dance Floor & Terrace',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'DJ transitions into high-tempo disco and funk edits. Polaroids are pegged to the photo wall. Rooftop terrace open for cool air conversations.',
      equipmentOrSupplies: 'Monochrome polaroid cameras, extra film packs, water carafes.',
    },
    {
      id: 'ros-b7',
      startTime: '12:00 AM',
      endTime: '01:00 AM',
      durationMinutes: 60,
      activity: 'Event Wrap, Rideshare Dispatch & Vendor Load-Out',
      location: 'Loft & Loading Bay',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Music fades. Guests depart via rideshare. Bar and rental items packed into road cases. Final space sweep to secure deposit refund.',
      equipmentOrSupplies: 'Trash bags, checklist clipboard, moving carts.',
    },
  ],
  vendorVettingKit: [
    {
      id: 'vet-b-bar',
      category: 'Catering & Beverage',
      bookingDeadline: '4 to 6 Weeks Prior',
      scopeOfWork: [
        'Supply 2 certified mixologists for 6 active hours including bar setup and teardown.',
        'Supply all bar tools, bespoke glassware, craft syrups, fresh citrus, clear block ice, and garnishes.',
        'Manage alcohol inventory and maintain clean bar perimeter throughout celebration.',
      ],
      staffingOrEquipmentBenchmark: '2 Mixologists for 60 guests (ensures <60 second wait times).',
      vettingQuestions: [
        {
          question: 'Are glassware rentals, ice transport, and specialty garnishes included in the per-person package, or billed as separate rentals?',
          whyItMatters: 'Third-party glassware breakages and ice transport surcharges can unexpectedly add $300-$500.',
          greenFlagAnswer: '"All crystal glassware, bar mats, ice coolers, and garnishes are 100% included with zero breakage deduction up to 5 glasses."',
          redFlagAnswer: '"You rent glasses through our partner vendor and pay $3 per unreturned glass."',
        },
        {
          question: 'Do you carry both General Liability and Liquor Liability Insurance naming our venue as an additional insured?',
          whyItMatters: 'Loft spaces will immediately cancel events if liquor liability coverage certificates are not verified 14 days prior.',
          greenFlagAnswer: '"Yes, we maintain $2M Liquor Liability and will issue the COI naming the venue within 24 hours of booking."',
          redFlagAnswer: '"We have standard commercial insurance; usually venues don’t ask for liquor-specific riders."',
        },
        {
          question: 'What happens to leftover unopened alcohol bottles at the end of the night?',
          whyItMatters: 'Unethical bar vendors may pack away your paid spirits instead of handing them back to you.',
          greenFlagAnswer: '"All unopened bottles are boxed and handed directly to the host before we load out."',
          redFlagAnswer: '"Unopened items are recycled into our inventory unless specifically requested."',
        },
      ],
    },
    {
      id: 'vet-b-photo',
      category: 'Photo & Cinema',
      bookingDeadline: '4 to 6 Weeks Prior',
      scopeOfWork: [
        '5 hours of direct coverage with off-camera flash expertise for moody low-light loft environments.',
        'Online gallery with minimum 250 high-res color-graded and monochrome images delivered within 10 days.',
      ],
      staffingOrEquipmentBenchmark: 'Fast f/1.4 prime lenses + speedlight wireless transmitters.',
      vettingQuestions: [
        {
          question: 'Can you share 2 full galleries of private evening events shot in dim brick lofts with low ambient light?',
          whyItMatters: 'Many outdoor natural-light photographers struggle severely in dark nighttime party environments.',
          greenFlagAnswer: '"Here are 3 complete night loft galleries showcasing our direct-flash and ambient tungsten mastery."',
          redFlagAnswer: '"I prefer natural light, but I can bring a basic on-camera flash if needed."',
        },
        {
          question: 'What is your turnaround time for a preview set of 10-15 images for social sharing the day after the party?',
          whyItMatters: 'Celebrants want stunning photos to post the next morning while birthday excitement is peak.',
          greenFlagAnswer: '"We deliver a curated 15-photo high-res sneak peek gallery by 11:00 AM the following morning."',
          redFlagAnswer: '"All photos are delivered together in 4 to 6 weeks."',
        },
        {
          question: 'Do you charge extra for commercial usage rights if any images are published or used for brand collaborations?',
          whyItMatters: 'Surprise usage rights restrictions can block you from sharing media.',
          greenFlagAnswer: '"Personal and social reproduction rights with zero watermarks are fully granted in perpetuity."',
          redFlagAnswer: '"Social posting requires photographer credit tags on every post or an additional commercial license fee."',
        },
      ],
    },
    {
      id: 'vet-b-venue',
      category: 'Venue Operations',
      bookingDeadline: '6 to 8 Weeks Prior',
      scopeOfWork: [
        '8 hours of exclusive access to loft and rooftop space.',
        'On-site building engineer on call for elevator and HVAC management.',
      ],
      staffingOrEquipmentBenchmark: 'Freight elevator clearance & freight loading bay access.',
      vettingQuestions: [
        {
          question: 'Is rooftop access permitted after 10:00 PM, or is there an enforced outdoor noise curfew?',
          whyItMatters: 'Rooftops often have residential noise ordinances that shut down terrace access early.',
          greenFlagAnswer: '"Guests may enjoy the rooftop until midnight as long as music remains indoors after 10:00 PM."',
          redFlagAnswer: '"The rooftop closes strictly at 9:00 PM sharp without exception."',
        },
        {
          question: 'Does the venue provide in-house sound systems and AV connections, or must we rent external speakers and amplifiers?',
          whyItMatters: 'Renting a sound rig for an empty space costs $600-$1000 unexpectedly.',
          greenFlagAnswer: '"We have a built-in 4-zone Sonos and XLR audio system with wireless mics included in the rental."',
          redFlagAnswer: '"You must bring your own complete sound system, PA, and cables."',
        },
        {
          question: 'What are the cleaning requirements before the midnight strike to guarantee full security deposit return?',
          whyItMatters: 'Unclear cleanup standards can lead to a forfeited $500 cleaning deposit.',
          greenFlagAnswer: '"Just bag your trash and remove personal decor; our included janitorial crew handles all deep mopping and bathrooms."',
          redFlagAnswer: '"You must sweep, mop, wipe down all surfaces, and haul trash out to the street dumpsters yourself."',
        },
      ],
    },
    {
      id: 'vet-b-decor',
      category: 'Floral & Spatial Decor',
      bookingDeadline: '3 to 5 Weeks Prior',
      scopeOfWork: [
        'Supply 4 moody floral accent arrangements, 30 amber glass votives, and custom vinyl signage.',
      ],
      staffingOrEquipmentBenchmark: 'Delivery and styling completed 2 hours prior to guest arrival.',
      vettingQuestions: [
        {
          question: 'Are candle vessels and LED or open-flame candle permits cleared with local fire code?',
          whyItMatters: 'Enclosed spaces may prohibit open flames without candle glass enclosures (chimneys).',
          greenFlagAnswer: '"All our candles are encased in compliant hurricane cylinders that meet local municipal fire safety codes."',
          redFlagAnswer: '"We bring standard open taper candles; check with your venue if they allow them."',
        },
        {
          question: 'Can you deliver, place, and strike the arrangements, or is delivery curbside only?',
          whyItMatters: 'Curbside delivery means you spend the afternoon unboxing and arranging heavy glass vases.',
          greenFlagAnswer: '"We provide white-glove inside placement and return at midnight for vessel retrieval."',
          redFlagAnswer: '"We drop off at the front door; styling is the client’s responsibility."',
        },
        {
          question: 'Can the floral stems be dried or repurposed so the birthday host can keep them after the party?',
          whyItMatters: 'High-end floral arrangements are far more valuable when they live on as home decor.',
          greenFlagAnswer: '"We deliberately utilize hardy varieties and preserved botanicals that dry beautifully for home keepsakes."',
          redFlagAnswer: '"All arrangements must be discarded at event end."',
        },
      ],
    },
  ],
  generatedAt: '2026-10-19T00:00:00.000Z',
  version: '1.0.0',
};

// ---------------- PRESET 3: TECH COMMUNITY GALA ----------------
export const PRESET_TECH_GALA: EventBlueprint = {
  constraints: {
    id: 'preset-tech-gala',
    eventType: 'Tech Community Gala & Awards',
    totalBudget: 35000,
    currency: 'USD',
    locationSetting: 'Waterfront industrial pavilion with high steel trusses',
    guestCount: 250,
    keyTheme: 'Cyber-clean minimal, generative projection art & lively networking',
    timeRemainingMonths: 3,
  },
  creativeConcept: {
    aestheticTitle: 'Kinetic Monolith & Luminous Architecture',
    aestheticManifesto:
      'A departure from tired corporate ballroom banality. High-contrast monochromatic precision meets vibrant cyan and electric violet architectural illumination. Clean geometric seating clusters, interactive generative digital canvases, and fluid networking choreography cultivate electric momentum.',
    focalPoints: [
      {
        area: 'Main Stage & Monolithic LED Backdrop',
        description: 'A 24-foot seamless LED video wall displaying ambient real-time generative data art that reacts subtly to room audio dynamics, framed by matte black structural trusses.',
        materiality: 'Fine-pitch LED panels, matte anodized aluminum, diffuse optical acrylic',
      },
      {
        area: 'Networking Pavilion & High-Top Hubs',
        description: 'Sleek brushed stainless-steel communal high-tops with embedded wireless device charging pads and minimalist architectural geometric centerpieces.',
        materiality: 'Brushed steel, optical frosted glass, cast concrete plinths, recessed LED edge lighting',
      },
      {
        area: 'Entrance Sensory Tunnel',
        description: 'A 30-foot entry corridor with vertical architectural light batons pulsing gently to an ambient soundscape, transitioning guests from the outside world into the gala arena.',
        materiality: 'Astera Titan light tubes, black scrim drape, directional acoustic arrays',
      },
    ],
    colorPalette: [
      { name: 'Obsidian Black', hex: '#0D0E12', role: 'Monolithic Foundation', notes: 'Stage trussing, matte table linens, technical backdrops' },
      { name: 'Cyber Cyan', hex: '#00F0FF', role: 'Dynamic Luminescent Accent', notes: 'Digital stage graphics, cocktail highlights, badges' },
      { name: 'Electric Violet', hex: '#8B5CF6', role: 'Secondary Ambient Energy', notes: 'Perimeter uplighting, award category visuals' },
      { name: 'Pure Titanium', hex: '#F1F5F9', role: 'High-Contrast Typographic Clarity', notes: 'Keynote typography, award plaques, clean signage' },
      { name: 'Graphite Metal', hex: '#334155', role: 'Structural Surface Neutral', notes: 'Podiums, registration counters, furniture frames' },
    ],
    interactiveElements: [
      {
        title: 'Generative Audio-Reactive Community Badge & Mural',
        targetMoment: 'Check-In & Reception Cocktails',
        description: 'As guests tap their NFC badges at the entrance, their engineering specialty or founding passion blooms into a dynamic particle on a massive 40-foot projection wall, visually assembling the living constellation of the community.',
        guestExperience: 'Instant awe and belonging; visually reinforces the collective power of the community in real time.',
        logisticalRequirement: 'NFC badge readers, 2 high-lumen laser projectors, WebGL generative graphic canvas server.',
      },
      {
        title: 'Rapid 90-Second "Micro-Pitch" & Founder Lightning Stage',
        targetMoment: '07:45 PM Breakout Networking Intermission',
        description: 'A dedicated secondary circular stage in the center of the pavilion with an analog countdown ring. Selected community innovators present high-speed 90-second lightning showcases followed by live digital audience applause voting.',
        guestExperience: 'High-octane entertainment that avoids monotonous speeches and keeps energy electrifying.',
        logisticalRequirement: 'Circular risers, 360-degree wireless microphone, digital LED countdown timer monitor.',
      },
      {
        title: 'Curated Nitrogen Cocktail & Cryo-Dessert Station',
        targetMoment: '09:00 PM Post-Awards Celebration',
        description: 'Culinary chemists flash-freeze artisanal sorbet pearls and infuse glowing botanical cocktails using food-grade liquid nitrogen clouds billowing over a sleek illuminated counter.',
        guestExperience: 'Spectacular visual theater and exquisite refreshing dessert experience.',
        logisticalRequirement: 'Food-grade liquid nitrogen dewars, certified safety chef, ventilation perimeter clearance.',
      },
    ],
  },
  budgetBreakdown: {
    totalBudget: 35000,
    currency: 'USD',
    perGuestCost: 140,
    contingencyReserve: 2800,
    categories: [
      {
        id: 'venue',
        category: 'Venue & Facilities',
        percentage: 20,
        allocatedAmount: 7000,
        description: 'Waterfront industrial pavilion rental, load-in rigging access, security team, trash strike & cleaning.',
        costOptimizationTips: [
          'Leverage community sponsorship or tech foundation non-profit partner status to request municipal pavilion discounts of 15-25%.',
          'Ensure the contract includes load-in starting at 06:00 AM without charging overnight holding fees.',
        ],
        lineItems: [
          { name: 'Waterfront Industrial Pavilion Buyout (14 hrs)', estimatedCost: 5500 },
          { name: 'Licensed Security Staff (4 guards) & Janitorial', estimatedCost: 1500 },
        ],
      },
      {
        id: 'fnb',
        category: 'Food & Beverage',
        percentage: 32,
        allocatedAmount: 11200,
        description: 'Elevated networking grazing stations, 6 passed gourmet tapas, nitrogen dessert lab, 3-hour open bar with local craft brews and wines.',
        costOptimizationTips: [
          'Substitute heavy plated dinners with continuous gourmet food stations: saves $35/head while encouraging continuous cross-table networking.',
          'Secure a local craft brewery or distillery as an in-kind beverage sponsor in exchange for logo placement on the main LED screen.',
        ],
        lineItems: [
          { name: 'Heavy Networking Food Stations & Canapés (250 guests)', estimatedCost: 6500 },
          { name: '3-Hour Craft Beer, Wine & Signature Mocktails', estimatedCost: 3200 },
          { name: 'Liquid Nitrogen Dessert Culinary Demonstration', estimatedCost: 1500 },
        ],
      },
      {
        id: 'decor',
        category: 'Decor & Spatial Lighting',
        percentage: 12,
        allocatedAmount: 4200,
        description: 'Entry light tube tunnel, industrial truss hanging banners, ambient perimeter cyber-violet uplights, high-top furniture rentals.',
        costOptimizationTips: [
          'Use programmable digital light fixtures (Astera tubes) that shift color palettes dynamically from blue during dinner to vibrant magenta during awards.',
          'Rent industrial wire high-tops instead of draped linen rounds to save on laundering and steam pressing fees.',
        ],
        lineItems: [
          { name: 'Entryway Light Baton Tunnel & Rigging', estimatedCost: 1600 },
          { name: 'Industrial Perimeter Uplighting & Moving Heads', estimatedCost: 1400 },
          { name: 'High-Top Cocktail Tables & Minimalist Bar Stools', estimatedCost: 1200 },
        ],
      },
      {
        id: 'photo_av',
        category: 'Photography & Audio-Visual',
        percentage: 22,
        allocatedAmount: 7700,
        description: '24ft LED video wall, digital audio line array, wireless mic kit, stage lighting, 2 event photographers, live stream broadcast crew.',
        costOptimizationTips: [
          'Bundle stage AV, LED video wall, and audio engineering with a single production house to eliminate multi-company coordination fees.',
          'Record high-definition keynote feeds directly from the switcher for immediate post-event YouTube publishing without expensive re-editing.',
        ],
        lineItems: [
          { name: '24-Foot P3 LED Video Wall & Video Switcher', estimatedCost: 4500 },
          { name: 'Audio Line Array PA, Wireless Mics & Audio Engineer', estimatedCost: 1800 },
          { name: '2 High-Speed Event Photographers (6 hours)', estimatedCost: 1400 },
        ],
      },
      {
        id: 'entertainment',
        category: 'Entertainment & Stage Production',
        percentage: 6,
        allocatedAmount: 2100,
        description: 'Professional tech keynote MC, synthwave / electronic music DJ for after-party, custom sound stingers for award categories.',
        costOptimizationTips: [
          'Engage an experienced charismatic community organizer or founder as host, pairing them with an electronic DJ for musical stingers.',
          'Commission a talented electronic music producer from the local community to score custom 15-second category winner walk-up stingers.',
        ],
        lineItems: [
          { name: 'Professional Stage MC & Show Caller', estimatedCost: 1100 },
          { name: 'Live Electronic DJ & Sound Designer', estimatedCost: 1000 },
        ],
      },
      {
        id: 'attire_favors',
        category: 'Awards, Signage & NFC Badges',
        percentage: 4,
        allocatedAmount: 1400,
        description: 'Machined anodized aluminum community award trophies, smart NFC smart badges, digital programs.',
        costOptimizationTips: [
          'Replace all printed paper program booklets with an interactive mobile web app linked via NFC attendee badges.',
          'Fabricate geometric aluminum trophies via local water-jet machining shops for high-end aesthetic at half the cost of crystal trophies.',
        ],
        lineItems: [
          { name: '10 Custom Machined Aluminum Community Award Trophies', estimatedCost: 800 },
          { name: '250 Custom NFC Event Badges & Lanyards', estimatedCost: 600 },
        ],
      },
      {
        id: 'contingency',
        category: 'Contingency & Reserve',
        percentage: 4,
        allocatedAmount: 1400,
        description: 'Emergency technical gear backup, auxiliary generator fuel reserve, Wi-Fi cellular hotspot backup.',
        costOptimizationTips: [
          'Designate a bonded 5G cellular hotspot router on standby so stage live streams never falter if venue wired internet experiences drops.',
          'Keep power reserve buffer intact for late night crew overtime.',
        ],
        lineItems: [
          { name: 'Technical Emergency Gear & Power Reserve', estimatedCost: 1400 },
        ],
      },
    ],
  },
  milestones: [
    {
      id: 'mt1',
      timeframe: 'Month 1 (12 to 8 Weeks Out)',
      phase: 'Strategy & Foundations',
      tasks: [
        { id: 'tt1-1', title: 'Lock industrial pavilion agreement & file municipal event assembly permits', category: 'Venue', ownerRole: 'Logistics Director', completed: true, priority: 'Critical' },
        { id: 'tt1-2', title: 'Issue AV RFP for 24ft LED video wall, sound line array, and stage lighting', category: 'Vendors', ownerRole: 'Logistics Director', completed: true, priority: 'Critical' },
        { id: 'tt1-3', title: 'Launch early-bird ticketing and open community award nominations', category: 'Guest', ownerRole: 'Event Host / VIP', completed: true, priority: 'High' },
        { id: 'tt1-4', title: 'Finalize cyber-minimalist brand design guidelines and digital sponsor deck', category: 'Design', ownerRole: 'Logistics Director', completed: true, priority: 'Medium' },
      ],
    },
    {
      id: 'mt2',
      timeframe: 'Month 2 (8 to 4 Weeks Out)',
      phase: 'Vendor Lock-in',
      tasks: [
        { id: 'tt2-1', title: 'Sign catering agreement for heavy grazing stations and nitrogen culinary lab', category: 'Vendors', ownerRole: 'Catering Lead', completed: false, priority: 'Critical' },
        { id: 'tt2-2', title: 'Finalize award nomination judging and notify 10 award finalists under embargo', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'High' },
        { id: 'tt2-3', title: 'Test WebGL generative audio-reactive projection software with badge engineer', category: 'Design', ownerRole: 'Stage Manager', completed: false, priority: 'High' },
        { id: 'tt2-4', title: 'Order machined aluminum award trophies and NFC smart lanyards', category: 'Finance', ownerRole: 'Logistics Director', completed: false, priority: 'Medium' },
      ],
    },
    {
      id: 'mt3',
      timeframe: 'Month 3 (4 Weeks Out to Event Week)',
      phase: 'Final Coordination',
      tasks: [
        { id: 'tt3-1', title: 'Conduct dry-run stage cues and audio stinger sync with Master of Ceremonies', category: 'Logistics', ownerRole: 'Stage Manager', completed: false, priority: 'Critical' },
        { id: 'tt3-2', title: 'Complete site electrical inspection and load test for LED video wall power drops', category: 'Venue', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
        { id: 'tt3-3', title: 'Distribute run of show to all 25 staff members and security personnel', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
        { id: 'tt3-4', title: 'Send arrival instructions, parking passes, and NFC check-in QR codes to attendees', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'High' },
      ],
    },
  ],
  runOfShow: [
    {
      id: 'ros-t1',
      startTime: '07:00 AM',
      endTime: '11:00 AM',
      durationMinutes: 240,
      activity: 'Heavy Production Load-In & LED Wall Assembly',
      location: 'Main Pavilion Floor',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Rigging crew flies truss overhead. LED video technicians assemble panels and perform dead-pixel calibration test. Audio line arrays hoisted.',
      equipmentOrSupplies: 'Truss motors, rigging harnesses, 400A distro box, safety hardhats.',
    },
    {
      id: 'ros-t2',
      startTime: '11:00 AM',
      endTime: '02:00 PM',
      durationMinutes: 180,
      activity: 'Lighting Programming, Entry Tunnel Build & Catering Staging',
      location: 'Full Facility',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Program lighting cues (Walk-in blue, Award flash, After-party violet). Setup entry light batons and test NFC badge scanning check-in desks.',
      equipmentOrSupplies: 'Lighting DMX console, Astera Titan tubes, NFC test badges.',
    },
    {
      id: 'ros-t3',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      durationMinutes: 120,
      activity: 'Full Technical Rehearsal & Speaker Tech Check',
      location: 'Main Stage',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'MC and award presenters rehearse teleprompter and handheld mic handoffs. Test slide switchers, confidence monitors, and audio stingers.',
      equipmentOrSupplies: 'Wireless slide clicker, countdown confidence clock, presenter scripts.',
    },
    {
      id: 'ros-t4',
      startTime: '05:30 PM',
      endTime: '07:00 PM',
      durationMinutes: 90,
      activity: 'Doors Open, Generative Constellation & Networking Reception',
      location: 'Entry Tunnel & Pavilion Floor',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Attendees check in via NFC; each badge tap triggers dynamic particle on 40ft mural. Passed canapés and welcome beverages active.',
      equipmentOrSupplies: 'NFC badges, registration tablets, drink service trays.',
    },
    {
      id: 'ros-t5',
      startTime: '07:00 PM',
      endTime: '07:20 PM',
      durationMinutes: 20,
      activity: 'Opening Keynote & State of the Ecosystem Address',
      location: 'Main Stage',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Lighting dims to obsidian dark. High-energy opening video package on LED wall. MC welcomes audience and introduces Community Chair.',
      equipmentOrSupplies: 'Opening intro video cue, stage spotlight, MC speech notes.',
    },
    {
      id: 'ros-t6',
      startTime: '07:20 PM',
      endTime: '08:15 PM',
      durationMinutes: 55,
      activity: 'Annual Community Awards Ceremony (Categories 1 - 5)',
      location: 'Main Stage',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Category video reel, presenter announcement, custom 15-second stinger for winner walk-up. Photographers capture trophy handoffs at stage left.',
      equipmentOrSupplies: 'Machined aluminum trophies, presenter envelopes, award slide deck.',
    },
    {
      id: 'ros-t7',
      startTime: '08:15 PM',
      endTime: '09:00 PM',
      durationMinutes: 45,
      activity: 'Founder Lightning Stage & Heavy Food Station Intermission',
      location: 'Center Stage & Dining Stations',
      leadRole: 'Catering Lead',
      cuesAndNotes: '5 selected founders deliver 90-second micro-pitches on circular stage. Hot gourmet stations open for dinner grazing.',
      equipmentOrSupplies: '90-second LED countdown clock, buffet warming chafers.',
    },
    {
      id: 'ros-t8',
      startTime: '09:00 PM',
      endTime: '09:30 PM',
      durationMinutes: 30,
      activity: 'Flagship Award: Innovator of the Year & Closing Gratitude',
      location: 'Main Stage',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Culminating award presented. Confetti/cryo-haze blast (optional). Community group photo from stage overlooking 250 attendees.',
      equipmentOrSupplies: 'Trophy, group wide-angle camera framing, celebratory stage lighting.',
    },
    {
      id: 'ros-t9',
      startTime: '09:30 PM',
      endTime: '11:30 PM',
      durationMinutes: 120,
      activity: 'Liquid Nitrogen Dessert Lounge & Electronic DJ After-Party',
      location: 'Pavilion Floor & Outdoor Terrace',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Culinary chemists activate liquid nitrogen dessert show. Electronic DJ takes stage with driving synthwave set. Bars remain open.',
      equipmentOrSupplies: 'Liquid nitrogen station, bar service ware, outdoor fire pits.',
    },
    {
      id: 'ros-t10',
      startTime: '11:30 PM',
      endTime: '02:00 AM',
      durationMinutes: 150,
      activity: 'Attendee Departure & Overnight AV Strike',
      location: 'Full Pavilion',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Bars close at 11:30 PM. Attendees depart via organized rideshare zone. Production crew strikes LED wall, de-rigs trusses, and packs trucks.',
      equipmentOrSupplies: 'Packing crates, road cases, forklift, dock supervisor clipboard.',
    },
  ],
  vendorVettingKit: [
    {
      id: 'vet-t-av',
      category: 'Photo & Cinema',
      bookingDeadline: '8 to 10 Weeks Prior',
      scopeOfWork: [
        'Furnish 24x10ft LED screen (2.9mm pitch), Novastar processing, video switcher, confidence monitors.',
        'L-Acoustics or d&b audiotechnik line array sound system, 4 Shure wireless handheld mics, 2 lavaliers.',
        'Dedicated technical crew: 1 Video Engineer, 1 Audio Engineer, 1 Lighting Programmer, 1 Stage Hand.',
      ],
      staffingOrEquipmentBenchmark: 'Full crew on-site 8 hours before doors + dedicated backup switcher.',
      vettingQuestions: [
        {
          question: 'Do you provide a seamless primary-and-secondary video switcher (e.g. Barco or Blackmagic ATEM) with an instant failover backup for live stage presentations?',
          whyItMatters: 'If a presenter’s laptop crashes on the 24ft LED wall without a seamless backup switcher, the entire conference halts in humiliation.',
          greenFlagAnswer: '"We deploy dual redundant switchers with zero-frame hot-swap failover configured as standard protocol."',
          redFlagAnswer: '"We plug the presenter’s HDMI directly into the video scaler to save equipment cost."',
        },
        {
          question: 'Are rigging permits, motor inspections, and structural engineering sign-offs included in your setup quote?',
          whyItMatters: 'Industrial venues require licensed rigger certifications; missing paperwork can trigger an immediate stop-work order from city inspectors.',
          greenFlagAnswer: '"All our riggers are ETCP certified and we file stamped structural engineering load sheets directly with venue operations."',
          redFlagAnswer: '"We hang from existing building beams without extra permits unless the venue demands it."',
        },
        {
          question: 'What is the hourly overtime rate if the awards show runs 45 minutes beyond scheduled stage time?',
          whyItMatters: 'With a 4-person technical crew, undisclosed overtime rates can add $800-$1500 unexpectedly.',
          greenFlagAnswer: '"We build a 45-minute operational grace window into all production quotes; post-grace billing is $65/tech hour."',
          redFlagAnswer: '"Overtime kicks in at minute 1 at double-time commercial rates across all equipment and crew."',
        },
      ],
    },
    {
      id: 'vet-t-venue',
      category: 'Venue Operations',
      bookingDeadline: '10 to 14 Weeks Prior',
      scopeOfWork: [
        'Exclusive pavilion access from 06:00 AM load-in through 02:30 AM final strike.',
        '300A 3-phase cam-lock electrical power tie-in for production lighting and LED wall.',
        'High-density Wi-Fi capable of supporting 500 concurrent connected devices.',
      ],
      staffingOrEquipmentBenchmark: 'Dedicated venue electrical engineer on-site during tie-in.',
      vettingQuestions: [
        {
          question: 'What is the verified dedicated Wi-Fi bandwidth and maximum concurrent client capacity across the pavilion floor?',
          whyItMatters: 'Tech crowds expect flawless Wi-Fi; a dropped network ruins live voting, NFC interactive features, and social coverage.',
          greenFlagAnswer: '"We feature a dedicated commercial fiber line with 1 Gbps symmetrical bandwidth and Aruba APs handling 1,200 concurrent clients."',
          redFlagAnswer: '"We have standard commercial broadband; it usually works fine for corporate groups."',
        },
        {
          question: 'Is there a separate power tie-in fee for connecting our production 3-phase cam-lock distribution box to the building main?',
          whyItMatters: 'Unlisted electrical tie-in fees often surprise planners with a $750-$1,500 fee on event day.',
          greenFlagAnswer: '"Our facility tie-in fee is flat $400 and covers our in-house master electrician hooking up and metering the distro box."',
          redFlagAnswer: '"Power connection fees are billed post-event based on kilowatt consumption meter readings."',
        },
        {
          question: 'Are food trucks or external culinary carts permitted on the exterior apron without outside catering penalty fees?',
          whyItMatters: 'Adding street carts or nitrogen culinary stations can be blocked by restrictive venue contracts.',
          greenFlagAnswer: '"External food trucks are welcomed on our apron with proper health permits and a basic $150 cleaning retainer."',
          redFlagAnswer: '"All food and beverage must go through our in-house concessionaire with a 24% service fee."',
        },
      ],
    },
    {
      id: 'vet-t-catering',
      category: 'Catering & Beverage',
      bookingDeadline: '6 to 8 Weeks Prior',
      scopeOfWork: [
        'Service of 4 heavy gourmet savory stations and 6 passed hot canapés for 250 attendees.',
        'Full liquid nitrogen dessert staging with certified safety protocol and culinary chef.',
        '4 beverage service bars with 4 certified bartenders and 2 bar-backs.',
      ],
      staffingOrEquipmentBenchmark: '1 Bartender per 60 attendees; continuous busser sweeps of high-top tables.',
      vettingQuestions: [
        {
          question: 'How do you handle dietary requirements (vegan, gluten-free, halal, nut allergies) during high-throughput networking stations?',
          whyItMatters: 'In tech gatherings, 25-35% of guests require distinct dietary accommodations; poor labeling leaves guests hungry and frustrated.',
          greenFlagAnswer: '"Each station features dedicated allergen-free prep zones with bold typographic dietary signage and dedicated servers."',
          redFlagAnswer: '"We can provide a couple of special boxed salads if someone asks at the registration desk."',
        },
        {
          question: 'Are compostable eco-ware, bamboo plates, and zero-waste recycling sorting stations included in your standard proposal?',
          whyItMatters: 'Modern tech galas demand strict zero-waste sustainability standards to align with community values.',
          greenFlagAnswer: '"All serving ware is 100% certified commercially compostable, and our crew sorts all waste at strike with zero landfill diversion."',
          redFlagAnswer: '"We use standard plastic cocktail plates unless you pay an upgrade fee for compostables."',
        },
        {
          question: 'What is your procedure if bar lines exceed 4 guests during the initial 60-minute cocktail rush?',
          whyItMatters: 'Slow bars kill networking momentum and generate instant frustration.',
          greenFlagAnswer: '"We pre-pour 150 welcome beverages on greeting trays and station a dedicated beer/wine express bar to keep queues under 60 seconds."',
          redFlagAnswer: '"Guests just queue up at the main bars; 2 bartenders are usually enough."',
        },
      ],
    },
    {
      id: 'vet-t-decor',
      category: 'Floral & Spatial Decor',
      bookingDeadline: '6 to 8 Weeks Prior',
      scopeOfWork: [
        'Supply and installation of 30-foot entry tunnel with programmable Astera LED light tubes.',
        'Furnish 25 brushed steel communal high-tops, 50 barstools, and architectural geometric plinths.',
      ],
      staffingOrEquipmentBenchmark: 'Delivery and styling finished 3 hours prior to doors.',
      vettingQuestions: [
        {
          question: 'Can the entry light batons and architectural uplights be synchronized to our lighting designer’s GrandMA console via wireless DMX?',
          whyItMatters: 'Disjointed decor lighting destroys the immersive high-tech atmosphere.',
          greenFlagAnswer: '"All fixtures are wireless CRMX enabled and we provide our DMX profile sheets to your LD 1 week prior."',
          redFlagAnswer: '"Our fixtures have fixed preset colors set via manual buttons on the back of each light."',
        },
        {
          question: 'Are all fabric draperies and scrims certified NFPA 701 fire-retardant with attached compliance tags?',
          whyItMatters: 'Fire marshals inspect large gatherings and will physically confiscate untagged draperies before doors open.',
          greenFlagAnswer: '"All our drape inventory carries permanent sewn-in NFPA 701 fire retardancy certification labels."',
          redFlagAnswer: '"Our fabrics are standard stage velvets; we have a general fire certificate on file."',
        },
        {
          question: 'What is your damage deposit and replacement policy if high-top furniture suffers scuffs during heavy attendee networking?',
          whyItMatters: 'Normal wear-and-tear deductions can hold your deposit hostage.',
          greenFlagAnswer: '"Standard minor scuffs and table wiping are factored into our rental rates; damage charges only apply to structural destruction."',
          redFlagAnswer: '"Any visible scratch is billed at full wholesale replacement cost."',
        },
      ],
    },
  ],
  generatedAt: '2026-10-19T00:00:00.000Z',
  version: '1.0.0',
};

export const PRESET_BLUEPRINTS: Record<string, EventBlueprint> = {
  'preset-fusion-wedding': PRESET_MODERN_FUSION_WEDDING,
  'preset-30th-birthday': PRESET_30TH_BIRTHDAY,
  'preset-tech-gala': PRESET_TECH_GALA,
};

/**
 * Dynamically generate a complete, execution-ready blueprint from any custom user constraints
 */
export function generateAlgorithmicBlueprint(constraints: EventConstraints): EventBlueprint {
  const budget = Math.max(1000, constraints.totalBudget);
  const guests = Math.max(10, constraints.guestCount);
  const months = Math.max(1, constraints.timeRemainingMonths);
  const currency = constraints.currency;

  const perGuest = calculatePerGuestCost(budget, guests);
  const contingencyAmt = Math.round(budget * 0.05);

  // Derive palette based on key theme
  const themeLower = constraints.keyTheme.toLowerCase();
  let palette = [
    { name: 'Architectural Stone', hex: '#E7E2DF', role: 'Neutral Grounding', notes: 'Base architectural palette and structural linens' },
    { name: 'Warm Terracotta', hex: '#C86D51', role: 'Primary Accent', notes: 'Focal signage, floral highlights, and lounge accents' },
    { name: 'Sage Botanica', hex: '#7D8D7B', role: 'Secondary Harmony', notes: 'Foliage and textured natural elements' },
    { name: 'Burnished Brass', hex: '#C29F5D', role: 'Metallic Hardware', notes: 'Table cutlery, lighting hardware, and architectural trim' },
    { name: 'Deep Espresso', hex: '#262220', role: 'High-Contrast Depth', notes: 'Signage typography and evening shadows' },
  ];

  if (themeLower.includes('cyber') || themeLower.includes('tech') || themeLower.includes('minimal')) {
    palette = [
      { name: 'Obsidian Black', hex: '#0D0E12', role: 'Foundation Canvas', notes: 'Matte backdrops, staging, and technical fixtures' },
      { name: 'Electric Cyan', hex: '#00F0FF', role: 'Luminescent Accent', notes: 'Digital screens, badge accents, and directional lighting' },
      { name: 'Vibrant Violet', hex: '#8B5CF6', role: 'Atmospheric Energy', notes: 'Perimeter uplights and presentation transitions' },
      { name: 'Pure Titanium', hex: '#F8FAFC', role: 'High-Contrast Clarity', notes: 'Typography and award graphics' },
      { name: 'Graphite Metal', hex: '#334155', role: 'Structural Surface', notes: 'Podiums, furniture frames, and hardware' },
    ];
  } else if (themeLower.includes('moody') || themeLower.includes('noir') || themeLower.includes('disco') || themeLower.includes('lounge')) {
    palette = [
      { name: 'Nocturne Noir', hex: '#1C1917', role: 'Deep Foundation', notes: 'Velvet drapery and architectural shadows' },
      { name: 'Warm Amber', hex: '#D97706', role: 'Atmospheric Warmth', notes: 'Filament lighting, cocktail tinctures, and candle glow' },
      { name: 'Burgundy Velvet', hex: '#701A75', role: 'Lush Accent', notes: 'Floral accents and lounge seating' },
      { name: 'Burnished Gold', hex: '#EAB308', role: 'Metallic Pop', notes: 'Barware, glassware rims, and foil signage' },
      { name: 'Smoked Cream', hex: '#F5F5F4', role: 'Textural Highlight', notes: 'Paper stationery and tactile linen accents' },
    ];
  }

  // Categories with tailored percentages
  const categories: BudgetCategoryAllocation[] = [
    {
      id: 'venue',
      category: 'Venue & Facilities',
      percentage: 22,
      allocatedAmount: calculateCategoryAmount(budget, 22),
      description: `Primary venue rental at ${constraints.locationSetting}, climate control, bridal/VIP suites, and facility janitorial.`,
      costOptimizationTips: [
        'Secure multi-hour block booking during off-peak arrival windows to negotiate waived cleaning or setup fees.',
        'Confirm if existing furniture (tables, chairs, staging) is included to eliminate redundant third-party rental deliveries.',
      ],
      lineItems: [
        { name: 'Site Buyout & Facility Rental', estimatedCost: Math.round(budget * 0.17) },
        { name: 'Facility Insurance & Post-Event Janitorial Strike', estimatedCost: Math.round(budget * 0.05) },
      ],
    },
    {
      id: 'fnb',
      category: 'Food & Beverage',
      percentage: 34,
      allocatedAmount: calculateCategoryAmount(budget, 34),
      description: `Curated dining experience for ${guests} guests, cocktail appetizers, beverage bar service, and professional catering staff.`,
      costOptimizationTips: [
        'Select elevated family-style or interactive chef stations over formal plated courses to save 20-25% on server staffing costs.',
        'Curate 2 signature craft cocktails with batch bases rather than open premium bars to control waste and accelerate drink flow.',
      ],
      lineItems: [
        { name: `Food Menu & Hors d'Oeuvres (${guests} guests)`, estimatedCost: Math.round(budget * 0.22) },
        { name: 'Beverage & Bar Service Package', estimatedCost: Math.round(budget * 0.08) },
        { name: 'Catering Staffing & Service Gratuities', estimatedCost: Math.round(budget * 0.04) },
      ],
    },
    {
      id: 'decor',
      category: 'Decor & Spatial Lighting',
      percentage: 15,
      allocatedAmount: calculateCategoryAmount(budget, 15),
      description: `Spatial lighting architecture, focal floral installations, custom entryway, and tactile tablescape styling aligned with "${constraints.keyTheme}".`,
      costOptimizationTips: [
        'Invest in warm architectural pin-spots and uplighting: transforms cavernous rooms far more cost-effectively than dense floral mass.',
        'Repurpose greeting area florals to the main stage or dining focal point once guest arrivals conclude.',
      ],
      lineItems: [
        { name: 'Focal Feature & Entrance Spatial Installation', estimatedCost: Math.round(budget * 0.07) },
        { name: 'Tablescapes & Ambient Lighting Rigs', estimatedCost: Math.round(budget * 0.05) },
        { name: 'Custom Signage & Escort Displays', estimatedCost: Math.round(budget * 0.03) },
      ],
    },
    {
      id: 'photo_av',
      category: 'Photography & Audio-Visual',
      percentage: 13,
      allocatedAmount: calculateCategoryAmount(budget, 13),
      description: 'Lead visual documentation team, sound PA system, wireless microphone kit, and cinematic highlight edit.',
      costOptimizationTips: [
        'Contract a combined visual team rather than separate solo vendors to eliminate travel redundancies and equipment clutter.',
        'Request digital delivery of full raw files on an external drive to bypass high-cost specialty physical albums.',
      ],
      lineItems: [
        { name: 'Lead & Associate Visual Documentation Team', estimatedCost: Math.round(budget * 0.08) },
        { name: 'Sound PA System, Wireless Mics & Audio Tech', estimatedCost: Math.round(budget * 0.05) },
      ],
    },
    {
      id: 'entertainment',
      category: 'Entertainment & Music',
      percentage: 8,
      allocatedAmount: calculateCategoryAmount(budget, 8),
      description: 'Master of Ceremonies / Host, dynamic DJ or live musical performers, dance floor lighting and sonic cues.',
      costOptimizationTips: [
        'Hire a versatile live soloist who transitions into DJ mode later in the night to avoid booking two separate musical outfits.',
        'Provide an exact cue sheet and playlist constraints in advance to maximize performance flow without rehearsal surcharges.',
      ],
      lineItems: [
        { name: 'Host / DJ / Musical Entertainment', estimatedCost: Math.round(budget * 0.06) },
        { name: 'Lighting & Audio Monitoring Equipment', estimatedCost: Math.round(budget * 0.02) },
      ],
    },
    {
      id: 'attire_favors',
      category: 'Stationery, Favors & Touchpoints',
      percentage: 4,
      allocatedAmount: calculateCategoryAmount(budget, 4),
      description: 'Bespoke welcome touchpoints, interactive keepsakes, day-of printed guides, and host coordination essentials.',
      costOptimizationTips: [
        'Deploy digital RSVP and dietary registration systems to cut paper printing and mailing costs by 50%.',
        'Incorporate the interactive guest activity into the takeaway favor so guests leave with a personal keepsake they cherish.',
      ],
      lineItems: [
        { name: 'Digital & Print Invitation Collateral', estimatedCost: Math.round(budget * 0.02) },
        { name: `Personalized Keepsakes for ${guests} Guests`, estimatedCost: Math.round(budget * 0.02) },
      ],
    },
    {
      id: 'contingency',
      category: 'Contingency & Reserve Buffer',
      percentage: 4,
      allocatedAmount: calculateCategoryAmount(budget, 4),
      description: 'Dedicated financial buffer for unexpected overtime, weather adaptations, vendor gratuities, and emergency replacements.',
      costOptimizationTips: [
        'Keep this reserve locked until 72 hours prior to the event; unspent capital can be rewarded as team bonuses.',
        'Ensure all contracts specify an operational grace window (30 mins) before hourly overtime rates take effect.',
      ],
      lineItems: [
        { name: 'Weather & Logistical Contingency Pool', estimatedCost: Math.round(budget * 0.04) },
      ],
    },
  ];

  // Dynamic backward timeline milestones tailored to timeRemainingMonths
  const milestones: MilestoneCheckpoint[] = [];
  if (months >= 3) {
    milestones.push({
      id: 'm-phase-1',
      timeframe: `${months} to ${Math.max(2, months - 1)} Months Out`,
      phase: 'Strategy & Foundations',
      tasks: [
        { id: 't-dyn-1', title: `Contract ${constraints.locationSetting} venue and confirm sound/logistics permits`, category: 'Venue', ownerRole: 'Logistics Director', completed: true, priority: 'Critical' },
        { id: 't-dyn-2', title: `Lock primary caterer for ${guests} guests and establish menu tasting date`, category: 'Vendors', ownerRole: 'Event Host / VIP', completed: true, priority: 'Critical' },
        { id: 't-dyn-3', title: `Establish creative vision and color palette: "${constraints.keyTheme}"`, category: 'Design', ownerRole: 'Logistics Director', completed: true, priority: 'High' },
        { id: 't-dyn-4', title: 'Contract Lead Photographer / AV production house', category: 'Vendors', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
      ],
    });
  }

  milestones.push({
    id: 'm-phase-2',
    timeframe: `${Math.min(months, 2)} Months to 4 Weeks Out`,
    phase: 'Vendor Lock-in',
    tasks: [
      { id: 't-dyn-5', title: `Send formal invitations to ${guests} guests with digital dietary tracking`, category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'High' },
      { id: 't-dyn-6', title: 'Contract entertainment / DJ and submit musical cue guidelines', category: 'Vendors', ownerRole: 'Stage Manager', completed: false, priority: 'High' },
      { id: 't-dyn-7', title: 'Conduct site walk-through to verify power drop amperages and load-in routes', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
      { id: 't-dyn-8', title: 'Procure custom supplies for the 3 signature interactive elements', category: 'Design', ownerRole: 'Logistics Director', completed: false, priority: 'Medium' },
    ],
  });

  milestones.push({
    id: 'm-phase-3',
    timeframe: '4 Weeks Out to Event Week',
    phase: 'Final Coordination',
    tasks: [
      { id: 't-dyn-9', title: 'Lock final guest headcount and submit detailed dietary matrix to catering', category: 'Guest', ownerRole: 'Event Host / VIP', completed: false, priority: 'Critical' },
      { id: 't-dyn-10', title: 'Assemble finalized Day-of Run of Show schedule and distribute to all vendor leads', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'Critical' },
      { id: 't-dyn-11', title: 'Perform 48-hour weather monitoring and confirm contingency plan activation status', category: 'Logistics', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
      { id: 't-dyn-12', title: 'Execute final vendor payments and prepare labeled cash gratuity envelopes', category: 'Finance', ownerRole: 'Logistics Director', completed: false, priority: 'High' },
    ],
  });

  // Dynamic Run of Show
  const runOfShow: RunOfShowBlock[] = [
    {
      id: 'dyn-ros-1',
      startTime: '08:30 AM',
      endTime: '11:00 AM',
      durationMinutes: 150,
      activity: 'Production Load-In & Site Infrastructure Setup',
      location: constraints.locationSetting,
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Coordinate arrival of rental trucks, lighting engineers, and staging teams. Inspect power drops and establish vendor staging zones.',
      equipmentOrSupplies: 'Site blueprints, power distro boxes, loading dock passes.',
    },
    {
      id: 'dyn-ros-2',
      startTime: '11:00 AM',
      endTime: '01:30 PM',
      durationMinutes: 150,
      activity: 'Spatial Styling, Lighting Focus & Soundcheck',
      location: 'Main Event Area',
      leadRole: 'Stage Manager',
      cuesAndNotes: `Implement aesthetic elements for "${constraints.keyTheme}". Audio engineer tunes room acoustics and runs wireless microphone frequency sweeps.`,
      equipmentOrSupplies: 'Tablescape numbers, lighting DMX console, mic battery testers.',
    },
    {
      id: 'dyn-ros-3',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      durationMinutes: 90,
      activity: 'VIP & Host Photography Documentation Session',
      location: 'Key Architectural Focal Point',
      leadRole: 'Photo/Video Lead',
      cuesAndNotes: 'Capture pristine, untruncated space shots before guest arrival, followed by curated VIP portraits according to shot list.',
      equipmentOrSupplies: 'VIP shot list, lint rollers, backup camera bodies.',
    },
    {
      id: 'dyn-ros-4',
      startTime: '04:00 PM',
      endTime: '05:00 PM',
      durationMinutes: 60,
      activity: `Guest Arrivals, Welcome Beverage & Interactive Station 1`,
      location: 'Entrance Threshold',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: `Doors open for ${guests} guests. Ambient music sets welcoming tone. Attendees engage with the signature arrival interactive touchpoint.`,
      equipmentOrSupplies: 'Welcome signage, beverage service carafes, name tag/registration materials.',
    },
    {
      id: 'dyn-ros-5',
      startTime: '05:00 PM',
      endTime: '05:45 PM',
      durationMinutes: 45,
      activity: 'Formal Program / Welcome Address & Key Moments',
      location: 'Main Stage / Focal Centerpiece',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'Host or Master of Ceremonies commands attention. Keynote address, ceremonial vows, or celebration toasts delivered.',
      equipmentOrSupplies: 'Wireless handheld microphones, confidence monitor, stage pin-spots.',
    },
    {
      id: 'dyn-ros-6',
      startTime: '06:00 PM',
      endTime: '07:30 PM',
      durationMinutes: 90,
      activity: 'Curated Dinner Service & Communal Dining',
      location: 'Dining / Banquet Area',
      leadRole: 'Catering Lead',
      cuesAndNotes: `Catering coordinates course service for ${guests} guests. Background music maintains relaxed conversational dB levels.`,
      equipmentOrSupplies: 'Course plating schedules, dietary alert tags, beverage refills.',
    },
    {
      id: 'dyn-ros-7',
      startTime: '07:30 PM',
      endTime: '08:30 PM',
      durationMinutes: 60,
      activity: 'Interactive Feature 2 Deployment & Open Celebration',
      location: 'Interactive Feature Zone',
      leadRole: 'Stage Manager',
      cuesAndNotes: 'Activate secondary interactive experience. Lighting transitions into vibrant evening energy palette.',
      equipmentOrSupplies: 'Activity props, attendant check-in, background sonic cue.',
    },
    {
      id: 'dyn-ros-8',
      startTime: '08:30 PM',
      endTime: '11:00 PM',
      durationMinutes: 150,
      activity: 'Peak Celebration, Dance Floor & Late-Night Revelry',
      location: 'Dance Floor & Lounge Areas',
      leadRole: 'Master of Ceremonies',
      cuesAndNotes: 'DJ / Live band elevates tempo. Bar serves signature late-night refreshments. Flash photographer documents candid memories.',
      equipmentOrSupplies: 'Intelligent lighting rigs, late-night snack service carts.',
    },
    {
      id: 'dyn-ros-9',
      startTime: '11:00 PM',
      endTime: '11:30 PM',
      durationMinutes: 30,
      activity: 'Grand Finale Send-Off & Guest Departure',
      location: 'Exterior Portico / Main Exit',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'Final celebration anthem. Host expresses gratitude. Guests depart with bespoke keepsakes. Rideshare marshals direct departures.',
      equipmentOrSupplies: 'Keepsake gift bags, exit lighting, departure transport coordination.',
    },
    {
      id: 'dyn-ros-10',
      startTime: '11:30 PM',
      endTime: '01:30 AM',
      durationMinutes: 120,
      activity: 'Vendor Strike, Inventory Reconciliation & Venue Handover',
      location: 'Full Facility',
      leadRole: 'Logistics Director',
      cuesAndNotes: 'All rental items inventoried into road cases. Linens bagged. Trash consolidated. Final walkthrough with venue operations manager.',
      equipmentOrSupplies: 'Handover inspection checklist, packing crates, dollies.',
    },
  ];

  return {
    constraints,
    creativeConcept: {
      aestheticTitle: `${constraints.eventType} Strategic Concept`,
      aestheticManifesto: `A meticulously engineered creative architecture synthesizing "${constraints.keyTheme}" within ${constraints.locationSetting}. Designed for ${guests} guests, this blueprint balances visual majesty, spatial rhythm, and genuine emotional resonance without generic party clichés.`,
      focalPoints: [
        {
          area: 'Entrance & Welcoming Threshold',
          description: `An immersive entry transition setting the mood for "${constraints.keyTheme}" with curated scent, warm lighting, and clear wayfinding.`,
          materiality: 'Architectural framing, textured fabric panels, directional pin-spot illumination',
        },
        {
          area: 'Central Celebration Core / Stage',
          description: 'A magnetic focal center featuring custom architectural backdrop, bespoke lighting rigs, and refined seating geometry.',
          materiality: 'Custom fabricated backdrops, brushed metal accents, low-profile ambient floral beds',
        },
        {
          area: 'Communal Dining & Gathering Tablescapes',
          description: `Intentionally paced tablescapes for ${guests} guests balancing tactile stoneware, custom menus, and ambient candlelight.`,
          materiality: 'Linen table runners, matte ceramic chargers, fluted glass votives, minimal stems',
        },
      ],
      colorPalette: palette,
      interactiveElements: [
        {
          title: 'Curated Sensory Arrival & Custom Keepsake Creation',
          targetMoment: 'Guest Check-in & Welcome Hour',
          description: `Attendees engage with an interactive station customized to "${constraints.keyTheme}", creating a personalized memento or dedication card.`,
          guestExperience: 'Tactile, intimate, personal ice-breaker that welcomes every attendee.',
          logisticalRequirement: '1 trained attendant, 1 styling table, bespoke signage, curated materials.',
        },
        {
          title: 'Interactive Taste & Botanical Pairing Experience',
          targetMoment: 'Mid-Evening Social Transition',
          description: 'Specialty culinary or mixology presentation where guests customize flavors, botanical smoke, or artisanal garnishes.',
          guestExperience: 'Multi-sensory conversation piece that breaks up static seating and energizes the room.',
          logisticalRequirement: 'Dedicated prep bar, culinary torch or artisan decanters, glassware.',
        },
        {
          title: 'Dynamic Guest Legacy Installation / Audio-Visual Memory',
          targetMoment: 'Peak Celebration & Late-Night Momentum',
          description: 'A physical or digital collective memory wall where guests leave audio messages, high-contrast instant photos, or digital notes.',
          guestExperience: 'Spontaneous communal bonding that produces an emotional archival record of the day.',
          logisticalRequirement: 'Dedicated illuminated station, archival recording equipment or instant camera film.',
        },
      ],
    },
    budgetBreakdown: {
      totalBudget: budget,
      currency,
      perGuestCost: perGuest,
      contingencyReserve: contingencyAmt,
      categories,
    },
    milestones,
    runOfShow,
    vendorVettingKit: generateContextualVendorKit(constraints),
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

/**
 * Generates tailored vendor sourcing and vetting kits for any event scenario or edge case
 */
export function generateContextualVendorKit(constraints: EventConstraints): VendorVettingItem[] {
  const combined = `${constraints.eventType} ${constraints.locationSetting} ${constraints.keyTheme}`.toLowerCase();

  // Edge case 1: Pet / Animal / Houseboat / Nautical
  if (combined.includes('pet') || combined.includes('dog') || combined.includes('houseboat') || combined.includes('boat') || combined.includes('marine')) {
    return [
      {
        id: 'vetting-marine-ops',
        category: 'Houseboat Charter & Marine Operations',
        bookingDeadline: '8 Weeks Prior to Event',
        staffingOrEquipmentBenchmark: 'USCG-licensed Captain + 2 Marine Deckhands + Gangway Safety Monitor',
        scopeOfWork: [
          'Full-day vessel charter including pre-event dockside staging and post-cruise disembarkation.',
          'USCG safety compliance, lifejacket inventory (including canine flotation vests), and emergency protocols.',
          'Shore-power hookup management and marine generator sound baffling during speeches/acoustic music.',
          'Waste pump-out certification and environmental harbor protection compliance.',
        ],
        vettingQuestions: [
          {
            id: 'marine-q1',
            question: 'Does the charter agreement include all marine fuel consumption, dockage mooring fees, and pump-out surcharges in the flat rate?',
            whyItMatters: 'Marine vessels frequently hit organizers with unexpected hourly fuel surcharges or municipal slip fees that can exceed $1,500.',
            greenFlagAnswer: 'An all-inclusive charter rate contract with fixed fuel allowances and guaranteed slip mooring rights.',
            redFlagAnswer: '"Fuel is billed post-voyage at marina market rates plus a 20% harbor administrative surcharge."',
          },
          {
            id: 'marine-q2',
            question: 'What is the exact animal/pet safety policy, sanitation deposit, and waiver requirement for non-human passengers on deck?',
            whyItMatters: 'Certain boat charters require hefty pet deposits ($500–$2,000) or enforce strict carrier confinements if not agreed upon in writing.',
            greenFlagAnswer: 'Written agreement authorizing leashed pets on designated decks with standard refundable cleaning buffer ($200 max).',
            redFlagAnswer: 'No written pet rider, or reserving the unilateral right to deny boarding to pets on day-of event.',
          },
          {
            id: 'marine-q3',
            question: 'What is the inclement weather / rough water cancellation or stationary dockside backup protocol?',
            whyItMatters: 'If high winds prevent sailing, you need clarity on whether catering and entertainment can proceed dockside without forfeiting charter fees.',
            greenFlagAnswer: 'Guaranteed dockside event continuation option with a 50% cruise-fee credit if marine conditions prohibit departure.',
            redFlagAnswer: 'Zero refund policy for adverse weather without alternative indoor or covered dockside shelter.',
          },
        ],
      },
      {
        id: 'vetting-pet-catering',
        category: 'Pet-Safe & Human Hospitality Catering',
        bookingDeadline: '6 Weeks Prior to Event',
        staffingOrEquipmentBenchmark: '1 Lead Chef + 2 Service Staff + 1 Dedicated Canine Nutrition Steward',
        scopeOfWork: [
          'Dual culinary menu: organic veterinary-approved bark-cuterie & birthday cakes for pets, and gourmet passed canapés for humans.',
          'Strict separation of kitchen prep zones to prevent onion, garlic, chocolate, or xylitol cross-contamination.',
          'Continuous fresh water hydration stations with stainless steel bowls and splash-absorbent mats.',
          'Eco-friendly compostable serveware and discrete pet treat distribution stations.',
        ],
        vettingQuestions: [
          {
            id: 'pet-cat-q1',
            question: 'Can you provide certification of certified pet-safe, non-toxic ingredients and allergen protocols for all animal-targeted items?',
            whyItMatters: 'Common human ingredients like xylitol, grapes, garlic, and macadamia nuts are fatal to pets; zero cross-contamination is critical.',
            greenFlagAnswer: 'Lab/vet-reviewed ingredient lists displayed on food cards with zero canine toxins and dedicated food prep surfaces.',
            redFlagAnswer: '"We make our pet treats using leftover human bakery batches without custom nutritional vetting."',
          },
          {
            id: 'pet-cat-q2',
            question: 'How are human food service areas segregated to prevent dogs from accessing high-risk plates or unattended cocktail skewers?',
            whyItMatters: 'Guests holding food at low table heights can lead to canine ingestion accidents or emergency vet visits.',
            greenFlagAnswer: 'Elevated cocktail high-tops, passed trays with secure lids, and watchful stewards assigned to clear dropped food immediately.',
            redFlagAnswer: 'Low buffet banquet tables without physical barriers or pet monitors.',
          },
          {
            id: 'pet-cat-q3',
            question: 'Are server staffing gratuities, trash haul-away fees, and corkage fees explicitly included in the per-person quote?',
            whyItMatters: 'Unlisted service fees and cleanup surcharges often inflate food & beverage bills by 28-35% on final invoices.',
            greenFlagAnswer: 'Binding proposal detailing food, labor hours, travel, service fee, and local taxes on one transparent line.',
            redFlagAnswer: 'Itemized food estimate only, with labor and equipment rentals to be billed after the event.',
          },
        ],
      },
      {
        id: 'vetting-pet-photo',
        category: 'Marine & Action Pet Photography',
        bookingDeadline: '5 Weeks Prior to Event',
        staffingOrEquipmentBenchmark: '1 Lead Photographer (Fast Shutter / Animal Specialist) + 1 Drone Pilot',
        scopeOfWork: [
          'High-speed burst action photography capturing dogs playing, diving, and wearing nautical attire on the sun deck.',
          'Pre-cruise waterfront family portraits and candid human-pet bonding moments.',
          'FAA-licensed drone aerial photography capturing the houseboat cruise along scenic harbor waterways.',
          'Curated 48-hour preview gallery and delivery of color-corrected high-resolution digital files with print release.',
        ],
        vettingQuestions: [
          {
            id: 'pet-photo-q1',
            question: 'Do you carry marine liability insurance, waterproof gear backups, and experience photographing fast-moving animals in rocking environments?',
            whyItMatters: 'Shooting energetic pets on moving water requires weather-sealed bodies, high ISO performance, and knowledge of animal behavior.',
            greenFlagAnswer: 'Dedicated pet portfolio, dual camera bodies with 1/2000s shutter lenses, and commercial marine equipment insurance.',
            redFlagAnswer: '"I shoot weddings and expect the pets will stay still for posed portraits."',
          },
          {
            id: 'pet-photo-q2',
            question: 'Are all digital full-resolution image downloads included without watermarks or mandatory physical album purchases?',
            whyItMatters: 'Some studios charge $50 per digital file download or withhold unedited images behind aggressive print packages.',
            greenFlagAnswer: 'Full gallery download with unrestricted personal printing rights explicitly stated in the contract.',
            redFlagAnswer: 'Only web-resolution watermarked proofs included, with prints requiring additional studio orders.',
          },
          {
            id: 'pet-photo-q3',
            question: 'What is the FAA drone permit status for harbor flight, and what occurs if wind speeds exceed drone safety limits?',
            whyItMatters: 'Unauthorized drone operations over water can lead to Coast Guard fines or sudden equipment loss.',
            greenFlagAnswer: 'Part 107 certified pilot who checks airspace waivers in advance and pivots to telephoto deck shots in high winds.',
            redFlagAnswer: 'Unlicensed drone flying with no contingency plan if water turbulence prevents takeoff.',
          },
        ],
      },
      {
        id: 'vetting-nautical-decor',
        category: 'Nautical Decor, Pet Safety & Spatial Styling',
        bookingDeadline: '4 Weeks Prior to Event',
        staffingOrEquipmentBenchmark: '1 Lead Spatial Stylist + 2 Riggers for Non-Slip Marine Deck Setup',
        scopeOfWork: [
          'Eco-friendly, chew-safe nautical garlands, custom wooden signage, and weighted balloon installations that cannot blow into the water.',
          'Non-slip artificial turf runners along main deck walkways and an enclosed astroturf pet relief station.',
          'Marine-grade tie-downs for all furniture and decor to prevent wind gusts or wake shifts from dislodging items.',
          'Full teardown and zero-waste retrieval ensuring zero plastics or decor enter the water.',
        ],
        vettingQuestions: [
          {
            id: 'nautical-decor-q1',
            question: 'How do you guarantee that zero balloons, floral wire, or plastic fasteners can detach and fall into the marine waterway?',
            whyItMatters: 'Environmental marine regulations strictly prohibit loose plastics or balloons that endanger aquatic wildlife, carrying severe fines.',
            greenFlagAnswer: 'Zero loose plastic policy: weighted mechanical fasteners, natural cotton netting, and indoor-only balloon styling.',
            redFlagAnswer: '"We use standard balloon arches and hope the harbor wind is mild."',
          },
          {
            id: 'nautical-decor-q2',
            question: 'Are all greenery, floral arrangements, and decorative materials certified 100% non-toxic to dogs and cats?',
            whyItMatters: 'Common event flowers like lilies, eucalyptus, baby’s breath, and hydrangeas cause severe toxicity if chewed by curious pets.',
            greenFlagAnswer: 'Exclusively pet-safe botanical list (sunflowers, roses, snapdragons, marigolds) verified by ASPCA guidelines.',
            redFlagAnswer: 'Unaware of pet botanical toxicity; using standard wholesale greenery mix.',
          },
          {
            id: 'nautical-decor-q3',
            question: 'Does your pricing include delivery, nautical deck installation, and end-of-night teardown before the vessel returns to slip?',
            whyItMatters: 'Houseboats face strict dock turnaround windows; delayed strike fees from the marina will be charged to the organizer.',
            greenFlagAnswer: 'Complete turnkey package with on-dock crew waiting for boat arrival to complete strike in under 45 minutes.',
            redFlagAnswer: 'Delivery and setup only; host is responsible for dismantling and disposing of decor at midnight.',
          },
        ],
      },
    ];
  }

  // Edge case 2: Tech Gala / Hackathon / Conference
  if (combined.includes('tech') || combined.includes('gala') || combined.includes('hackathon') || combined.includes('summit')) {
    return PRESET_TECH_GALA.vendorVettingKit;
  }

  // Edge case 3: Birthday / Lounge / Party
  if (combined.includes('birthday') || combined.includes('anniversary') || combined.includes('loft') || combined.includes('lounge')) {
    return PRESET_30TH_BIRTHDAY.vendorVettingKit;
  }

  // Default: Wedding / Fusion / Grand Gathering
  return PRESET_MODERN_FUSION_WEDDING.vendorVettingKit;
}
