import React, { useState, useEffect } from "react";
import { FuelEntry } from "../types";
import { Calendar, DollarSign, Plus, X } from "lucide-react";

interface AddExpenseFormProps {
  onAdd: (entry: Omit<FuelEntry, "id"> & { id?: string }) => void;
  editingEntry?: FuelEntry | null;
  onCancelEdit?: () => void;
}

export default function AddExpenseForm({
  onAdd,
  editingEntry,
  onCancelEdit,
}: AddExpenseFormProps) {
  const [date, setDate] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Populate form if editing
  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setCost(editingEntry.cost.toString());
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setCost("");
    }
    setError("");
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!date) {
      setError("กรุณาเลือกวันที่");
      return;
    }
    const costVal = parseFloat(cost);
    if (isNaN(costVal) || costVal <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง (ต้องมากกว่า 0)");
      return;
    }

    onAdd({
      id: editingEntry?.id,
      date,
      cost: costVal,
    });

    // Reset form after successful add if not editing
    if (!editingEntry) {
      setCost("");
    }
  };

  return (
    <div id="add-expense-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 flex items-center gap-2">
          {editingEntry ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              แก้ไขข้อมูลบันทึก
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              บันทึกค่าน้ำมันใหม่
            </>
          )}
        </h3>
        {editingEntry && onCancelEdit && (
          <button
            id="cancel-edit-btn"
            onClick={onCancelEdit}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1"
            title="ยกเลิกการแก้ไข"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center mb-4">
            {error}
          </div>
        )}

        {/* Date Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            วันที่เติมน้ำมัน
          </label>
          <input
            id="input-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 text-slate-800 bg-white transition"
          />
        </div>

        {/* Cost Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-400" />
            จำนวนเงิน (บาท)
          </label>
          <div className="relative">
            <input
              id="input-cost"
              type="number"
              step="any"
              placeholder="เช่น 1200"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 text-slate-800 bg-white transition font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">฿</span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex gap-3 pt-2">
          {editingEntry && (
            <button
              id="cancel-edit-btn-secondary"
              type="button"
              onClick={onCancelEdit}
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-bold text-xs sm:text-sm"
            >
              ยกเลิก
            </button>
          )}
          <button
            id="submit-expense-btn"
            type="submit"
            className={`flex-2 h-11 px-5 rounded-xl font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm w-full ${
              editingEntry
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {editingEntry ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
            {!editingEntry && <Plus className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
