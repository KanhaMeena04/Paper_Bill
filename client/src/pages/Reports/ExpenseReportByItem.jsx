import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExpenses, getExpenseItems } from "../../Redux/expenses";
import { useNavigate } from "react-router-dom";

const ExpenseReportByItem = () => {
  const dispatch = useDispatch();
  const { allExpenses, expenseItems } = useSelector((state) => state.expense);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getExpenses());
    dispatch(getExpenseItems());
  }, [dispatch]);

  const groupedItems = allExpenses.reduce((acc, expense) => {
    expense.expenseItems.forEach(item => {
      const itemId = item.itemId;
      if (!acc[itemId]) {
        const expenseItem = expenseItems.find(ei => ei._id === itemId);
        acc[itemId] = {
          name: expenseItem?.name || item.item,
          hsn: expenseItem?.hsn || "",
          taxRate: expenseItem?.taxRate || "",
          quantity: 0,
          totalAmount: 0,
          unitPrice: item.price
        };
      }
      acc[itemId].quantity += item.quantity;
      acc[itemId].totalAmount += item.amount;
    });
    return acc;
  }, {});

  const totalQuantity = Object.values(groupedItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalAmount = Object.values(groupedItems).reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select className="border rounded p-2 text-sm">
            <option>This Month</option>
          </select>
          <span className="bg-gray-200 px-2 py-1 rounded text-sm">Between</span>
          <input 
            type="date" 
            className="border rounded p-2 text-sm" 
            defaultValue="2025-01-01" 
          />
          <span className="text-sm">To</span>
          <input 
            type="date" 
            className="border rounded p-2 text-sm" 
            defaultValue="2025-01-31" 
          />
          <select className="border rounded p-2 text-sm">
            <option>ALL FIRMS</option>
          </select>
          <select className="border rounded p-2 text-sm">
            <option>ALL USERS</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border rounded text-sm">Excel Report</button>
          <button className="p-2 border rounded text-sm">Print</button>
        </div>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Search" 
          className="border rounded p-2 w-64 text-sm" 
        />
        <button 
          className="ml-4 bg-red-500 text-white px-4 py-2 rounded text-sm"
          onClick={() => navigate('/add-expense')}
        >
          + Add Expense
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">EXPENSE ITEM ▼</th>
            <th className="text-left p-2">HSN ▼</th>
            <th className="text-left p-2">TAX RATE ▼</th>
            <th className="text-right p-2">UNIT PRICE ▼</th>
            <th className="text-right p-2">QUANTITY ▼</th>
            <th className="text-right p-2">AMOUNT ▼</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedItems).map(([itemId, item]) => (
            <tr key={itemId} className="bg-gray-50">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.hsn}</td>
              <td className="p-2">{item.taxRate}</td>
              <td className="text-right p-2">
                ₹ {item.unitPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">
                ₹ {item.totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t">
            <td colSpan={6} className="p-2">
              <span className="mr-8">Total Quantity: {totalQuantity}</span>
              <span className="text-red-500">
                Total Amount: ₹ {totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ExpenseReportByItem;