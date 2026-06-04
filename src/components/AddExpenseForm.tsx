import React, { useState, useEffect } from "react";
import { FuelEntry } from "../types";
import { Calendar, DollarSign, Plus, X, Tag, Fuel, Droplet, Wrench } from "lucide-react";

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
  const [category, setCategory] = useState<"fuel" | "engine_oil" | "maintenance">("fuel");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  // Populate form if editing or initialize defaults
  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setCost(editingEntry.cost.toString());
      setCategory(editingEntry.category || "fuel");
      setNotes(editingEntry.notes || "");
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setCost("");
      setCategory("fuel");
      setNotes("");
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
      category,
      notes: category === "maintenance" ? notes.trim() : "",
    });

    // Reset form after successful add if not editing
    if (!editingEntry) {
      setCost("");
      setCategory("fuel");
      setNotes("");
    }
  };

  // Reusable classes for uniform styling and typography
  const inputClass = "w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 text-slate-800 bg-white transition duration-200 text-sm font-medium";
  const costInputClass = "w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 text-slate-800 bg-white transition duration-200 text-sm font-medium";

  // Dynamic icon based on selected category for a beautiful monochrome representation
  const getCategoryIcon = () => {
    switch (category) {
      case "fuel":
        return <Fuel className="w-4 h-4 text-slate-900" />;
      case "engine_oil":
        return <Droplet className="w-4 h-4 text-slate-900" />;
      case "maintenance":
        return <Wrench className="w-4 h-4 text-slate-900" />;
      default:
        return <Tag className="w-4 h-4 text-slate-900" />;
    }
  };

  return (
    <div id="add-expense-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          {editingEntry ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              แก้ไขข้อมูลบันทึกค่าใช้จ่าย
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              บันทึกค่าใช้จ่ายรถยนต์ใหม่
            </>
          )}
        </h3>
        {editingEntry && onCancelEdit && (
          <button
            id="cancel-edit-btn"
            type="button"
            onClick={onCancelEdit}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>ยกเลิก</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center mb-4">
            {error}
          </div>
        )}

        {/* Category Field */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            {getCategoryIcon()}
            ประเภทค่าใช้จ่าย
          </label>
          
          <button
            id="category-select-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 bg-white transition duration-200 text-sm font-medium flex items-center justify-between text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {category === "fuel" && (
                <>
                  <Fuel className="w-4.5 h-4.5 text-slate-900" />
                  <span>ค่าน้ำมัน</span>
                </>
              )}
              {category === "engine_oil" && (
                <>
                  <Droplet className="w-4.5 h-4.5 text-slate-900" />
                  <span>ค่าน้ำมันเครื่อง</span>
                </>
              )}
              {category === "maintenance" && (
                <>
                  <Wrench className="w-4.5 h-4.5 text-slate-900" />
                  <span>ค่าอะไหล่ / ซ่อมบำรุง</span>
                </>
              )}
            </div>
            <div className={`transition-transform duration-200 text-slate-500 text-[10px] ${isOpen ? "rotate-180" : ""}`}>
              ▼
            </div>
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCategory("fuel");
                  setNotes("");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition duration-155 text-left cursor-pointer ${
                  category === "fuel" ? "bg-slate-100/70 text-slate-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Fuel className="w-4.5 h-4.5 text-slate-900" />
                <span>ค่าน้ำมัน (Fuel)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("engine_oil");
                  setNotes("");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition duration-155 text-left cursor-pointer ${
                  category === "engine_oil" ? "bg-slate-100/70 text-slate-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Droplet className="w-4.5 h-4.5 text-slate-900" />
                <span>ค่าน้ำมันเครื่อง (Engine Oil)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("maintenance");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition duration-155 text-left cursor-pointer ${
                  category === "maintenance" ? "bg-slate-100/70 text-slate-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Wrench className="w-4.5 h-4.5 text-slate-900" />
                <span>ค่าอะไหล่ / ซ่อมบำรุง (Maintenance)</span>
              </button>
            </div>
          )}
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            วันที่ทำรายการ
          </label>
          <input
            id="input-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Cost Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
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
              className={costInputClass}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold select-none">฿</span>
          </div>
        </div>

        {/* Notes Field */}
        {category === "maintenance" && (
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <span>💬</span>
              รายละเอียดเพิ่มเติม (ระบุ ยี่ห้อ/รุ่น อุปกรณ์)
            </label>
            <input
              id="input-notes"
              type="text"
              placeholder="เช่น เปลี่ยนยางรถ 4 เส้น, เปลี่ยนใบปัดน้ำฝน Bosch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Actions Grid */}
        <div className="flex gap-3 pt-2">
          {editingEntry && (
            <button
              id="cancel-edit-btn-secondary"
              type="button"
              onClick={onCancelEdit}
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-bold text-sm"
            >
              ยกเลิก
            </button>
          )}
          <button
            id="submit-expense-btn"
            type="submit"
            className={`flex-2 h-11 px-5 rounded-xl font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full ${
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
