import React from "react";
import { AverageMetrics, FuelEntry } from "../types";
import { 
  TrendingUp, 
  CalendarDays, 
  CalendarRange, 
  Coins
} from "lucide-react";

interface FuelStatsDashboardProps {
  metrics: AverageMetrics;
  totalEntries: number;
  entries?: FuelEntry[];
}

export default function FuelStatsDashboard({ metrics, totalEntries, entries = [] }: FuelStatsDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Grid of Averages Card */}
      <div id="fuel-stats-dashboard-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        
        {/* Card 1: Weekly Average */}
        <div id="stat-weekly-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-all duration-300">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายสัปดาห์ (เฉพาะน้ำมัน)</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.weeklyAverage.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] sm:text-xs text-slate-400">บาท / สัปดาห์</p>
              <span className="text-[9px] bg-slate-550/5 text-slate-500 px-1 py-0.10 rounded border border-slate-100 font-sans">คำนวณจริงตามสัปดาห์ปี</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Average */}
        <div id="stat-monthly-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-all duration-300">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายเดือน (เฉพาะน้ำมัน)</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.monthlyAverage.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] sm:text-xs text-slate-400">บาท / เดือน</p>
              <span className="text-[9px] bg-slate-50 text-slate-550 px-1 py-0.10 rounded border border-slate-100 font-sans font-medium">สัปดาห์ × 4</span>
            </div>
          </div>
        </div>

        {/* Card 3: Yearly Average */}
        <div id="stat-yearly-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-all duration-300">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายปี (เฉพาะน้ำมัน)</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.yearlyAverage.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] sm:text-xs text-slate-400">บาท / ปี</p>
              <span className="text-[9px] bg-slate-50 text-slate-550 px-1 py-0.10 rounded border border-slate-100 font-sans font-medium">สัปดาห์ × 52</span>
            </div>
          </div>
        </div>

        {/* Card 4: Cumulative Total Cost */}
        <div id="stat-total-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-all duration-300">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ยอดใช้จ่ายรวมสะสม</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.allTimeTotal.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] sm:text-xs text-slate-400">บาททั้งหมด</p>
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.25 rounded font-semibold font-mono">
                {totalEntries} ครั้ง
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
