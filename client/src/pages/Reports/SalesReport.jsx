import React, { useState, useEffect } from 'react';
import { Printer, MoreHorizontal, Search, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getBills } from '../../Redux/billSlice';
import { useNavigate } from 'react-router-dom';

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedFirm, setSelectedFirm] = useState('ALL FIRMS');
  const [searchTerm, setSearchTerm] = useState('');
  const [paidBills, setPaidBills] = useState(0);
  const [unPaidBills, setUnPaidBills] = useState(0)
  const [totalBills, setTotalBills] = useState(0);
  const [selectedTransactionType, setSelectedTransactionType] = useState('All Transaction');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getBills("addsales"));
  }, [dispatch]);

  const { bills = [], isLoading } = useSelector((state) => state.bill);

  // Filter bills based on search and filters
  const filteredBills = bills.filter(bill => {
    // Check if date range is selected and apply filter accordingly
    const matchesDate = (dateRange.start && dateRange.end) ?
      (new Date(bill.invoiceDate) >= new Date(dateRange.start) && 
       new Date(bill.invoiceDate) <= new Date(dateRange.end)) :
      true;  // If no date range is selected, return all bills
  
    const matchesSearch = bill.form?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bill.id?.toString().includes(searchTerm) ||
                          bill.billType?.toLowerCase().includes(searchTerm.toLowerCase());
  
    return matchesDate && matchesSearch;
  });

  useEffect(() => {
    const totalReceivedAmount = filteredBills.reduce(
      (total, item) => total + (parseFloat(item.receivedAmount) || 0),
      0
    );
    const totalBalanceAmount = filteredBills.reduce(
      (total, item) => total + (parseFloat(item.balanceAmount) || 0),
      0
    );
    console.log(filteredBills, "This is filtered bills")
    setPaidBills(totalReceivedAmount)
    setUnPaidBills(totalBalanceAmount)
    setTotalBills(totalBalanceAmount + totalReceivedAmount)
  }, [filteredBills])

  return (
    <div className="p-6 bg-white text-sm">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-100 transition duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <select 
            className="border rounded-md px-3 py-2"
            defaultValue="This Month"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Custom</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Between</span>
            <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded-md px-3 py-2"
            />
            <span className="text-gray-600">To</span>
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 border rounded-md px-3 py-2">
            Excel Report
          </button>
          <button className="flex items-center gap-2 border rounded-md px-3 py-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-green-100 rounded-lg p-4 min-w-[200px]">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-xl font-semibold">₹ {paidBills.toFixed(2)}</div>
        </div>
        <div className="flex items-center">
          <span className="text-2xl px-2">+</span>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 min-w-[200px]">
          <div className="text-sm text-gray-600">Unpaid</div>
          <div className="text-xl font-semibold">₹ {unPaidBills.toFixed(2)}</div>
        </div>
        <div className="flex items-center">
          <span className="text-2xl px-2">=</span>
        </div>
        <div className="bg-orange-100 rounded-lg p-4 min-w-[200px]">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xl font-semibold">₹ {totalBills.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-4">
        <select 
          className="border rounded-md px-3 py-2"
          value={selectedTransactionType}
          onChange={(e) => setSelectedTransactionType(e.target.value)}
        >
          <option>All Transaction</option>
          <option>orders</option>
          <option>purchase</option>
          <option>journal</option>
        </select>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border rounded-md px-3 py-2 w-full max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-600">DATE</th>
              <th className="text-left p-3 font-medium text-gray-600">INVOICE NO.</th>
              <th className="text-left p-3 font-medium text-gray-600">PARTY NAME</th>
              <th className="text-left p-3 font-medium text-gray-600">TRANSACTION TYPE</th>
              <th className="text-left p-3 font-medium text-gray-600">PAYMENT TYPE</th>
              <th className="text-right p-3 font-medium text-gray-600">TOTAL</th>
              <th className="text-right p-3 font-medium text-gray-600">BALANCE DUE</th>
              <th className="text-center p-3 font-medium text-gray-600">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill, index) => (
              <tr key={bill.id || index} className="border-b hover:bg-gray-50">
                <td className="p-3">{bill.invoiceDate}</td>
                <td className="p-3">{bill.form.invoiceNumber}</td>
                <td className="p-3">{bill.form?.customer}</td>
                <td className="p-3">{bill.billType == 'addsales' && "Sales"}</td>
                <td className="p-3">{bill.paymentType}</td>
                <td className="p-3 text-right">₹ {bill.total || 0}</td>
                <td className="p-3 text-right">₹ {bill.balanceAmount || 0}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;