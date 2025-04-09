import React, { useEffect, useState } from "react";
import { Calendar, Heart, MessageSquare, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getBills } from "../Redux/billSlice";
import { getParties } from "../Redux/partySlice";
import { getPaymentIn, getPaymentOut } from "../Redux/paymentSlice";
import { getItems } from "../Redux/itemSlice";
import { addScheduleDeliveries, getScheduleDeliveries } from "../Redux/userSlice";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [selectedDateSales, setSelectedDateSales] = useState(0);
  const [selectedDateSalesPercentage, setSelectedDateSalesPercentage] = useState(0);
  const { parties } = useSelector((state) => state.party);
  const [totalPurchase, setTotalPurchase] = useState(0);
  const { items } = useSelector((state) => state.item);
  const { bills } = useSelector((state) => state.bill);
  const { paymentIn, paymentOut } = useSelector((state) => state.payment);
  const { schedules } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [upcomingLectures, setUpcomingLectures] = useState([]);

  const teamProgress = [
    { name: "Mattie Blooman", location: "Edinburgh", progress: 70 },
    { name: "Olivia Arribas", location: "Rio de Janeiro", progress: 60 },
    { name: "Graham Griffiths", location: "Birmingham", progress: 56 },
  ];

  useEffect(() => {
    dispatch(getScheduleDeliveries());
  }, [dispatch]);

  useEffect(() => {
    if (schedules) {
      const upcoming = schedules.filter(schedule => new Date(schedule.date) >= new Date());
      setUpcomingLectures(upcoming);
    }
  }, [schedules]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleAddSchedule = async () => {
    if (newScheduleDate && newScheduleTitle) {
      const [year, month, day] = newScheduleDate.split("-");
      const formattedDate = `${day} ${new Date(year, month - 1).toLocaleString("default", { month: "short" })}`;

      try {
        await dispatch(addScheduleDeliveries({ date: formattedDate, title: newScheduleTitle })).unwrap();
        await dispatch(getScheduleDeliveries());
        setNewScheduleDate("");
        setNewScheduleTitle("");
        setShowAddSchedule(false);
      } catch (error) {
        console.error("Failed to add schedule:", error);
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    dispatch(getBills());
    dispatch(getParties());
    dispatch(getPaymentIn());
    dispatch(getPaymentOut());
    dispatch(getItems());
  }, [dispatch]);

  useEffect(() => {
    setTotalSales(bills?.reduce((sum, item) => item.billType === "addsales" ? sum + Number(item.total) : sum, 0) || 0);
    setTotalPurchase(bills?.reduce((sum, item) => item.billType === "addpurchase" ? sum + Number(item.total) : sum, 0) || 0);
  }, [bills]);

  useEffect(() => {
    const selectedDateStr = selectedDate.toISOString().split("T")[0];
    const dateSpecificSales = bills?.reduce((sum, item) => {
      const billDate = new Date(item.invoiceDate).toISOString().split("T")[0];
      return item.billType === "addsales" && billDate === selectedDateStr ? sum + Number(item.total) : sum;
    }, 0) || 0;

    setSelectedDateSales(dateSpecificSales);

    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    const monthTotalSales = bills?.reduce((sum, item) => {
      const billDate = new Date(item.date);
      return item.billType === "addsales" && billDate >= monthStart && billDate <= monthEnd ? sum + Number(item.total) : sum;
    }, 0) || 1;

    const percentage = (dateSpecificSales / monthTotalSales) * 100;
    setSelectedDateSalesPercentage(Math.min(percentage, 100));
  }, [selectedDate, bills]);

  const formatNumber = (number) => {
    return Number(number).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateTotalTransactions = (partyName) => {
    return bills.filter(bill => bill?.form?.customer === partyName).reduce((sum, item) => sum + Number(item.total), 0);
  };

  return (
    <div className="p-3 bg-[#CCD7E3] h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <div className="w-6 h-6 flex items-center justify-center text-xl">👍</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Sales</div>
            <div className="text-lg font-bold">{totalSales}</div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <div className="w-6 h-6 flex items-center justify-center text-xl">🎯</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Purchase</div>
            <div className="text-lg font-bold">{totalPurchase}</div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <div className="w-6 h-6 flex items-center justify-center text-xl">📊</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Transactions</div>
            <div className="text-lg font-bold">{bills?.length + paymentOut?.length + paymentIn?.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm h-[228px]">
            <h2 className="font-semibold text-xs mb-2">Sales Progress for {selectedDate.toLocaleDateString()}</h2>
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray={`${selectedDateSalesPercentage}, 100`} />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">{selectedDateSalesPercentage.toFixed(1)}%</div>
            </div>
            <div className="bg-amber-100 text-amber-800 p-2 rounded-lg text-center text-xs">
              ₹{selectedDateSales.toFixed(2)}
              <div className="text-xs">Daily Sales</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm h-[228px]">
            <h2 className="font-semibold text-xs mb-2">Your Team's Progress</h2>
            <div className="space-y-3">
              {teamProgress.map((member, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?ga=GA1.1.891218442.1733565246&semt=ais_hybrid" alt={member.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-medium text-xs">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.location}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${member.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm h-[228px]">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs">
                <div className="font-medium">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-1 text-xs hover:bg-gray-100 rounded">◀</button>
                <button onClick={handleNextMonth} className="p-1 text-xs hover:bg-gray-100 rounded">▶</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-7 text-center text-xs">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: getFirstDayOfMonth(selectedDate) }, (_, i) => (
                  <div key={`empty-${i}`} className="p-1 text-center"></div>
                ))}
                {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => (
                  <div key={i} className={`p-1 text-center rounded-full cursor-pointer hover:bg-blue-50 ${selectedDate.getDate() === i + 1 ? "bg-blue-100 text-blue-600" : ""}`} onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1))}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f37] p-4 rounded-xl shadow-sm text-white h-[228px]">
            <div className="mb-3">
              <div className="text-sm font-semibold">60% Faster</div>
              <div className="text-xs opacity-80">We introduced some updates to make sure your learning process goes as smooth as possible.</div>
            </div>
            <button className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs">Ok! Take me there</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl shadow-sm h-[228px]">
            <h2 className="font-semibold text-xs mb-2">Parties</h2>
            <div className="space-y-2">
              {parties?.slice(0, 3).map((party, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                  <img src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?ga=GA1.1.891218442.1733565246&semt=ais_hybrid" alt={party.partyName} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="font-medium text-xs">{party.partyName}</div>
                    <div className="text-xs text-gray-500">Balance: {formatNumber(party.openingBalance)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm h-[228px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-xs">Schedule</h2>
              <button onClick={() => setShowAddSchedule(true)} className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-600">+ Add</button>
            </div>

            {showAddSchedule && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <input type="date" value={newScheduleDate} onChange={(e) => setNewScheduleDate(e.target.value)} className="w-full mb-2 p-2 rounded border text-xs" />
                <input type="text" value={newScheduleTitle} onChange={(e) => setNewScheduleTitle(e.target.value)} placeholder="Enter schedule title" className="w-full mb-2 p-2 rounded border text-xs" />
                <div className="flex gap-2">
                  <button onClick={handleAddSchedule} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">Add</button>
                  <button onClick={() => { setShowAddSchedule(false); setNewScheduleDate(""); setNewScheduleTitle(""); }} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {upcomingLectures.map((lecture, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-600">
                    <div className="text-xs">{lecture.date.split(" ")[1]}</div>
                    <div className="font-medium text-xs">{lecture.date.split(" ")[0]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-xs">{lecture.title}</div>
                  </div>
                  <button onClick={() => setUpcomingLectures(upcomingLectures.filter((_, i) => i !== index))} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;