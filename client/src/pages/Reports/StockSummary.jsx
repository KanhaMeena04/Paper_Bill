import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCategory, getItems } from "../../Redux/itemSlice";

const StockSummary = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState("2025-01-20");
  const [showInStock, setShowInStock] = useState(false);
  const [allFilteredItems, setAllFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { categories, items } = useSelector((state) => state.item);
  const [totals, setTotals] = useState({ stockQtyPrimary: 0, stockQtySecondary: 0, stockValue: 0 });

  useEffect(() => {
    const calculatedTotals = allFilteredItems.reduce(
      (acc, item) => ({
        stockQtyPrimary: acc.stockQtyPrimary + (item.openingPrimaryQuantity || 0),
        stockQtySecondary: acc.stockQtySecondary + (item.openingSecondaryQuantity || 0),
        stockValue: acc.stockValue + (Number(item.purchasePrice || 0) * Number(item.openingPrimaryQuantity || 0)),
      }),
      { stockQtyPrimary: 0, stockQtySecondary: 0, stockValue: 0 }
    );

    setTotals(calculatedTotals);
  }, [allFilteredItems]);

  useEffect(() => {
    dispatch(getCategory());
    dispatch(getItems());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      const filteredItems = items.filter((item) =>
        item.categories.includes(selectedCategory)
      );
      setAllFilteredItems(filteredItems);
    } else {
      setAllFilteredItems(items);
    }
  }, [selectedCategory, items]);

  // Helper function to format currency values
  const formatCurrency = (value) => {
    const number = Number(value);
    return isNaN(number) || number === 0 ? "₹ 0.00" : `₹ ${number.toFixed(2)}`;
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg h-[88vh]">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">FILTERS</span>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInStock}
              onChange={(e) => setShowInStock(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show Items in stock</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex items-center text-blue-600 hover:text-blue-700">
            <FileSpreadsheet className="w-5 h-5 mr-1" />
            <span className="text-sm">Excel</span>
          </button>
          <button className="flex items-center text-gray-600 hover:text-gray-700">
            <Printer className="w-5 h-5 mr-1" />
            <span className="text-sm">Print</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold mb-4">STOCK SUMMARY</h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-medium text-gray-700">#</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Item Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Sale Price</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Purchase Price</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700" colSpan="2">Stock Qty</th>
              <th className="p-3 text-right text-sm font-medium text-gray-700">Stock Value</th>
            </tr>
            <tr className="bg-gray-50">
              <th colSpan="4"></th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Primary</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Secondary</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allFilteredItems.map((item, index) => {
              const stockValue = Number(item.purchasePrice || 0) * Number(item.openingPrimaryQuantity || 0);
              return (
                <tr key={item.itemHSN} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="p-3 text-sm text-gray-800">{item.itemName}</td>
                  <td className="p-3 text-sm text-gray-700">{formatCurrency(item.salePrice)}</td>
                  <td className="p-3 text-sm text-gray-700">{formatCurrency(item.purchasePrice)}</td>
                  <td className="p-3 text-center text-sm text-green-600">{item.openingPrimaryQuantity || 0}</td>
                  <td className="p-3 text-center text-sm text-blue-600">{item.openingSecondaryQuantity || 0}</td>
                  <td className="p-3 text-sm text-gray-700 text-right">{formatCurrency(stockValue)}</td>
                </tr>
              );
            })}
            <tr className="border-t font-semibold bg-gray-50">
              <td colSpan="4" className="p-3 text-sm">Total</td>
              <td className="p-3 text-center text-sm text-green-600">{totals.stockQtyPrimary}</td>
              <td className="p-3 text-center text-sm text-blue-600">{totals.stockQtySecondary}</td>
              <td className="p-3 text-sm text-right">{formatCurrency(totals.stockValue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockSummary;