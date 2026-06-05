export interface FuelEntry {
  id: string;
  date: string; // YYYY-MM-DD
  cost: number; // Baht
  notes?: string;
  category?: "fuel" | "engine_oil" | "maintenance" | "tyres";
}

export interface PeriodSummary {
  periodKey: string; // e.g. "2026-W20", "2026-05", "2026"
  displayName: string;
  totalCost: number;
  totalEntries: number;
  avgCostPerEntry: number;
}

export interface AverageMetrics {
  weeklyAverage: number;
  monthlyAverage: number;
  yearlyAverage: number;
  allTimeTotal: number;
  weeksSpanned?: number;
  monthsSpanned?: number;
  yearsSpanned?: number;
}
