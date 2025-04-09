import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getItems } from "../../Redux/itemSlice";

const StockSummaryByItemCategory = () => {
  const { items } = useSelector((state) => state.item);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getItems());
  }, [dispatch]);

  // Calculate summary by category
  const categorySummary = items.reduce((acc, item) => {
    item.categories.forEach((category) => {
      if (!acc[category]) {
        acc[category] = {
          stockQuantity: 0,
          stockValue: 0,
        };
      }
      acc[category].stockQuantity += item.openingQuantity || 0;
      acc[category].stockValue += item.atPrice || 0;
    });
    return acc;
  }, {});

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-800 font-medium">
          STOCK SUMMARY BY ITEM CATEGORY
        </h2>
        <div className="flex gap-2">
          <button className="text-teal-500 p-2 hover:bg-teal-50 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.707 10.293a1 1 0 100 1.414l3 3a1 1 0 001.414-1.414L11.414 12H15a1 1 0 100-2h-3.586l.793-.793a1 1 0 00-1.414-1.414l-3 3z" />
            </svg>
          </button>
          <button className="text-teal-500 p-2 hover:bg-teal-50 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 border-b pb-2">
        <div className="text-gray-600">Item Category</div>
        <div className="text-right text-gray-600">Stock Quantity</div>
        <div className="text-right text-gray-600">Stock Value</div>
      </div>

      {/* Table Body */}
      <div className="mt-2">
        {Object.entries(categorySummary).map(([category, summary]) => (
          <div
            key={category}
            className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-50"
          >
            <div className="text-blue-600 cursor-pointer">{category}</div>
            <div className="text-right text-gray-700">
              {summary.stockQuantity}
            </div>
            <div className="text-right text-gray-700">{summary.stockValue}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockSummaryByItemCategory;
