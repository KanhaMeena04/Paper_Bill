import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getItems } from "../../Redux/itemSlice";
import { getBills } from "../../Redux/billSlice";

const SalePurchaseByItemCategory = () => {
  const [startDate, setStartDate] = useState("01/01/2025");
  const [endDate, setEndDate] = useState("21/01/2025");
  const [partyName, setPartyName] = useState("");
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.item);
  const { bills } = useSelector((state) => state.bill);

  useEffect(() => {
    dispatch(getItems());
    dispatch(getBills());
  }, [dispatch]);

  const calculateTransactions = () => {
    const transactions = {};

    bills.forEach(bill => {
      const billDate = new Date(bill.invoiceDate);
      const start = new Date(startDate.split('/').reverse().join('-'));
      const end = new Date(endDate.split('/').reverse().join('-'));
      
      if (billDate >= start && billDate <= end) {
        if (partyName && bill.form.customer.toLowerCase() !== partyName.toLowerCase()) {
          return;
        }

        bill.items.forEach(item => {
          // Create lookup key using itemId from bill items
          const lookupKey = item.itemId;
          
          if (!transactions[lookupKey]) {
            transactions[lookupKey] = {
              itemName: item.itemName,
              totalSales: 0,
              totalSalesAmount: 0,
              totalPurchases: 0,
              totalPurchaseAmount: 0
            };
          }

          const amount = parseFloat(bill.total) || 0;
          if (bill.billType === "addsales") {
            transactions[lookupKey].totalSales += 1;
            transactions[lookupKey].totalSalesAmount += amount;
          } else if (bill.billType === "addpurchase") {
            transactions[lookupKey].totalPurchases += 1;
            transactions[lookupKey].totalPurchaseAmount += amount;
          }
        });
      }
    });

    return transactions;
  };

  // Items ko categories ke hisaab se group karna with itemCode mapping
  const groupedItems = items.reduce((acc, item) => {
    item.categories.forEach((category) => {
      if (!acc[category]) {
        acc[category] = [];
      }
      // Add itemCode to the item object for matching with bills
      acc[category].push({
        ...item,
        itemId: item.itemCode // Map itemCode to itemId for matching with transactions
      });
    });
    return acc;
  }, {});

  const transactions = calculateTransactions();

  return (
    <div className="p-4 bg-white h-[88vh]">
      {/* Header Section */}
      <div className="flex justify-between mb-6">
        {/* Left side */}
        <div className="flex items-center">
          <div className="mr-4">
            <input
              type="text"
              placeholder="Party name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>From</span>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-24"
            />
            <span>To</span>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-24"
            />
          </div>
        </div>
        {/* Right side */}
        <div className="flex space-x-2">
          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded">
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
          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-sm font-medium mb-4">
        SALE/PURCHASE REPORT BY ITEM CATEGORY
      </h2>

      {Object.keys(groupedItems).map((category) => (
        <div key={category} className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">{category}</h3>
          <div className="grid grid-cols-7 gap-4 border-b pb-2 text-sm text-gray-600">
            <div>Item Name</div>
            <div className="text-right">Sales Qty</div>
            <div className="text-right">Sales Amount</div>
            <div className="text-right">Purchase Qty</div>
            <div className="text-right">Purchase Amount</div>
            <div className="text-right">Stock</div>
            <div className="text-right">Value</div>
          </div>

          {/* Items render karna jo iss category ke under hain */}
          <div className="mt-2">
            {groupedItems[category].map((item) => {
              const itemTransactions = transactions[item.itemId] || {
                totalSales: 0,
                totalSalesAmount: 0,
                totalPurchases: 0,
                totalPurchaseAmount: 0
              };
              
              const currentStock = (item.openingQuantity || 0) + 
                itemTransactions.totalPurchases - itemTransactions.totalSales;
              const stockValue = currentStock * item.purchasePrice;

              return (
                <div
                  key={item.itemId}
                  className="grid grid-cols-7 gap-4 py-2 text-sm text-gray-700"
                >
                  <div>{item.itemName}</div>
                  <div className="text-right">{itemTransactions.totalSales}</div>
                  <div className="text-right">₹ {itemTransactions.totalSalesAmount.toFixed(2)}</div>
                  <div className="text-right">{itemTransactions.totalPurchases}</div>
                  <div className="text-right">₹ {itemTransactions.totalPurchaseAmount.toFixed(2)}</div>
                  <div className="text-right">{currentStock}</div>
                  <div className="text-right">₹ {stockValue.toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          {/* Category Totals */}
          <div className="mt-4 border-t pt-2">
            <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-gray-800">
              <div>Category Total</div>
              <div className="text-right">
                {groupedItems[category].reduce((total, item) => 
                  total + (transactions[item.itemId]?.totalSales || 0), 0)}
              </div>
              <div className="text-right">
                ₹ {groupedItems[category].reduce((total, item) => 
                  total + (transactions[item.itemId]?.totalSalesAmount || 0), 0).toFixed(2)}
              </div>
              <div className="text-right">
                {groupedItems[category].reduce((total, item) => 
                  total + (transactions[item.itemId]?.totalPurchases || 0), 0)}
              </div>
              <div className="text-right">
                ₹ {groupedItems[category].reduce((total, item) => 
                  total + (transactions[item.itemId]?.totalPurchaseAmount || 0), 0).toFixed(2)}
              </div>
              <div className="text-right">
                {groupedItems[category].reduce((total, item) => 
                  total + ((item.openingQuantity || 0) + 
                    (transactions[item.itemId]?.totalPurchases || 0) - 
                    (transactions[item.itemId]?.totalSales || 0)), 0)}
              </div>
              <div className="text-right">
                ₹ {groupedItems[category].reduce((total, item) => {
                  const currentStock = (item.openingQuantity || 0) + 
                    (transactions[item.itemId]?.totalPurchases || 0) - 
                    (transactions[item.itemId]?.totalSales || 0);
                  return total + (currentStock * item.purchasePrice);
                }, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Grand Totals */}
      <div className="mt-6 border-t-2 pt-4">
        <div className="grid grid-cols-7 gap-4 text-sm font-bold text-gray-900">
          <div>Grand Total</div>
          <div className="text-right">
            {Object.values(transactions).reduce((total, t) => total + t.totalSales, 0)}
          </div>
          <div className="text-right">
            ₹ {Object.values(transactions).reduce((total, t) => total + t.totalSalesAmount, 0).toFixed(2)}
          </div>
          <div className="text-right">
            {Object.values(transactions).reduce((total, t) => total + t.totalPurchases, 0)}
          </div>
          <div className="text-right">
            ₹ {Object.values(transactions).reduce((total, t) => total + t.totalPurchaseAmount, 0).toFixed(2)}
          </div>
          <div className="text-right">
            {items.reduce((total, item) => {
              const currentStock = (item.openingQuantity || 0) + 
                (transactions[item.itemCode]?.totalPurchases || 0) - 
                (transactions[item.itemCode]?.totalSales || 0);
              return total + currentStock;
            }, 0)}
          </div>
          <div className="text-right">
            ₹ {items.reduce((total, item) => {
              const currentStock = (item.openingQuantity || 0) + 
                (transactions[item.itemCode]?.totalPurchases || 0) - 
                (transactions[item.itemCode]?.totalSales || 0);
              return total + (currentStock * item.purchasePrice);
            }, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalePurchaseByItemCategory;