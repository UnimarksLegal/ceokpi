export const DEFAULT_WEIGHTS = {
  Sales: 0,
  Marketing: 0,
  Operations: 0,
  Legal: 0,
  "People Development": 0,
  "Accounts & Finance": 0,
};

export const METRICS_MAP: Record<string, string[]> = {
  Sales: [
    "New Client Acquisition",
    "Revenue from New Matters",
    "Deal Conversion Rate",
    "Average Deal Size",
    "Client Retention %",
  ],
  Marketing: [
    "Qualified Leads Generated",
    "Content & Thought Leadership",
    "SEO Ranking Performance",
    "Brand Visibility Index",
    "Cost per Lead (Efficiency)",
  ],
  Operations: [
    "Matter Turnaround Time",
    "Process Compliance Rate",
    "Technology Utilization",
    "Error/Defect Rate (Low=Good)",
    "Client Satisfaction in Delivery",
  ],
  Legal: [
    "Success Rate in Matters",
    "Timeliness of Filings",
    "Quality Review Score",
    "High-value Case Wins",
    "KM/Precedent Contributions",
  ],
  "People Development": [
    "Attrition (Low=Good)",
    "Training Hours / Associate",
    "Performance Reviews on Time",
    "Engagement Index",
    "Hiring Effectiveness",
  ],
  "Accounts & Finance": [
    "Revenue Growth Rate",
    "Collection Efficiency (DSO)",
    "Expense Ratio (Low=Good)",
    "Net Profit Margin",
    "Cash Reserve Months",
  ],
};

export const INVERSE_KEYS = new Set([
  "Error/Defect Rate (Low=Good)",
  "Attrition (Low=Good)",
  "Expense Ratio (Low=Good)",
]);

export const seedDepartmentScores = () => {
  const out: Record<string, Record<string, number>> = {};
  Object.entries(METRICS_MAP).forEach(([dept, metrics]) => {
    out[dept] = Object.fromEntries(metrics.map((m) => [m, 60]));
  });
  return out;
};
