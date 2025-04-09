import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExpenses } from "../../Redux/expenses";
import { useNavigate } from "react-router-dom";

const ExpenseReports = () => {
  const dispatch = useDispatch();
  const { allExpenses } = useSelector((state) => state.expense);

  useEffect(() => {
    dispatch(getExpenses());
  });
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select className="border rounded p-2">
            <option>This Month</option>
          </select>
          <span className="bg-gray-200 px-2 py-1 rounded">Between</span>
          <input
            type="date"
            className="border rounded p-2"
            defaultValue="2025-01-01"
          />
          <span>To</span>
          <input
            type="date"
            className="border rounded p-2"
            defaultValue="2025-01-31"
          />
          <select className="border rounded p-2">
            <option>ALL FIRMS</option>
          </select>
          <select className="border rounded p-2">
            <option>ALL USERS</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border rounded">Graph</button>
          <button className="p-2 border rounded">Excel Report</button>
          <button className="p-2 border rounded">Print</button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border rounded p-2 w-64"
        />
        <button
          className="ml-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/add-expense")}
        >
          + Add Expense
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">DATE ▼</th>
            <th className="text-left p-2">EXP NO. ▼</th>
            <th className="text-left p-2">PARTY ▼</th>
            <th className="text-left p-2">CATEGORY N... ▼</th>
            <th className="text-left p-2">PAYMENT TYPE ▼</th>
            <th className="text-right p-2">AMOUNT ▼</th>
            <th className="text-right p-2">BALANCE DUE ▼</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allExpenses &&
            allExpenses.map((expense) => (
              <tr key={expense.id} className="border-b">
                <td className="p-2">{expense.date}</td>
                <td className="p-2">{expense.expenseNo}</td>
                <td className="p-2">{expense.party}</td>
                <td className="p-2">{expense.expenseCategory}</td>
                <td className="p-2">{expense.paymentType}</td>
                <td className="text-right p-2">{expense.amount}</td>
                <td className="text-right p-2">{expense.balanceDue}</td>
                <td className="text-center p-2">��</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseReports;
