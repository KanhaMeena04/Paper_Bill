import React from 'react';
import { ArrowLeft, Printer, FileSpreadsheet } from 'lucide-react';

const DayBook = () => {
  // Get current date in DD/MM/YYYY format
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return (
    <div className="p-4 min-h-screen bg-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.go(-1)} 
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Date</span>
            <div className="border rounded px-2 py-1">
              {currentDate}
            </div>
          </div>
          
          <select className="border rounded px-3 py-1 bg-white">
            <option>ALL FIRMS</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50">
            <FileSpreadsheet className="w-4 h-4" />
            Excel Report
          </button>
          <button className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-2 w-64"
        />
      </div>
      
      {/* Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  NAME
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  REF NO.
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  TYPE
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  TOTAL
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  MONEY IN
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  MONEY OUT
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
              <th className="text-left p-3 font-medium">
                <div className="flex items-center gap-1">
                  PRINT / SHA...
                  <span className="text-gray-400">▼</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="text-center py-8 text-gray-500">
                No transactions to show
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Footer Totals */}
      <div className="flex justify-between bottom-4 w-full absolute mt-4 text-sm">
        <div className="text-emerald-500">
          Total Money-In: ₹ 0.00
        </div>
        <div className="text-red-500">
          Total Money-Out: ₹ 0.00
        </div>
        <div className="text-emerald-500 relative right-[292px]">
          Total Money In - Total Money Out: ₹ 0.00
        </div>
      </div>
    </div>
  );
};

export default DayBook;