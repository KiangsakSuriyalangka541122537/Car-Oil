import React, { useState } from "react";
import { PeriodSummary } from "../types";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface FuelChartsProps {
  weeklyData: PeriodSummary[];
  monthlyData: PeriodSummary[];
  yearlyData: PeriodSummary[];
}

export default function FuelCharts({ weeklyData, monthlyData, yearlyData }: FuelChartsProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");

  // Format data for Recharts, reverse to show chronological order (oldest to newest)
  const chartData = (activeTab === "monthly" ? monthlyData : weeklyData)
    .slice()
    .reverse();

  // Custom tooltips
  const CustomTooltipCost = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs font-sans space-y-1">
          <p className="font-semibold text-slate-300 mb-1">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400 font-sans">ยอดค่าน้ำมันรวม:</span>
              <span className="font-bold text-indigo-400 font-mono">
                {payload[0].value.toLocaleString("th-TH")} ฿
              </span>
            </p>
            {payload[1] && (
              <p className="flex justify-between gap-4">
                <span className="text-slate-400 font-sans">จำนวนครั้งเติม:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {payload[1].value} ครั้ง
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipStats = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs font-sans space-y-1">
          <p className="font-semibold text-slate-300 mb-1">{label}</p>
          <div className="space-y-1">
            {payload[0] && (
              <p className="flex justify-between gap-4">
                <span className="text-slate-400 font-sans">ค่าใช้จ่ายเฉลี่ยต่อครั้ง:</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {payload[0].value.toFixed(2)} ฿/ครั้ง
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="fuel-charts-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-500" />
          กราฟแสดงแนวโน้มค่าใช้จ่ายน้ำมัน
        </h3>
        
        {/* Toggle between Weekly and Monthly */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center self-start sm:self-auto">
          <button
            id="chart-tab-monthly"
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            รายเดือน
          </button>
          <button
            id="chart-tab-weekly"
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "weekly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            รายสัปดาห์
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Cumulative raw Cost & Entries */}
        <div id="total-cost-chart-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">ยอดค่าน้ำมันและสถิติรวม</h4>
              <p className="text-xs text-slate-400 mt-0.5">ค่าน้ำมันรวม (บาท) เปรียบเทียบกับความถี่การเติม (ครั้ง) ในแต่ละช่วงเวลา</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 text-xs">
                ไม่มีข้อมูลประวัติสำหรับประมวลผลกราฟ
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayName" 
                    tick={{ fontSize: 10, fill: "#64748b" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 9, fill: "#64748b" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 9, fill: "#64748b" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltipCost />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalCost" 
                    name="ค่าน้ำมันรวม (บาท)" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="totalEntries" 
                    name="ความถี่เติมน้ำมัน (ครั้ง)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEntries)" 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10, color: "#334155" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graph 2: Price Trend & Efficiency */}
        <div id="average-cost-chart-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">ค่าใช้จ่ายเฉลี่ยต่อการเติมน้ำมันแต่ละครั่ง</h4>
              <p className="text-xs text-slate-400 mt-0.5">สะท้อนเฉลี่ยเงินที่หมดไปต่อการเติมในทริปน้ำมัน (บาทต่อการเข้าปั๊มแต่ละครั่ง)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 text-xs">
                ไม่มีข้อมูลประวัติสำหรับประมวลผลกราฟ
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayName" 
                    tick={{ fontSize: 10, fill: "#64748b" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 9, fill: "#64748b" }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltipStats />} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgCostPerEntry" 
                    name="เฉลี่ยเติมต่อครั้ง (บาท)" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#FFF", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10, color: "#334155" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
