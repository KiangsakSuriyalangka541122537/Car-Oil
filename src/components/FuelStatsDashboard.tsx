import React, { useState } from "react";
import { AverageMetrics, FuelEntry } from "../types";
import { TrendingUp, CalendarDays, CalendarRange, Milestone, HelpCircle, ChevronDown, ChevronUp, BookOpen, AlertCircle, PiggyBank, Coins } from "lucide-react";
import { formatThaiDate, getSortedEntries } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface FuelStatsDashboardProps {
  metrics: AverageMetrics;
  totalEntries: number;
  entries?: FuelEntry[];
}

export default function FuelStatsDashboard({ metrics, totalEntries, entries = [] }: FuelStatsDashboardProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Parse first and last dates
  const sorted = entries.length > 0 ? getSortedEntries(entries) : [];
  const firstDate = sorted.length > 0 ? formatThaiDate(sorted[0].date) : "-";
  const lastDate = sorted.length > 0 ? formatThaiDate(sorted[sorted.length - 1].date) : "-";
  const weeksSpanned = metrics.weeksSpanned || 1;

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
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายสัปดาห์</p>
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
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายเดือน</p>
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
            <p className="text-xs font-semibold text-slate-500 mb-0.5">ค่าเฉลี่ยรายปี</p>
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

      {/* Explanation toggle section */}
      {entries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <button
            onClick={() => setIsExplanationOpen(!isExplanationOpen)}
            className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold select-none"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>ที่มาและสูตรการคิดคำนวณค่าเฉลี่ยสถิติทั้งหมดนี้?</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-normal">{isExplanationOpen ? "ซ่อนรายละเอียด" : "คลิกเพื่อดูสูตรและขอบเขตวิเคราะห์"}</span>
              {isExplanationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          
          <AnimatePresence>
            {isExplanationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-100 mt-3 text-xs text-slate-650 space-y-3 font-sans leading-relaxed">
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
                    <p className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      ขอบเขตข้อมูลสมมติฐานตามระยะเวลากรอกจริง:
                    </p>
                    <ul className="list-decimal list-inside space-y-2 text-slate-600 text-[11px] pl-1">
                      <li>
                        <strong className="text-slate-800">ขอบเขตระยะเวลาปฏิทิน:</strong> เริ่มตั้งแต่วันที่เติมครั้งแรก <span className="font-semibold text-slate-800">{firstDate}</span> จนถึงรายการล่าสุดวันที่ <span className="font-semibold text-slate-800">{lastDate}</span>
                        <br />
                        <span className="text-slate-400 text-[10px] ml-4">
                          * คิดคำนวณห่างกันเป็นระยะเวลาแผ่คลุมปฏิทินจริงทั้งหมด <strong className="text-slate-800 font-semibold">{weeksSpanned} สัปดาห์</strong>
                        </span>
                      </li>
                      <li>
                        <strong className="text-slate-800">วิธีบันทึกและเฉลี่ยรายสัปดาห์:</strong> นำผลรวมราคาน้ำมันสะสมทั้งหมด หารด้วยระยะสัปดาห์ปฏิทินจริง ({weeksSpanned} สัปดาห์)
                        <div className="mt-1 bg-white font-mono border border-slate-150 rounded-lg p-2 text-slate-800 font-medium inline-block shadow-2xs">
                          {metrics.allTimeTotal.toLocaleString("th-TH")} บาท ÷ {weeksSpanned} สัปดาห์ = <strong className="text-slate-950 font-bold">{metrics.weeklyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</strong> / สัปดาห์
                        </div>
                      </li>
                      <li>
                        <strong className="text-slate-800">ค่าเฉลี่ยรายเดือน (อิงสัปดาห์ × 4):</strong> คิดเฉลี่ยตามพฤติกรรมการใช้น้ำมันเสถียรรายสัปดาห์สะสมแบบ 4 สัปดาห์ต่อเนื่อง
                        <div className="mt-1 bg-white font-mono border border-slate-150 rounded-lg p-2 text-slate-800 font-medium inline-block shadow-2xs">
                          {metrics.weeklyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท × 4 สัปดาห์ = <strong className="text-slate-950 font-bold">{metrics.monthlyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</strong> / เดือน
                        </div>
                      </li>
                      <li>
                        <strong className="text-slate-800">ค่าเฉลี่ยรายปี (อิงสัปดาห์ × 52):</strong> แปลงยอดเฉลี่ยรายสัปดาห์ไปเทียบอัตราตลอดทั้งปี (52 สัปดาห์)
                        <div className="mt-1 bg-white font-mono border border-slate-150 rounded-lg p-2 text-slate-800 font-medium inline-block shadow-2xs">
                          {metrics.weeklyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท × 52 สัปดาห์ = <strong className="text-slate-950 font-bold">{metrics.yearlyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</strong> / ปี
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50/20 p-2 rounded-lg border border-slate-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>
                      <strong>ทำไมใช้สูตรนี้?</strong> การใช้ค่าเฉลี่ยรายสัปดาห์เป็นตัวฐานแล้วคูณย้อนขึ้น (คูณ 4 และคูณ 52) ช่วยจัดระเบียบตัวเลขให้สัมพันธ์กันทั้งหมดอย่างสมน้ำสมเนื้อ หากใช้ยอดหารแยกต่างหากตามจำนวนเดือน/ปีตรงๆ จะเกิดความไม่สมดุลกับความต่างรายสัปดาห์ ดังนั้นวิธีการคิดอิงสัปดาห์นี้จึงถูกต้องและเข้าใจง่ายในแนวคิดทางคณิตศาสตร์อย่างเป็นระบบ
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
