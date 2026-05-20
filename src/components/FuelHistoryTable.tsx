import React, { useState } from "react";
import { FuelEntry } from "../types";
import { formatThaiDate } from "../utils";
import { Trash2, Edit3, Search, Calendar, Landmark } from "lucide-react";

interface FuelHistoryTableProps {
  entries: FuelEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: FuelEntry) => void;
}

export default function FuelHistoryTable({ entries, onDelete, onEdit }: FuelHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  // Filter criteria
  const filteredEntries = sortedEntries.filter((entry) => {
    const formatStr = formatThaiDate(entry.date).toLowerCase();
    const query = searchTerm.toLowerCase();
    return formatStr.includes(query);
  });

  return (
    <div id="fuel-history-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Search Bar Section */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="relative">
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
                    className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-center transition hover:border-slate-400"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`mobile-delete-btn-${entry.id}`}
                    onClick={() => {
                      if (confirm("ต้องการลบรายการของวันที่ " + formatThaiDate(entry.date) + " หรือไม่?")) {
                        onDelete(entry.id);
                      }
                    }}
                    className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-red-650 flex items-center justify-center transition hover:border-red-400"
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
                        className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-900 transition"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`desktop-delete-btn-${entry.id}`}
                        onClick={() => {
                          if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
                            onDelete(entry.id);
                          }
                        }}
                        className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-red-650 transition"
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

    </div>
  );
}
