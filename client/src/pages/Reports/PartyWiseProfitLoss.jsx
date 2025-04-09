import React, { useEffect, useState } from "react";
import { ArrowLeft, FileSpreadsheet, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getParties, partyStatement } from "../../Redux/partySlice";
import { getItems } from "../../Redux/itemSlice";

const PartyWiseProfitLoss = () => {
  const currentDate = new Date();
  const firstDay = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-01`;
  const lastDay = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  ).padStart(2, "0")}`;

  const dispatch = useDispatch();
  const { parties, partyBills } = useSelector((state) => state.party);
  const { items } = useSelector((state) => state.item);

  const [selectedParty, setSelectedParty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [calculatedData, setCalculatedData] = useState([]);
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  useEffect(() => {
    dispatch(getParties());
    dispatch(getItems());
  }, [dispatch]);

  useEffect(() => {
    dispatch(partyStatement({ selectedParty, isProfitLoss: true }));
  }, [selectedParty, dispatch]);

  useEffect(() => {
    calculateProfitLoss();
  }, [partyBills, items, parties, searchTerm, startDate, endDate, selectedParty]);

  const calculateProfitLoss = () => {
    const partyProfitData = {};

    // Initialize data for all parties
    parties.forEach((party) => {
      partyProfitData[party.partyId] = {
        partyName: party.partyName,
        phoneNo: party.phone || "—",
        totalSale: 0,
        profitLoss: 0,
      };
    });

    // Process bills for profit/loss calculation
    partyBills
      .filter((bill) => {
        // Filter by date range
        const billDate = new Date(bill.date); // Ensure your bill object has a `date` field
        return (
          billDate >= new Date(startDate) && billDate <= new Date(endDate)
        );
      })
      .forEach((bill) => {
        if (bill.billType === "addsales") {
          const partyId = bill.form.partyId;

          // Skip if party doesn't exist in our initialized data
          if (!partyProfitData[partyId]) return;

          // Add to total sale
          partyProfitData[partyId].totalSale += Number(bill.total || 0);

          // Calculate profit/loss for each item in the bill
          bill.items.forEach((billItem) => {
            const itemDetails = items.find(
              (item) => item.itemCode == billItem.itemId
            );
            if (itemDetails) {
              const itemCost = Number(itemDetails.atPrice || 0);
              const itemSalePrice = Number(billItem.price || 0);
              const quantity = Number(billItem.quantity.primary || 1);
              const profitPerItem = (itemSalePrice - itemCost) * quantity;
              partyProfitData[partyId].profitLoss += profitPerItem;
            }
          });
        }
      });

    // Convert to array and filter based on selection and search term
    const resultArray = Object.values(partyProfitData)
      .filter((party) =>
        selectedParty
          ? party.partyName ===
            parties.find((p) => p.partyId === selectedParty)?.partyName
          : true
      )
      .filter((party) =>
        searchTerm
          ? party.partyName.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );

    setCalculatedData(resultArray);
  };

  const handlePartyChange = (e) => {
    setSelectedParty(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getTotalSaleAmount = () =>
    calculatedData.reduce((sum, party) => sum + party.totalSale, 0);

  const getTotalProfitLoss = () =>
    calculatedData.reduce((sum, party) => sum + party.profitLoss, 0);

  return (
    <div className="p-2 bg-gray-100 min-h-screen">
      <button
        onClick={() => window.history.back()}
        className="flex items-center mb-4 text-gray-600 hover:text-gray-800 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow p-6 h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-200 rounded-md p-2">
              <span className="text-gray-600 text-sm">Between</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 text-sm"
              />
              <span className="text-gray-600 text-sm">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
              <FileSpreadsheet className="w-5 h-5 mr-1" />
              Excel Report
            </button>
            <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
              <Printer className="w-5 h-5 mr-1" />
              Print
            </button>
          </div>
        </div>

        <div className="mb-6">
          <select
            className="w-48 block appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 text-sm"
            value={selectedParty}
            onChange={handlePartyChange}
          >
            <option value="">All Parties</option>
            {parties.map((party) => (
              <option key={party.partyId} value={party.partyId}>
                {party.partyName} - {party.openingBalance} (
                {party.balanceType === "to-receive" ? "↑" : "↓"})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64 border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-gray-600 text-sm">#</th>
                <th className="text-left p-3 text-gray-600 text-sm">
                  PARTY NAME
                </th>
                <th className="text-left p-3 text-gray-600 text-sm">
                  PHONE NO.
                </th>
                <th className="text-left p-3 text-gray-600 text-sm">
                  TOTAL SALE AMOUNT
                </th>
                <th className="text-left p-3 text-gray-600 text-sm">
                  PROFIT (+) / LOSS (-)
                </th>
              </tr>
            </thead>
            <tbody>
              {calculatedData.map((party, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 text-sm">{index + 1}</td>
                  <td className="p-3 text-sm">{party.partyName}</td>
                  <td className="p-3 text-sm">{party.phoneNo}</td>
                  <td className="p-3 text-sm">₹{party.totalSale.toFixed(2)}</td>
                  <td className="p-3 text-sm">
                    ₹{party.profitLoss.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-6 text-sm">
          <div>Total Sale Amount: ₹{getTotalSaleAmount().toFixed(2)}</div>
          <div>
            Total Profit(+) / Loss (-): ₹{getTotalProfitLoss().toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyWiseProfitLoss;
