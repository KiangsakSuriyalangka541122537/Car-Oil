import React, { useState } from "react";
import { FuelEntry } from "../types";
import { formatThaiDate } from "../utils";
import { Trash2, Edit3, Search, Calendar, Landmark, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FuelHistoryTableProps {
  entries: FuelEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: FuelEntry) => void;
}

export default function FuelHistoryTable({ entries, onDelete, onEdit }: FuelHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // Confirm Delete Modal States
  const [entryToDelete, setEntryToDelete] = useState<FuelEntry | null>(null);

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  // Filter criteria
  const filteredEntries = sortedEntries.filter((entry) => {
    const formatStr = formatThaiDate(entry.date).toLowerCase();
    const query = searchTerm.toLowerCase();
    return formatStr.includes(query);
  });

  const confirmDelete = () => {
    if (entryToDelete) {
      onDelete(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  return (
    <div id="fuel-history-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Search Bar Section */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            placeholder="ค้นหาตามวันที่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 text-sm text-slate-800 bg-white transition"
          />
        </div>
      </div>

      {/* --- MOBILE VIEW: Clean list --- */}
      <div id="history-mobile-list" className="block md:hidden divide-y divide-slate-100 bg-white">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            ไม่พบข้อมูลประวัติการเติมน้ำมัน
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition duration-150">
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatThaiDate(entry.date)}
                  </div>
                </div>

                {/* Touch Actions */}
                <div className="flex gap-1.5">
                  <button
                    id={`mobile-edit-btn-${entry.id}`}
                    onClick={() => onEdit(entry)}
                    className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-center transition hover:border-slate-400 cursor-pointer"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`mobile-delete-btn-${entry.id}`}
                    onClick={() => setEntryToDelete(entry)}
                    className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-red-650 flex items-center justify-center transition hover:border-red-400 cursor-pointer"
                    title="ลบข้อมูล"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Amount highlights */}
              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">จำนวนเงินที่จ่าย:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {entry.cost.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- DESKTOP VIEW: Rich Table --- */}
      <div id="history-desktop-table" className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold tracking-wider">
              <th className="px-6 py-3.5">วันที่เติมน้ำมัน</th>
              <th className="px-6 py-3.5 text-right">จำนวนเงิน (บาท)</th>
              <th className="px-6 py-3.5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-slate-800 text-sm bg-white">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-xs">
                  ไม่พบข้อมูลรายการเติมน้ำมัน
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition duration-150">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatThaiDate(entry.date)}
                    </div>
                  </td>

                  {/* Total Cost */}
                  <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {entry.cost.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        id={`desktop-edit-btn-${entry.id}`}
                        onClick={() => onEdit(entry)}
                        className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-900 transition cursor-pointer"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`desktop-delete-btn-${entry.id}`}
                        onClick={() => setEntryToDelete(entry)}
                        className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-red-650 transition cursor-pointer"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- EXQUISITE CUSTOM CONFIRM MODAL POPUP --- */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEntryToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-sm bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] p-6 overflow-hidden z-10 text-left font-sans"
            >
              {/* Close Button top corner */}
              <button
                onClick={() => setEntryToDelete(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                {/* Elegant icon header */}
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                {/* Confirm Text titles */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 font-sans tracking-tight">
                    ยืนยันต้องการลบรายการใช่ไหม?
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    ข้อมูลประวัติค่าน้ำมันรายการนี้จะถูกลบออกถาวรอย่างปลอดภัย
                  </p>
                </div>

                {/* Entry Preview Highlight Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2 text-[11px] font-medium text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">วันที่บันทึก:</span>
                    <span className="text-slate-800 font-semibold">{formatThaiDate(entryToDelete.date)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200/50" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400 font-sans">จำนวนเงิน:</span>
                    <div className="text-slate-900 font-bold font-mono text-base">
                      {entryToDelete.cost.toLocaleString("th-TH")}
                      <span className="text-[10px] font-sans font-medium text-slate-400 ml-1">บาท</span>
                    </div>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => setEntryToDelete(null)}
                    className="h-10 border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-slate-600 text-xs font-semibold rounded-xl flex items-center justify-center transition duration-150 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="h-10 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold rounded-xl flex items-center justify-center shadow-sm shadow-slate-900/10 transition duration-150 cursor-pointer"
                  >
                    ยืนยันการลบ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
