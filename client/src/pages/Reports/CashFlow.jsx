import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPayments } from "../../Redux/paymentSlice";
import { format } from "date-fns";

const CashFlow = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allPayments, isLoading } = useSelector((state) => state.payment);

  // State for filters and controls
  const [dateRange, setDateRange] = useState({
    type: "this-month",
    start: "2025-01-01",
    end: "2025-01-31",
  });
  const [selectedFirm, setSelectedFirm] = useState("ALL FIRMS");
  const [showZeroTransactions, setShowZeroTransactions] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllPayments());
  }, [dispatch]);

  // Filter and sort logic
  const getFilteredAndSortedTransactions = () => {
    let filtered = [...(allPayments || [])];

    // Date range filter
    filtered = filtered.filter((payment) => {
      const paymentDate = new Date(payment.date);
      return (
        paymentDate >= new Date(dateRange.start) &&
        paymentDate <= new Date(dateRange.end)
      );
    });

    // Firm filter
    if (selectedFirm !== "ALL FIRMS") {
      filtered = filtered.filter((payment) => payment.firm === selectedFirm);
    }

    // Zero amount filter
    if (!showZeroTransactions) {
      filtered = filtered.filter(
        (payment) =>
          (payment.type === "payment-in" ? payment.received : payment.paid) > 0
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const filteredTransactions = getFilteredAndSortedTransactions();
    return filteredTransactions.reduce(
      (acc, payment) => {
        if (payment.type === "payment-in") {
          acc.cashIn += parseFloat(payment.received) || 0;
        } else {
          acc.cashOut += parseFloat(payment.paid) || 0;
        }
        return acc;
      },
      { cashIn: 0, cashOut: 0 }
    );
  };

  const getRunningTotal = (index) => {
    const transactions = getFilteredAndSortedTransactions();
    return transactions.slice(0, index + 1).reduce((total, payment) => {
      if (payment.type === "payment-in") {
        return total + (parseFloat(payment.received) || 0);
      } else {
        return total - (parseFloat(payment.paid) || 0);
      }
    }, 0);
  };

  const totals = calculateTotals();
  const filteredTransactions = getFilteredAndSortedTransactions();

  const columns = [
    { key: "date", label: "DATE" },
    { key: "receiptNo", label: "REF NO." },
    { key: "partyName", label: "NAME" },
    { key: "type", label: "TYPE" },
    { key: "cashIn", label: "CASH IN" },
    { key: "cashOut", label: "CASH OUT" },
    { key: "running", label: "RUNNING" },
    { key: "print", label: "PRINT" },
  ];

  const handleDateRangeChange = (type) => {
    const today = new Date();
    let start, end;

    switch (type) {
      case "this-month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "last-month":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    setDateRange({
      type,
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="px-4 py-2 border rounded-md flex items-center gap-2 bg-gray-100"
              onClick={() => handleDateRangeChange("this-month")}
            >
              {dateRange.type === "this-month"
                ? "This Month"
                : dateRange.type === "last-month"
                ? "Last Month"
                : "Custom"}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <span className="text-gray-500">Between</span>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="border rounded-md px-3 py-2 w-40"
          />

          <span className="text-gray-500">To</span>

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="border rounded-md px-3 py-2 w-40"
          />
        </div>

        <select
          className="border rounded-md px-3 py-2"
          value={selectedFirm}
          onChange={(e) => setSelectedFirm(e.target.value)}
        >
          <option>ALL FIRMS</option>
          {/* Add other firms if available */}
        </select>

        <div className="ml-auto flex gap-2">
          <button className="p-2 border rounded-md hover:bg-gray-50">
            <FileSpreadsheet className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 border rounded-md hover:bg-gray-50">
            <Printer className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Opening Balance */}
      <div className="mb-4 flex items-center gap-4">
        <div className="text-emerald-500">Opening Cash-in Hand: ₹ 0.00</div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={showZeroTransactions}
            onChange={(e) => setShowZeroTransactions(e.target.checked)}
          />
          Show zero amount transaction
        </label>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b cursor-pointer"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <tr key={transaction._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.receiptNo || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{transaction.partyName}</td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {transaction.type.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.type === "payment-in" &&
                      `₹ ${parseFloat(transaction.received).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {transaction.type === "payment-out" &&
                      `₹ ${parseFloat(transaction.paid).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {`₹ ${parseFloat(transaction.total).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No transactions to show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-between text-sm">
        <div className="text-emerald-500">
          Total Cash-in: ₹ {totals.cashIn.toFixed(2)}
        </div>
        <div className="text-red-500">
          Total Cash-out: ₹ {totals.cashOut.toFixed(2)}
        </div>
        <div className="text-emerald-500">
          Closing Cash-in Hand: ₹
          {allPayments.length > 0
            ? allPayments[allPayments.length - 1].total.toFixed(2)
            : "0.00"}
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
