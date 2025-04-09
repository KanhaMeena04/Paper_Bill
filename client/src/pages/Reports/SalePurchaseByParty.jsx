import React, { useEffect, useState } from "react";
import { ArrowLeft, FileSpreadsheet, Printer, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getBills } from "../../Redux/billSlice";
import { getParties } from "../../Redux/partySlice";

const SalePurchaseByParty = () => {
  const dispatch = useDispatch();
  const { parties } = useSelector((state) => state.party);
  const { bills } = useSelector((state) => state.bill);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
  });
  const [selectedFirm, setSelectedFirm] = useState("All Firms");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  useEffect(() => {
    dispatch(getParties());
    dispatch(getBills());
  }, [dispatch]);

  useEffect(() => {
    processPartyData();
  }, [bills, parties, searchQuery, dateRange, selectedFirm]);

  const processPartyData = () => {
    if (!bills || !parties) return;

    // Create a map to store aggregated data for each party
    const partyDataMap = new Map();
    bills.forEach((bill) => {
      const party = parties.find((p) => p.partyId === bill.form.partyId);
      if (!party) return;

      const isSale = bill.billType === "addsales";
      const isPurchase = bill.billType === "addpurchase";
      const partyData = partyDataMap.get(party.id) || {
        id: party.partyId,
        partyName: party.partyName,
        saleAmount: 0,
        purchaseAmount: 0,
      };

      if (isSale) {
        partyData.saleAmount += Number(bill.total || 0);
      } else if (isPurchase) {
        partyData.purchaseAmount += Number(bill.total || 0);
      }

      partyDataMap.set(party.id, partyData);
    });

    // Convert map to array and apply search filter
    let processedData = Array.from(partyDataMap.values());

    if (searchQuery) {
      processedData = processedData.filter((data) =>
        data.partyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply firm filter if needed
    if (selectedFirm !== "All Firms") {
      processedData = processedData.filter((data) => data.firm === selectedFirm);
    }

    setFilteredData(processedData);
  };

  // Calculate totals
  const totals = filteredData.reduce(
    (acc, curr) => ({
      saleAmount: acc.saleAmount + curr.saleAmount,
      purchaseAmount: acc.purchaseAmount + curr.purchaseAmount,
    }),
    {
      saleAmount: 0,
      purchaseAmount: 0,
    }
  );

  const handleDateChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Implement period logic here (This Month, Last Month, etc.)
    // Update dateRange accordingly
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center mb-4 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Custom</option>
              </select>

              <div className="flex items-center bg-gray-100 rounded-md px-2 py-1 gap-2 text-sm">
                <span className="text-gray-600">Between</span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange("startDate", e.target.value)}
                  className="border rounded-md px-2 py-1"
                />
                <span className="text-gray-600">To</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className="border rounded-md px-2 py-1"
                />
              </div>

              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={selectedFirm}
                onChange={(e) => setSelectedFirm(e.target.value)}
              >
                <option>All Firms</option>
                {/* Add firm options here */}
              </select>
            </div>

            <div className="flex gap-4">
              <button className="flex items-center text-blue-600 hover:text-blue-700">
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel Report
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-700">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <input
            type="search"
            placeholder="Search..."
            className="border rounded-md px-3 py-2 w-64 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y">
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  #
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  PARTY NAME
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  SALE AMOUNT
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  PURCHASE AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((data, index) => (
                  <tr
                    key={data.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="p-4 text-sm">{index + 1}</td>
                    <td className="p-4 text-sm">{data.partyName}</td>
                    <td className="p-4 text-sm text-right">
                      ₹ {data.saleAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-right">
                      ₹ {data.purchaseAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="w-16 h-16 text-gray-300" />
                      <div className="text-gray-500">
                        <p>No data is available for Sale Purchase Report.</p>
                        <p>Please try again after making relevant changes.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan="2" className="p-4 text-sm font-semibold text-right">
                  Total:
                </td>
                <td className="p-4 text-sm text-right font-semibold">
                  ₹ {totals.saleAmount.toFixed(2)}
                </td>
                <td className="p-4 text-sm text-right font-semibold">
                  ₹ {totals.purchaseAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalePurchaseByParty;