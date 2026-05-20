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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-left font-sans"
            >
              {/* Close Button top corner */}
              <button
                onClick={() => setEntryToDelete(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                {/* Warning Red Icon with glow */}
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-650 flex items-center justify-center border border-red-100 shadow-sm animate-pulse-subtle">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                {/* Confirm Text titles */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                    ยืนยันต้องการลบรายการนี้ใช่หรือไม่?
                  </h3>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    คุณกำลังจะลบรายการค่าน้ำมันคันนี้อย่างถาวรและจะไม่สามารถย้อนกลับคืนการกระทำนี้ได้
                  </p>
                </div>

                {/* Entry Preview Highlight Card */}
                <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400 font-sans">วันที่บันทึก:</span>
                    <span className="text-slate-800 font-semibold">{formatThaiDate(entryToDelete.date)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200/60 my-0.5" />
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400 font-sans">จำนวนเงินที่ลบ:</span>
                    <span className="text-red-650 font-bold font-mono text-sm">
                      {entryToDelete.cost.toLocaleString("th-TH")} บาท
                    </span>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full pt-1.5">
                  <button
                    onClick={() => setEntryToDelete(null)}
                    className="h-11 border border-slate-250 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center transition duration-150 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="h-11 bg-red-650 hover:bg-red-700 active:scale-98 text-white text-xs font-semibold rounded-xl flex items-center justify-center shadow-md shadow-red-200 transition duration-150 cursor-pointer"
                  >
                    ยืนยันลบข้อมูล
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
