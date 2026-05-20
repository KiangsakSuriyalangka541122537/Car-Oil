import React, { useState, useEffect } from "react";
import { FuelEntry } from "./types";
import {
  calculateWeeklySummaries,
  calculateMonthlySummaries,
  calculateYearlySummaries,
  calculateOverallAverages,
  INITIAL_MOCK_ENTRIES,
} from "./utils";
import AddExpenseForm from "./components/AddExpenseForm";
import FuelStatsDashboard from "./components/FuelStatsDashboard";
import FuelHistoryTable from "./components/FuelHistoryTable";
import FuelCharts from "./components/FuelCharts";
import PDFReport from "./components/PDFReport";
import { supabase, isSupabaseConfigured } from "./supabase";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  Table,
  BarChart2,
  Printer,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "fuel_tracker_entries_v1";

export default function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading fuel tracker entries from localStorage", e);
      }
    }
    // Return empty array for pure real-world application start
    return [];
  });

  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "charts" | "report">("dashboard");
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Load from Supabase on mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseEntries = async () => {
      setSupabaseLoading(true);
      setSupabaseError(null);
      try {
        const { data, error } = await supabase
          .from("fuel_entries")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: FuelEntry[] = data.map((item: any) => ({
            id: item.id,
            date: item.date,
            cost: Number(item.cost),
          }));
          setEntries(formatted);
        }
      } catch (err: any) {
        console.error("Error fetching from Supabase:", err);
        setSupabaseError(err.message || "ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
      } finally {
        setSupabaseLoading(false);
      }
    };

    fetchSupabaseEntries();
  }, []);

  // Handle adding of a new entry or editing of existing
  const handleAddOrEditEntry = async (
    entryData: Omit<FuelEntry, "id"> & { id?: string }
  ) => {
    if (entryData.id) {
      // Editing Mode
      const updatedId = entryData.id;
      setEntries((prev) =>
        prev.map((item) =>
          item.id === updatedId
            ? ({
                ...item,
                ...entryData,
              } as FuelEntry)
            : item
        )
      );
      setEditingEntry(null);

      // Cloud Persist
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from("fuel_entries")
            .update({
              date: entryData.date,
              cost: entryData.cost,
            })
            .eq("id", updatedId);
          if (error) throw error;
        } catch (err) {
          console.error("Cloud edit failed:", err);
        }
      }
    } else {
      // Adding Mode
      const generatedId = crypto.randomUUID();
      const newEntry: FuelEntry = {
        ...entryData,
        id: generatedId,
      };
      setEntries((prev) => [newEntry, ...prev]);

      // Cloud Persist
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from("fuel_entries")
            .insert([
              {
                id: generatedId,
                date: entryData.date,
                cost: entryData.cost,
              },
            ]);
          if (error) throw error;
        } catch (err) {
          console.error("Cloud insert failed:", err);
        }
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (editingEntry?.id === id) {
      setEditingEntry(null);
    }

    // Cloud Persist
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("fuel_entries")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.error("Cloud delete failed:", err);
      }
    }
  };

  const handleClearAll = async () => {
    if (
      confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลบันทึกทั้งหมด? ข้อมูลทั้งหมดจะถูกลบออกอย่างถาวร"
      )
    ) {
      setEntries([]);
      setEditingEntry(null);

      // Cloud Persist
      if (isSupabaseConfigured && supabase) {
        try {
          // Deletes all rows in the table
          const { error } = await supabase
            .from("fuel_entries")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
          if (error) throw error;
        } catch (err) {
          console.error("Cloud clear failed:", err);
        }
      }
    }
  };

  const handleResetToMock = () => {
    if (confirm("ต้องการโหลดสถิติตัวอย่างเพื่อใช้งานข้อมูลทดสอบ ใช่หรือไม่?")) {
      setEntries(INITIAL_MOCK_ENTRIES);
      setEditingEntry(null);
    }
  };

  // Calculations
  const weeklySummaries = calculateWeeklySummaries(entries);
  const monthlySummaries = calculateMonthlySummaries(entries);
  const yearlySummaries = calculateYearlySummaries(entries);
  const metrics = calculateOverallAverages(entries);

  return (
    <div className="min-h-screen pb-16 font-sans antialiased text-slate-800 bg-slate-50/50">
      
      {/* Primary Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-8 mb-6 shadow-sm no-print sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  ระบบบันทึกค่าน้ำมันรถยนต์
                </h1>
                <span className="bg-slate-50 text-slate-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-slate-200">
                  สถิติค่าเฉลี่ยและกราฟ
                </span>
                
                {/* Supabase status badge */}
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 shadow-sm">
                    <Database className="w-3 h-3 text-emerald-500" />
                    คลาวส์ Supabase เชื่อมต่ออยู่
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                    <CheckCircle className="w-3 h-3 text-slate-400" />
                    โหมดออฟไลน์บันทึกในเครื่อง
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                บันทึกค่าน้ำมันแต่ละครั้ง ติดตามสถิติรายสัปดาห์รายเดือน และกราฟวิเคราะห์แนวโน้มอย่างแม่นยำ
              </p>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {entries.length === 0 ? (
              <button
                id="reset-mock-btn"
                onClick={handleResetToMock}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition duration-155 cursor-pointer"
                title="โหลดสถิติตัวอย่าง"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                โหลดข้อมูลตัวอย่าง
              </button>
            ) : (
              <button
                id="clear-all-btn"
                onClick={handleClearAll}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition duration-155 cursor-pointer"
                title="ล้างข้อมูลทั้งหมด"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                ล้างข้อมูลประวัติ
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Principal body container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* DASHBOARD METRICS */}
        <section className="mb-6 no-print">
          <FuelStatsDashboard metrics={metrics} totalEntries={entries.length} />
        </section>

        {/* CONTROLLER NAVIGATION TABS */}
        <div className="border-b border-slate-200 mb-6 no-print flex items-center overflow-x-auto justify-between gap-4 scrollbar-none">
          <div className="flex space-x-1 pb-px">
            <button
              id="tab-dashboard-btn"
              onClick={() => setCurrentTab("dashboard")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold relative flex items-center gap-2 transition duration-200 cursor-pointer ${
                currentTab === "dashboard"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Table className="w-4 h-4" />
              บันทึกและประวัติ
              {currentTab === "dashboard" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                />
              )}
            </button>

            <button
              id="tab-charts-btn"
              onClick={() => setCurrentTab("charts")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold relative flex items-center gap-2 transition duration-200 cursor-pointer ${
                currentTab === "charts"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              กราฟวิเคราะห์แนวโน้ม
              {currentTab === "charts" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                />
              )}
            </button>

            <button
              id="tab-report-btn"
              onClick={() => setCurrentTab("report")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold relative flex items-center gap-2 transition duration-200 cursor-pointer ${
                currentTab === "report"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Printer className="w-4 h-4" />
              ออกรายงานสรุป
              {currentTab === "report" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                />
              )}
            </button>
          </div>
        </div>

        {/* PRIMARY SUB-WINDOWS MANAGER */}
        <div className="transition-all duration-300">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: Dashboard with Form Left, Logs Table Right */}
            {currentTab === "dashboard" && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print"
              >
                {/* Addition and Editing form Column (Left 1/3) */}
                <div className="lg:col-span-1 space-y-4">
                  <AddExpenseForm
                    onAdd={handleAddOrEditEntry}
                    editingEntry={editingEntry}
                    onCancelEdit={() => setEditingEntry(null)}
                  />
                </div>

                {/* History list Table Column (Right 2/3) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 font-sans">
                      <Layers className="w-4 h-4 text-slate-400" />
                      รายการบันทึกทั้งหมด
                    </h3>
                  </div>

                  <FuelHistoryTable
                    entries={entries}
                    onDelete={handleDeleteEntry}
                    onEdit={setEditingEntry}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 2: Dynamic Analytical Graphs */}
            {currentTab === "charts" && (
              <motion.div
                key="charts-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 no-print"
              >
                <FuelCharts
                  weeklyData={weeklySummaries}
                  monthlyData={monthlySummaries}
                  yearlyData={yearlySummaries}
                />
              </motion.div>
            )}

            {/* TAB 3: Printable Report Previews and Document Settings */}
            {currentTab === "report" && (
              <motion.div
                key="report-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <PDFReport
                  entries={entries}
                  weeklySummaries={weeklySummaries}
                  monthlySummaries={monthlySummaries}
                  yearlySummaries={yearlySummaries}
                  metrics={metrics}
                />
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

    </div>
  );
}
