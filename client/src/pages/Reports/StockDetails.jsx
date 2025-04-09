import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getItems } from "../../Redux/itemSlice";
import { getBills } from "../../Redux/billSlice";

const StockDetails = () => {
  const [dateRange, setDateRange] = useState({
    from: "2025-01-01",
    to: "2025-01-21",
  });
  const [processedItems, setProcessedItems] = useState([]);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);

  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.item);
  const { bills } = useSelector((state) => state.bill);

  useEffect(() => {
    dispatch(getItems());
    dispatch(getBills());
  }, [dispatch]);

  

  useEffect(() => {
    const filteredItems = () => {
      const itemStates = items.map((item) => {
        let quantityIn = 0;
        let purchaseAmount = 0;
        let quantityOut = 0;
        let saleAmount = 0;
        let sold = 0;
        let closingQuantity = 0;
        let openingStocks = 0;

        bills?.forEach((bill) => {
          bill?.items?.forEach((billItem) => {
            if (billItem.itemId === item.itemCode) {
              if (bill.billType === "addsales") {
                if (saleAmount !== bill.total) {
                  saleAmount += Number(bill.total) || 0;
                }
                openingStocks += item.openingQuantity * item.atPrice;
                sold += 1;
              } else if (bill.billType === "addpurchase") {
                if (purchaseAmount !== bill.total) {
                  purchaseAmount += Number(bill.total) || 0;
                }
              }
            }
          });
        });

        quantityIn = item.openingQuantity;
        closingQuantity = item.openingQuantity - sold;
        quantityOut = sold;

        return {
          itemName: item.itemName,
          beginningQuantity: 0, // Added to match table structure
          quantityIn: quantityIn,
          purchaseAmount: purchaseAmount,
          quantityOut: quantityOut,
          saleAmount: saleAmount,
          closingQuantity: closingQuantity,
        };
      });

      // Calculate total profit/loss
      const total = itemStates.reduce(
        (acc, item) => acc + (item.saleAmount - item.purchaseAmount),
        0
      );

      console.log(itemStates, "These are the items")
      setTotalProfitLoss(total);
      setProcessedItems(itemStates);
    };

    if (items.length > 0) {
      filteredItems();
    }
  }, [items, bills]);

  // Calculate totals from processed items
  const totals = processedItems.reduce(
    (acc, item) => ({
      beginningQuantity: acc.beginningQuantity + item.beginningQuantity,
      quantityIn: acc.quantityIn + item.quantityIn,
      purchaseAmount: acc.purchaseAmount + item.purchaseAmount,
      quantityOut: acc.quantityOut + item.quantityOut,
      saleAmount: acc.saleAmount + item.saleAmount,
      closingQuantity: acc.closingQuantity + item.closingQuantity,
    }),
    {
      beginningQuantity: 0,
      quantityIn: 0,
      purchaseAmount: 0,
      quantityOut: 0,
      saleAmount: 0,
      closingQuantity: 0,
    }
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">From</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-600">To</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>All Categories</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex items-center text-blue-600 hover:text-blue-700">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button className="flex items-center text-gray-600 hover:text-gray-700">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-4">DETAILS</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 text-sm font-medium text-gray-600">
                Item Name
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Beginning Quantity
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Quantity In
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Purchase Amount
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Quantity Out
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Sale Amount
              </th>
              <th className="text-right p-2 text-sm font-medium text-gray-600">
                Closing Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-2 text-sm text-blue-600">{item.itemName}</td>
                <td className="p-2 text-sm text-right">
                  {item.beginningQuantity}
                </td>
                <td className="p-2 text-sm text-right">{item.quantityIn}</td>
                <td className="p-2 text-sm text-right">
                  ₹ {item.purchaseAmount.toFixed(2)}
                </td>
                <td className="p-2 text-sm text-right">{item.quantityOut}</td>
                <td className="p-2 text-sm text-right">
                  ₹ {item.saleAmount.toFixed(2)}
                </td>
                <td className="p-2 text-sm text-right">
                  {item.closingQuantity}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-medium">
              <td className="p-2 text-sm">Total</td>
              <td className="p-2 text-sm text-right">
                {totals.beginningQuantity}
              </td>
              <td className="p-2 text-sm text-right">{totals.quantityIn}</td>
              <td className="p-2 text-sm text-right">
                ₹ {totals.purchaseAmount.toFixed(2)}
              </td>
              <td className="p-2 text-sm text-right">{totals.quantityOut}</td>
              <td className="p-2 text-sm text-right">
                ₹ {totals.saleAmount.toFixed(2)}
              </td>
              <td className="p-2 text-sm text-right">
                {totals.closingQuantity}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockDetails;