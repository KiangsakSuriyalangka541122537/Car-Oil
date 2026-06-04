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
  const [tableName, setTableName] = useState<string>(() => {
    return localStorage.getItem("fuel_tracker_table_name")?.trim() || "Car-Oil fuel_entries";
  });

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
          .from(tableName)
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: FuelEntry[] = data.map((item: any) => ({
            id: item.id,
            date: item.date,
            cost: Number(item.cost),
            category: item.category || "fuel",
            notes: item.notes || "",
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
  }, [tableName]);

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
            .from(tableName)
            .update({
              date: entryData.date,
              cost: entryData.cost,
              category: entryData.category || "fuel",
              notes: entryData.notes || "",
            })
            .eq("id", updatedId);
          
          if (error) {
            const isMissingColumn = error.code === "42703" || (error.message && error.message.toLowerCase().includes("column"));
            if (isMissingColumn) {
              console.warn("Supabase columns 'category' or 'notes' do not exist in the table. Retrying with basic columns.");
              const { error: retryError } = await supabase
                .from(tableName)
                .update({
                  date: entryData.date,
                  cost: entryData.cost,
                })
                .eq("id", updatedId);
              if (retryError) throw retryError;
            } else {
              throw error;
            }
          }
        } catch (err: any) {
          console.error("Cloud edit failed:", err);
          setSupabaseError(`แก้ไขข้อมูลบน Cloud ล้มเหลว: ${err.message || err}`);
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
            .from(tableName)
            .insert([
              {
                id: generatedId,
                date: entryData.date,
                cost: entryData.cost,
                category: entryData.category || "fuel",
                notes: entryData.notes || "",
              },
            ]);
          
          if (error) {
            const isMissingColumn = error.code === "42703" || (error.message && error.message.toLowerCase().includes("column"));
            if (isMissingColumn) {
              console.warn("Supabase columns 'category' or 'notes' do not exist in the table. Retrying with basic columns.");
              const { error: retryError } = await supabase
                .from(tableName)
                .insert([
                  {
                    id: generatedId,
                    date: entryData.date,
                    cost: entryData.cost,
                  },
                ]);
              if (retryError) throw retryError;
            } else {
              throw error;
            }
          }
        } catch (err: any) {
          console.error("Cloud insert failed:", err);
          setSupabaseError(`เพิ่มข้อมูลลง Cloud ล้มเหลว: ${err.message || err}`);
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
          .from(tableName)
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        console.error("Cloud delete failed:", err);
        setSupabaseError(`ลบข้อมูลบน Cloud ล้มเหลว: ${err.message || err}`);
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
            .from(tableName)
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
          if (error) throw error;
        } catch (err: any) {
          console.error("Cloud clear failed:", err);
          setSupabaseError(`ล้างข้อมูลบนคลาวด์ขัดข้อง: ${err.message || err}`);
        }
      }
    }
  };

  const handleSyncLocalToCloud = async () => {
    if (!isSupabaseConfigured || !supabase || entries.length === 0) return;
    
    if (
      confirm(
        `ต้องการอัปโหลดข้อมูลประวัติจากเว็บเบราว์เซอร์นี้ทั้งหมด (${entries.length} รายการ) ขึ้นไปบันทึกยังระบบคลาวด์ Supabase หรือไม่? เพื่อให้ทุกคนใช้ข้อมูลร่วมกันได้`
      )
    ) {
      setSupabaseLoading(true);
      setSupabaseError(null);
      try {
        // Upload each local entry
        for (const entry of entries) {
          const { error } = await supabase
            .from(tableName)
            .upsert({
              id: entry.id,
              date: entry.date,
              cost: entry.cost,
              category: entry.category || "fuel",
              notes: entry.notes || "",
            });
          if (error) throw error;
        }
        alert("อัปโหลดซิงค์ข้อมูลขึ้น Cloud Supabase สำเร็จเรียบร้อยแล้ว!");
      } catch (err: any) {
        console.error("Sync to cloud failed:", err);
        setSupabaseError(`การซิงก์ข้อมูลขึ้นคลาวด์ขัดข้อง: ${err.message || err}`);
        alert("การซิงข้อมูลขึ้นคลาวด์ขัดข้อง: " + (err.message || ""));
      } finally {
        setSupabaseLoading(false);
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
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Principal body container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Loading and Error Alerts for Supabase Cloud */}
        {supabaseLoading && (
          <div className="mb-6 p-4 bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-2.5 no-print animate-pulse">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            </span>
            <span>กำลังประสานข้อมูลกับคลาวด์ Supabase...</span>
          </div>
        )}

        {supabaseError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex sm:flex-row flex-col justify-between items-start sm:items-center gap-3 no-print shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="p-1 px-2 bg-rose-100 text-rose-700 rounded-md font-bold">⚠️ Cloud Error</span>
              <div>
                <p className="font-semibold">การเชื่อมต่อหรือบันทึกลง Supabase ขัดข้อง</p>
                <p className="mt-1 text-[11px] text-rose-600 font-light font-sans">{supabaseError}</p>
                <p className="mt-1 text-[10px] text-rose-500 font-light">คำแนะนำ: ตรวจสอบปุ่ม SQL Editor ด้านล่างเพื่อทำการคัดลอกคำสั่งไปปิด Row Level Security (RLS) เพื่อให้ระบบส่วนกลางบันทึกข้อมูลสาธารณะร่วมกันได้สำเร็จ</p>
              </div>
            </div>
            <button 
              onClick={() => setSupabaseError(null)}
              className="text-[10px] text-rose-600 hover:text-rose-950 border border-rose-200/50 bg-rose-100/50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition font-semibold shrink-0 cursor-pointer"
            >
              ปิดการแจ้งเตือน
            </button>
          </div>
        )}

        {/* DASHBOARD METRICS */}
        <section className="mb-6 no-print">
          <FuelStatsDashboard metrics={metrics} totalEntries={entries.length} entries={entries} />
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

      {/* Simple Clean Footer */}
      <footer className="mt-16 border-t border-slate-100 bg-slate-50/30 py-8 px-4 no-print text-center text-[11px] text-slate-400">
        <p>© {new Date().getFullYear()} ระบบบันทึกค่าน้ำมันรถยนต์ · บันทึกข้อมูลและรายงานอย่างมีประสิทธิภาพ</p>
      </footer>

    </div>
  );
}
