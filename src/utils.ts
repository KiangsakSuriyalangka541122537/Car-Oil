import { FuelEntry, PeriodSummary, AverageMetrics } from "./types";

// Thai Month Names
export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

// Calculate Week Number
export function getWeekNumber(dateStr: string): { year: number; week: number } {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

// Format Date to short Thai style (e.g., 20 พ.ค. 2026)
export function formatThaiDate(dateStr: string, withYear = true): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const thaiYear = withYear ? year + 543 : "";
  const monthName = THAI_MONTHS_SHORT[monthIdx] || "";
  
  return `${day} ${monthName} ${thaiYear}`.trim();
}

// Format Month to full Thai style (e.g., พฤษภาคม 2569)
export function formatThaiMonth(monthStr: string): string {
  // expects "YYYY-MM"
  const parts = monthStr.split("-");
  if (parts.length !== 2) return monthStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${THAI_MONTHS[monthIdx]} ${year + 543}`;
}

// Sort entries by date in ascending order
export function getSortedEntries(entries: FuelEntry[]): FuelEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

// Calculate Weekly Summaries
export function calculateWeeklySummaries(entries: FuelEntry[]): PeriodSummary[] {
  if (entries.length === 0) return [];

  const sorted = getSortedEntries(entries);
  const groups: { [key: string]: FuelEntry[] } = {};

  sorted.forEach((entry) => {
    const { year, week } = getWeekNumber(entry.date);
    const key = `${year}-W${week.toString().padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  });

  return Object.keys(groups).map((key) => {
    const items = groups[key];
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalEntries = items.length;
    const avgCostPerEntry = totalEntries > 0 ? totalCost / totalEntries : 0;

    const parts = key.split("-W");
    const yearNum = parseInt(parts[0], 10);
    const weekNum = parseInt(parts[1], 10);
    
    return {
      periodKey: key,
      displayName: `สัปดาห์ที่ ${weekNum} ปี ${yearNum + 543}`,
      totalCost,
      totalEntries,
      avgCostPerEntry,
    };
  }).sort((a, b) => b.periodKey.localeCompare(a.periodKey)); // Newest first
}

// Calculate Monthly Summaries
export function calculateMonthlySummaries(entries: FuelEntry[]): PeriodSummary[] {
  if (entries.length === 0) return [];

  const sorted = getSortedEntries(entries);
  const groups: { [key: string]: FuelEntry[] } = {};

  sorted.forEach((entry) => {
    const key = entry.date.substring(0, 7); // "YYYY-MM"
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  });

  return Object.keys(groups).map((key) => {
    const items = groups[key];
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalEntries = items.length;
    const avgCostPerEntry = totalEntries > 0 ? totalCost / totalEntries : 0;

    return {
      periodKey: key,
      displayName: formatThaiMonth(key),
      totalCost,
      totalEntries,
      avgCostPerEntry,
    };
  }).sort((a, b) => b.periodKey.localeCompare(a.periodKey)); // Newest first
}

// Calculate Yearly Summaries
export function calculateYearlySummaries(entries: FuelEntry[]): PeriodSummary[] {
  if (entries.length === 0) return [];

  const sorted = getSortedEntries(entries);
  const groups: { [key: string]: FuelEntry[] } = {};

  sorted.forEach((entry) => {
    const key = entry.date.substring(0, 4); // "YYYY"
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  });

  return Object.keys(groups).map((key) => {
    const items = groups[key];
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalEntries = items.length;
    const avgCostPerEntry = totalEntries > 0 ? totalCost / totalEntries : 0;

    return {
      periodKey: key,
      displayName: `ปี พ.ศ. ${parseInt(key, 10) + 543}`,
      totalCost,
      totalEntries,
      avgCostPerEntry,
    };
  }).sort((a, b) => b.periodKey.localeCompare(a.periodKey)); // Newest first
}

// Calculate overall averages
export function calculateOverallAverages(entries: FuelEntry[]): AverageMetrics {
  if (entries.length === 0) {
    return {
      weeklyAverage: 0,
      monthlyAverage: 0,
      yearlyAverage: 0,
      allTimeTotal: 0,
    };
  }

  const sorted = getSortedEntries(entries);

  // Group by week, month, year to see how many unique buckets exist
  const uniqueWeeks = new Set<string>();
  const uniqueMonths = new Set<string>();
  const uniqueYears = new Set<string>();
  let totalCost = 0;

  sorted.forEach((entry) => {
    const { year, week } = getWeekNumber(entry.date);
    uniqueWeeks.add(`${year}-W${week}`);
    uniqueMonths.add(entry.date.substring(0, 7));
    uniqueYears.add(entry.date.substring(0, 4));
    totalCost += entry.cost;
  });

  const numWeeks = uniqueWeeks.size || 1;
  const numMonths = uniqueMonths.size || 1;
  const numYears = uniqueYears.size || 1;

  return {
    weeklyAverage: totalCost / numWeeks,
    monthlyAverage: totalCost / numMonths,
    yearlyAverage: totalCost / numYears,
    allTimeTotal: totalCost,
  };
}

// Pre-packaged minimalist mock data for dates and costs
export const INITIAL_MOCK_ENTRIES: FuelEntry[] = [
  {
    id: "1",
    date: "2026-01-05",
    cost: 1120,
  },
  {
    id: "2",
    date: "2026-01-18",
    cost: 1250,
  },
  {
    id: "3",
    date: "2026-02-02",
    cost: 950,
  },
  {
    id: "4",
    date: "2026-02-15",
    cost: 1300,
  },
  {
    id: "5",
    date: "2026-03-01",
    cost: 1210,
  },
  {
    id: "6",
    date: "2026-03-15",
    cost: 1400,
  },
  {
    id: "7",
    date: "2026-04-02",
    cost: 1100,
  },
  {
    id: "8",
    date: "2026-04-16",
    cost: 1350,
  },
  {
    id: "9",
    date: "2026-05-01",
    cost: 1290,
  },
  {
    id: "10",
    date: "2026-05-15",
    cost: 1420,
  }
];
