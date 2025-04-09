import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Send,
  MessageSquare,
} from "lucide-react";
import InvoicePreview from "./PrintSettings/InvoicePreview.jsx";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const InvoicePage = ({ invoiceData, setInvoiceData, isEditable }) => {
  const navigate = useNavigate();
  const [isClassicThemesOpen, setClassicThemesOpen] = useState(true);
  const [isVintageThemesOpen, setVintageThemesOpen] = useState(false);

  return (
    <div className="h-[99vh] bg-gray-100 overflow-hidden">
      <div className="h-full max-w-screen-2xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white p-4 mb-4 flex justify-between items-center relative">
          <h1 className="text-lg font-semibold">Preview</h1>
          <div className="flex items-center gap-2">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">
              Do not show invoice preview again
            </span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Save & Close
            </button>
          </div>

          {/* Cross Icon for Navigation */}
          <button
            className="absolute right-4 top-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={() => navigate(-2)}
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex gap-4 h-[calc(99vh-120px)]">
          {/* Left Sidebar */}
          <div className="w-64 bg-white shadow overflow-y-auto">
            <div className="p-4 border-b">
              <h2
                className="font-semibold cursor-pointer"
                onClick={() =>
                  navigate("/customize-theme", {
                    state: { invoiceData: invoiceData, isEditable: isEditable, setInvoiceData: setInvoiceData },
                  })
                }
              >
                Customize Theme
              </h2>
            </div>

            <div className="p-4 border-b">
              <h2 className="font-semibold">Select Theme</h2>
            </div>

            {/* Classic Themes Section */}
            <div>
              <button
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                onClick={() => setClassicThemesOpen(!isClassicThemesOpen)}
              >
                <span>Classic Themes</span>
                {isClassicThemesOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {isClassicThemesOpen && (
                <div className="border-t">
                  <button className="w-full p-3 text-left bg-blue-50 border-l-4 border-blue-500">
                    Tally Theme
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    GST Theme 1
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    GST Theme 3
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    Double Divine
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    French Elite
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    Landscape Theme 1
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    Landscape Theme 2
                  </button>
                </div>
              )}
            </div>

            {/* Vintage Themes Section */}
            <div>
              <button
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                onClick={() => setVintageThemesOpen(!isVintageThemesOpen)}
              >
                <span>Vintage Themes</span>
                {isVintageThemesOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {isVintageThemesOpen && (
                <div className="border-t">
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    Vintage Theme 1
                  </button>
                  <button className="w-full p-3 text-left hover:bg-gray-50">
                    Vintage Theme 2
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-yellow-400">⚡</span>
                Use this theme for a clean and professional look
              </div>
            </div>
          </div>

          {/* Center Preview */}
          <div className="flex-1 bg-white shadow p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tax Invoice</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto">
              <InvoicePreview invoiceData={invoiceData} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 overflow-y-auto">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Share Invoice</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-xs">Whatsapp</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-xs">Email</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-xs">Message</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-xs">Download PDF</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <Printer className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-xs text-center">
                    Print Invoice (Thermal)
                  </span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <Printer className="w-6 h-6 text-gray-500" />
                  </div>
                  <span className="text-xs text-center">
                    Print Invoice (Normal)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
