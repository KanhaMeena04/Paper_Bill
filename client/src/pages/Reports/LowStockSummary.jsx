import React, { useEffect, useState } from "react";
import { RefreshCw, Printer, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getItems } from "../../Redux/itemSlice";

const LowStockSummary = () => {
  const [showInStock, setShowInStock] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const { items } = useSelector((state) => state.item);
  const [filteredItems, setFilteredItems] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getItems());
  }, [dispatch]);

  useEffect(() => {
    setFilteredItems(() => {
      return items.filter((item) => {
        return item.openingPrimaryQuantity < item.minStockToMaintain;
      });
    });
  }, [dispatch, items]);

  useEffect(() => {
    setFilteredItems(() => {
      return items.filter((item) => {
        return (
          item.categories.includes(selectedCategory) ||
          selectedCategory === "All Categories"
        );
      });
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (showInStock) {
      setFilteredItems(items.filter((item) => item.openingPrimaryQuantity > 0));
    } else {
      setFilteredItems(items);
    }
  }, [showInStock]);
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">FILTERS</span>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-[180px] px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="py-1">
                    {[
                      ...new Set(
                        filteredItems.flatMap((item) => item.categories || [])
                      ),
                    ].map((category) => (
                      <button
                        key={category}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-stock"
              checked={showInStock}
              onChange={(e) => setShowInStock(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="show-stock"
              className="text-sm font-medium text-gray-700"
            >
              Show items in stock
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-[50px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minimum Stock Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems?.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.itemCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.minStockToMaintain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.openingPrimaryQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ₹{" "}
                    {(
                      item.openingPrimaryQuantity * item.minStockToMaintain
                    ).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No Items Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockSummary;
