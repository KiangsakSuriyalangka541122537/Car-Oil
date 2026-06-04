import React, { useState } from "react";
import { FuelEntry, PeriodSummary, AverageMetrics } from "../types";
import { formatThaiDate } from "../utils";
import { Printer, FileSpreadsheet, User, Layers, TableProperties, Fuel, Droplet, Wrench } from "lucide-react";
import jsPDF from "jspdf";

interface PDFReportProps {
  entries: FuelEntry[];
  weeklySummaries: PeriodSummary[];
  monthlySummaries: PeriodSummary[];
  yearlySummaries: PeriodSummary[];
  metrics: AverageMetrics;
}

export default function PDFReport({
  entries,
  weeklySummaries,
  monthlySummaries,
  yearlySummaries,
  metrics,
}: PDFReportProps) {
  const [driverName, setDriverName] = useState("สมชาย ยอดประหยัด");

  const calculatedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  // Handle standard browser printing (native PDF vector print tool)
  const handlePrint = () => {
    window.print();
  };

  // Safe client-side JSON/CSV export helper for spreadsheets
  const exportToCSV = () => {
    // CSV columns
    const headers = [
      "ID",
      "วันที่",
      "ประเภทค่าใช้จ่าย",
      "รายละเอียดเพิ่มเติม",
      "จำนวนเงิน (บาท)",
    ];

    const rows = calculatedEntries.map((e) => {
      const categoryLabel = 
        e.category === "engine_oil" 
          ? "ค่าน้ำมันเครื่อง" 
          : e.category === "maintenance" 
          ? "ค่าอะไหล่และซ่อมบำรุง" 
          : "ค่าน้ำมัน";
      // Escape commas in notes to prevent CSV shifting
      const notesEscaped = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "";
      return [
        e.id,
        e.date,
        categoryLabel,
        notesEscaped,
        e.cost,
      ];
    });

    // Add BOM for UTF-8 Excel compatibility (important for Thai script!)
    const CSV_CONTENT =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `รายงานบันทึกค่าใช้จ่ายรถยนต์_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Programmatic jsPDF builder
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark slate accent for header
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 40, "F");

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("VEHICLE FUEL EXPENSE REPORT", 14, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate 300
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.text("System Vehicle Log & Expenditure Efficiency Report", 14, 32);

    // Metadata card on the right
    doc.setFillColor(30, 41, 59); // slate 800
    doc.rect(138, 12, 62, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Recorded Logs: ${entries.length}`, 142, 22);

    // Summary Section Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("CORE STATISTICS & AVERAGES", 14, 52);

    // Stat Cards
    // Card 1: Weekly Average
    doc.setFillColor(248, 250, 252); // slate 50
    doc.rect(14, 58, 56, 26, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("WEEKLY AVERAGE COST", 18, 64);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.text(`${metrics.weeklyAverage.toLocaleString(undefined, { maximumFractionDigits: 1 })} THB`, 18, 73);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Average fuel cost per week", 18, 80);

    // Card 2: Monthly Average
    doc.setFillColor(248, 250, 252);
    doc.rect(77, 58, 56, 26, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("MONTHLY AVERAGE COST", 81, 64);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.text(`${metrics.monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 1 })} THB`, 81, 73);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Average fuel cost per month", 81, 80);

    // Card 3: Yearly Average
    doc.setFillColor(248, 250, 252);
    doc.rect(140, 58, 56, 26, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("YEARLY AVERAGE COST", 144, 64);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.text(`${metrics.yearlyAverage.toLocaleString(undefined, { maximumFractionDigits: 1 })} THB`, 144, 73);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Average fuel cost per year", 144, 80);

    // Detailed Metrics Group
    doc.setFillColor(241, 245, 249); // slate 100
    doc.rect(14, 90, 182, 14, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Cumulative Summary Statement:", 18, 98.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Cost: ${metrics.allTimeTotal.toLocaleString()} THB`, 66, 98.5);
    doc.text(`Refuels Count: ${entries.length} times`, 140, 98.5);

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("FUEL REFUELLING LOGS", 14, 116);

    // Draw Table
    let currentY = 124;
    
    // Draw table headers
    doc.setFillColor(15, 23, 42);
    doc.rect(14, currentY, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Date", 18, currentY + 5.5);
    doc.text("Category", 52, currentY + 5.5);
    doc.text("Description/Notes", 90, currentY + 5.5);
    doc.text("Amount (THB)", 165, currentY + 5.5);

    currentY += 8;

    // Draw rows (up to 15 entries on the first page safely)
    doc.setFont("helvetica", "normal");
    const safeData = calculatedEntries.slice(0, 15);

    safeData.forEach((entry, idx) => {
      // Alternate row backgrounds
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, 182, 7.5, "F");
      }
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      
      doc.text(entry.date, 18, currentY + 5);
      
      // Category representation for universal font support
      const catText = 
        entry.category === "engine_oil" 
          ? "Engine Oil" 
          : entry.category === "maintenance" 
          ? "Maintenance" 
          : "Fuel";
      doc.text(catText, 52, currentY + 5);

      // Description representation for universal font support (replace non-latin or limit length)
      const descLabel = entry.notes || "-";
      // Clean display of latin chars safely
      doc.text(descLabel.length > 35 ? descLabel.substring(0, 35) + "..." : descLabel, 90, currentY + 5);
      
      doc.setFont("helvetica", "bold");
      doc.text(`${entry.cost.toLocaleString()} THB`, 165, currentY + 5);
      doc.setFont("helvetica", "normal");

      currentY += 7.5;
    });

    if (calculatedEntries.length > 15) {
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate 400
      doc.text(`... and ${calculatedEntries.length - 15} more records of transaction histories`, 14, currentY + 6);
    }

    // Save PDF
    doc.save(`รายงานค่าน้ำมัน_สะสม_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div id="pdf-report-tab-container" className="space-y-6">

      {/* --- PRINTABLE WEB TEMPLATE --- */}
      <div id="printable-sheet" className="bg-white rounded-2xl border border-slate-200 max-w-[210mm] mx-auto p-6 md:p-10 shadow-sm print-card relative text-slate-800 font-sans">
        
        {/* Sleek inline control actions inside the template (hidden when printing) */}
        <div className="flex sm:absolute sm:top-5 sm:right-5 items-center justify-end gap-2 mb-6 sm:mb-0 no-print w-full sm:w-auto">
          <button
            id="print-btn-inline"
            onClick={handlePrint}
            type="button"
            className="flex-1 sm:flex-none h-10 sm:h-8 px-3.5 sm:px-3 text-white bg-slate-900 hover:bg-slate-800 rounded-xl sm:rounded-lg shadow-sm transition duration-200 inline-flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer active:scale-[0.98]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน / PDF</span>
          </button>
          
          <button
            id="export-csv-btn-inline"
            onClick={exportToCSV}
            type="button"
            className="flex-1 sm:flex-none h-10 sm:h-8 px-3.5 sm:px-3 text-slate-700 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl sm:rounded-lg shadow-sm transition duration-200 inline-flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 pb-5 mb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">FUEL COST SUMMARY ENGINE REPORT</span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1.5">
              รายงานบันทึกค่าใช้จ่ายน้ำมันรถยนต์
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">ตารางสรุปแบบประมวลผลคำนวณตามคาบเวลาอัตโนมัติ</p>
          </div>

          <div className="w-full sm:w-auto font-mono text-xs text-slate-800 space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-150 min-w-[210px] self-stretch sm:self-auto">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">วันที่จัดทำ:</span>
              <span className="font-semibold">{new Date().toLocaleDateString("th-TH")}</span>
            </div>
          </div>
        </div>

        {/* Core Stat Boxes */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            สรุปค่าเฉลี่ยสถิติสำคัญ
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">ค่าเฉลี่ยรายสัปดาห์</span>
              <div className="text-lg font-bold font-mono text-slate-900">
                {metrics.weeklyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">บาท / สัปดาห์</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">ค่าเฉลี่ยรายเดือน</span>
              <div className="text-lg font-bold font-mono text-slate-900">
                {metrics.monthlyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">บาท / เดือน</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">ค่าเฉลี่ยรายปี</span>
              <div className="text-lg font-bold font-mono text-slate-900">
                {metrics.yearlyAverage.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">บาท / ปี</span>
            </div>

          </div>
        </div>

        {/* Cumulative performance overview */}
        <div className="mb-6 bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">ค่าน้ำมันสะสมทั้งหมด</span>
            <span className="text-sm font-bold font-mono">{metrics.allTimeTotal.toLocaleString()} ฿</span>
          </div>
          <div className="border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">จำนวนครั้งเติมสะสม</span>
            <span className="text-sm font-bold font-mono">{entries.length} ครั้ง</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">เฉลี่ยต่อการเติม</span>
            <span className="text-sm font-bold font-mono text-indigo-400">
              {entries.length > 0 ? `${(metrics.allTimeTotal / entries.length).toFixed(1)} ฿` : "-"}
            </span>
          </div>
        </div>

        {/* Split analytical table display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Progression Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-3 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <TableProperties className="w-4 h-4 text-slate-400" />
                สรุปสถิติมูลค่ารายเดือน
              </span>
            </div>
            
            <table className="w-full text-left text-xs text-slate-700 border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold">
                  <th className="p-3">รอบเดือน</th>
                  <th className="p-3 text-right">ยอดรวม (บาท)</th>
                  <th className="p-3 text-center">จำนวนครั้งเติม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">ยังไม่มีบันทึกรอบเดือน</td>
                  </tr>
                ) : (
                  monthlySummaries.map((sum) => (
                    <tr key={sum.periodKey} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{sum.displayName}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{sum.totalCost.toLocaleString()} ฿</td>
                      <td className="p-3 text-center font-mono">{sum.totalEntries} ครั้ง</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Weekly Progression Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-3 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <TableProperties className="w-4 h-4 text-slate-400" />
                สรุปความถี่ตามรอบสัปดาห์ (ล่าสุด 5 สัปดาห์)
              </span>
            </div>
            
            <table className="w-full text-left text-xs text-slate-700 border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold">
                  <th className="p-3">รอบสัปดาห์</th>
                  <th className="p-3 text-right">ยอดรวม (บาท)</th>
                  <th className="p-3 text-center">จำนวนครั้งเติม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weeklySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">ยังไม่มีบันทึกรอบสัปดาห์</td>
                  </tr>
                ) : (
                  weeklySummaries.slice(0, 5).map((sum) => (
                    <tr key={sum.periodKey} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{sum.displayName}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{sum.totalCost.toLocaleString()} ฿</td>
                      <td className="p-3 text-center font-mono">{sum.totalEntries} ครั้ง</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Detailed Filling-up list */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
          <div className="bg-slate-950 p-3.5 text-xs font-semibold text-white flex items-center justify-between">
            <span>ตารางประวัติบันทึกรายละเอียด (แสดงผลล่าสุด 10 รายการ)</span>
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">RECENT LOGS</span>
          </div>

          <table className="w-full text-left text-xs border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3">วันที่ทำรายการ</th>
                <th className="p-3">ประเภทค่าใช้จ่าย</th>
                <th className="p-3 text-right font-semibold text-slate-800">ยอดเงินสุทธิ (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {calculatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-5 text-center text-slate-400">ไม่มีข้อมูลรายการสำหรับรายงาน</td>
                </tr>
              ) : (
                calculatedEntries.slice(0, 10).map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium whitespace-nowrap">{formatThaiDate(e.date)}</td>
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        {e.category === "engine_oil" ? (
                          <>
                            <Droplet className="w-3.5 h-3.5 text-slate-900" />
                            <span>ค่าน้ำมันเครื่อง</span>
                          </>
                        ) : e.category === "maintenance" ? (
                          <>
                            <Wrench className="w-3.5 h-3.5 text-slate-900" />
                            <span>ค่าอะไหล่ / ซ่อมบำรุง</span>
                          </>
                        ) : (
                          <>
                            <Fuel className="w-3.5 h-3.5 text-slate-900" />
                            <span>ค่าน้ำมัน</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{e.cost.toLocaleString()} ฿</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
