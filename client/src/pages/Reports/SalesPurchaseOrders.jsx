import React, { useEffect, useState, useRef } from "react";
import { Calendar, Printer, Download } from "lucide-react";
import { getBills } from "../../Redux/billSlice";
import { getParties } from "../../Redux/partySlice";
import { useDispatch, useSelector } from "react-redux";

const SalesPurchaseOrders = () => {
  const dispatch = useDispatch();
  const { bills } = useSelector((state) => state.bill);
  const [filteredBills, setFilteredBills] = useState([]);
  const [showPartyPopover, setShowPartyPopover] = useState(false);
  const partyInputRef = useRef(null);
  const [filters, setFilters] = useState({
    partyFilter: "",
    orderType: "orders",
    orderStatus: "All Orders"
  });

  const { parties } = useSelector((state) => state.party);

  useEffect(() => {
    dispatch(getBills());
    dispatch(getParties());
  }, [dispatch]);

  useEffect(() => {
    const filterBills = () => {
      let filtered = bills;

      filtered = filtered.filter(
        item => item.billType === "orders" || item.billType === "purchaseorders"
      );

      // Party filter
      if (filters.partyFilter) {
        filtered = filtered.filter(item =>
          item.form.customer.toLowerCase().includes(filters.partyFilter.toLowerCase())
        );
      }

      // Order type filter
      if (filters.orderType !== "all") {
        filtered = filtered.filter(item => item.billType === filters.orderType);
      }

      // Order status filter
      if (filters.orderStatus !== "All Orders") {
        filtered = filtered.filter(item => item.orderStatus === filters.orderStatus);
      }

      setFilteredBills(filtered);
    };

    filterBills();
  }, [bills, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyInputRef.current && !partyInputRef.current.contains(event.target)) {
        setShowPartyPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalAmount = filteredBills.reduce((sum, order) => sum + order.total, 0);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePartySelect = (partyName) => {
    setFilters(prev => ({
      ...prev,
      partyFilter: partyName
    }));
    setShowPartyPopover(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow h-[88vh]">
      <div className="flex items-center justify-between mb-6 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded p-2">
            <span>From</span>
            <input
              type="date"
              defaultValue="2025-01-01"
              className="border-none outline-none text-sm"
            />
            <Calendar className="w-4 h-4" />
            <span>To</span>
            <input
              type="date"
              defaultValue="2025-01-22"
              className="border-none outline-none text-sm"
            />
            <Calendar className="w-4 h-4" />
          </div>

          <select className="border rounded p-2 text-sm">
            <option>ALL USERS</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Download className="w-6 h-6 text-gray-600 cursor-pointer" />
          <Printer className="w-6 h-6 text-gray-600 cursor-pointer" />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="text-gray-600">FILTERS</div>
        <div className="relative" ref={partyInputRef}>
          <input
            type="text"
            placeholder="Party filter"
            name="partyFilter"
            value={filters.partyFilter}
            onChange={handleFilterChange}
            onClick={() => setShowPartyPopover(true)}
            className="border rounded p-2 text-sm w-48"
          />
          {showPartyPopover && (
            <div className="absolute z-10 mt-1 w-48 bg-white border rounded-lg shadow-lg">
              {parties.map((party, index) => (
                <div
                  key={party.partyId || index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePartySelect(party.partyName)}
                >
                  {party.partyName}
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          className="border rounded p-2 text-sm"
          name="orderType"
          value={filters.orderType}
          onChange={handleFilterChange}
        >
          <option value="all">ALL ORDERS</option>
          <option value="orders">SALE ORDER</option>
          <option value="purchaseorders">PURCHASE ORDER</option>
        </select>
        <select
          className="border rounded p-2 text-sm"
          name="orderStatus"
          value={filters.orderStatus}
          onChange={handleFilterChange}
        >
          <option value="All Orders">All Orders</option>
          <option value="Open Order">Open Orders</option>
          <option value="Closed Order">Closed Orders</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">DATE</th>
              <th className="text-left p-2">Order No.</th>
              <th className="text-left p-2">NAME</th>
              <th className="text-left p-2">Due Date</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">TYPE</th>
              <th className="text-right p-2">TOTAL</th>
              <th className="text-right p-2">ADVANCE</th>
              <th className="text-right p-2">BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((order, index) => (
                <tr key={order.id || index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.invoiceDate}</td>
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.form.customer}</td>
                  <td className="p-2">{order.dueDate || "-"}</td>
                  <td className="p-2">{order.orderStatus}</td>
                  <td className="p-2">
                    {order.billType === "orders" ? "Sales Orders" : "Purchase Orders"}
                  </td>
                  <td className="text-right p-2">₹ {order.total?.toFixed(2)}</td>
                  <td className="text-right p-2">
                    ₹ {order.advance?.toFixed(2) || "0.00"}
                  </td>
                  <td className="text-right p-2">
                    ₹ {(order.advance ? order.total - order.advance : order.total).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6 text-sm">
        <div className="text-right">
          Total Amount: ₹ {totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default SalesPurchaseOrders;