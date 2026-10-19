import type { EventBlueprint } from '../types/blueprint.ts';
import { formatCurrency } from './blueprintEngine.ts';

export function generateMarkdown(blueprint: EventBlueprint): string {
  const { constraints, creativeConcept, budgetBreakdown, milestones, runOfShow, vendorVettingKit } =
    blueprint;

  let md = `# MASTER EVENT STRATEGY & LOGISTICS BLUEPRINT\n`;
  md += `Generated: ${new Date(blueprint.generatedAt).toLocaleDateString()} | Version: ${blueprint.version}\n\n`;

  md += `## EVENT CONSTRAINTS\n`;
  md += `- Event Type: ${constraints.eventType}\n`;
  md += `- Total Budget: ${formatCurrency(constraints.totalBudget, constraints.currency)}\n`;
  md += `- Location / Setting: ${constraints.locationSetting}\n`;
  md += `- Confirmed Guest Count: ${constraints.guestCount} guests\n`;
  md += `- Key Theme / Preferences: ${constraints.keyTheme}\n`;
  md += `- Time Remaining: ${constraints.timeRemainingMonths} months\n\n`;

  md += `## 1. PERSONALIZED CREATIVE CONCEPT\n`;
  md += `### Aesthetic: ${creativeConcept.aestheticTitle}\n`;
  md += `${creativeConcept.aestheticManifesto}\n\n`;

  md += `### Curated Color Scheme:\n`;
  creativeConcept.colorPalette.forEach((c) => {
    md += `- ${c.name} (${c.hex}) - ${c.role}: ${c.notes}\n`;
  });
  md += `\n`;

  md += `### Decor Focal Points:\n`;
  creativeConcept.focalPoints.forEach((f, i) => {
    md += `${i + 1}. **${f.area}**: ${f.description}\n   *Materiality:* ${f.materiality}\n`;
  });
  md += `\n`;

  md += `### 3 Signature Interactive Elements:\n`;
  creativeConcept.interactiveElements.forEach((el, i) => {
    md += `${i + 1}. **${el.title}** (${el.targetMoment})\n   - Description: ${el.description}\n   - Guest Experience: ${el.guestExperience}\n   - Logistical Requirement: ${el.logisticalRequirement}\n\n`;
  });

  md += `## 2. DYNAMIC BUDGET BREAKDOWN TABLE\n`;
  md += `| Category | % Allocation | Amount (${budgetBreakdown.currency}) | Cost-Optimization Strategies |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  budgetBreakdown.categories.forEach((cat) => {
    md += `| ${cat.category} | ${cat.percentage}% | ${formatCurrency(cat.allocatedAmount, budgetBreakdown.currency)} | 1) ${cat.costOptimizationTips[0]}<br/>2) ${cat.costOptimizationTips[1]} |\n`;
  });
  md += `\n*Per-Guest Investment: ${formatCurrency(budgetBreakdown.perGuestCost, budgetBreakdown.currency)} | Contingency Buffer: ${formatCurrency(budgetBreakdown.contingencyReserve, budgetBreakdown.currency)}*\n\n`;

  md += `## 3. MILESTONES & DAY-OF TIMELINE\n`;
  md += `### Backward Planning Timeline:\n`;
  milestones.forEach((m) => {
    md += `#### ${m.timeframe} - ${m.phase}\n`;
    m.tasks.forEach((t) => {
      md += `- [${t.completed ? 'x' : ' '}] (${t.category} / ${t.ownerRole}) ${t.title}${t.deadlineNote ? ` [Note: ${t.deadlineNote}]` : ''}\n`;
    });
    md += `\n`;
  });

  md += `### Day-of Run of Show:\n`;
  md += `| Time Window | Activity | Location | Designated Lead | Cues & Operational Notes |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  runOfShow.forEach((b) => {
    md += `| ${b.startTime} - ${b.endTime} | ${b.activity} | ${b.location} | ${b.leadRole} | ${b.cuesAndNotes} |\n`;
  });
  md += `\n`;

  md += `## 4. VENDOR SOURCING & VETTING KIT\n`;
  vendorVettingKit.forEach((v) => {
    md += `### Category: ${v.category}\n`;
    md += `- **Booking Deadline:** ${v.bookingDeadline}\n`;
    md += `- **Benchmark:** ${v.staffingOrEquipmentBenchmark}\n`;
    md += `**Scope of Work:**\n`;
    v.scopeOfWork.forEach((s) => {
      md += `  - ${s}\n`;
    });
    md += `\n**Forensic Vetting Questions (Eliminate Hidden Fees):**\n`;
    v.vettingQuestions.forEach((q, idx) => {
      md += `${idx + 1}. "${q.question}"\n   - *Why It Matters:* ${q.whyItMatters}\n   - *Green Flag:* ${q.greenFlagAnswer}\n   - *Red Flag Trap:* ${q.redFlagAnswer}\n`;
    });
    md += `\n`;
  });

  return md;
}

export function generateICS(blueprint: EventBlueprint): string {
  const { constraints, runOfShow } = blueprint;

  const eventDate = new Date();
  eventDate.setMonth(eventDate.getMonth() + (constraints.timeRemainingMonths || 3));
  const dayOfWeek = eventDate.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  eventDate.setDate(eventDate.getDate() + daysUntilSaturday);

  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const parseTimeToICS = (timeStr: string): string => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return '090000';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}${minutes}00`;
  };

  const nowTimestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const clean = (str: string) => str.replace(/[,;\\]/g, ' ').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanIQ//Event Strategy & Logistics Director//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Run of Show - ${clean(constraints.eventType)}`,
  ];

  runOfShow.forEach((block, idx) => {
    const startICS = `${dateStr}T${parseTimeToICS(block.startTime)}`;
    const endICS = `${dateStr}T${parseTimeToICS(block.endTime)}`;
    const desc = `Designated Lead: ${block.leadRole}\\nActivity: ${block.activity}\\nOperational Cues: ${block.cuesAndNotes}\\nEquipment: ${block.equipmentOrSupplies || 'N/A'}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:planiq-${Date.now()}-${idx}@planiq.internal`);
    lines.push(`DTSTAMP:${nowTimestamp}`);
    lines.push(`DTSTART:${startICS}`);
    lines.push(`DTEND:${endICS}`);
    lines.push(`SUMMARY:[${clean(block.leadRole)}] ${clean(block.activity)}`);
    lines.push(`LOCATION:${clean(block.location)}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
