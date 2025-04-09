import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import {
  MdChevronLeft,
  MdAdd,
  MdEmail,
  MdSms,
  MdSearch,
  MdMoreVert,
  MdClose,
} from "react-icons/md";
import { BsWhatsapp } from "react-icons/bs";
import AddPartyModal from "./AddPartyModal.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addParty,
  deleteParty,
  editParty,
  getParties,
} from "../Redux/partySlice.js";
import { getBills } from "../Redux/billSlice.js";
import toast from "react-hot-toast";

const HighlightedText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));

  return (
    <span>
      {parts.map((part, index) =>
        part?.toLowerCase() === highlight?.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: "#fff59d" }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

const PartiesSuppliers = () => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [selectedParty, setSelectedParty] = useState(null);
  const [partySearch, setPartySearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { parties, isLoading } = useSelector((state) => state.party);
  const [menuOpen, setMenuOpen] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentParty, setCurrentParty] = useState(null);
  const { bills } = useSelector((state) => state.bill);
  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

  useEffect(() => {
    dispatch(getParties());
    dispatch(getBills());
  }, [dispatch]);

  useEffect(() => {
    if (parties && parties.length > 0) {
      setSelectedParty(parties[0]);
    }
  }, [parties]);

  const handleParty = async (partyData) => {
    try {
      if (isEdit) {
        await dispatch(editParty(partyData)).unwrap();
        toast.success("Party edited successfully!");
      } else {
        await dispatch(addParty(partyData)).unwrap();
        toast.success("Party added successfully!");
      }
      dispatch(getParties());
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          "An error occurred while processing your request"
      );
    }
  };

  const handleAddPartyClick = () => {
    setIsModalOpen(true);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const filteredParties = parties?.filter((party) => {
    const matchesSearch = party.partyName
      ?.toLowerCase()
      .includes(partySearch?.toLowerCase());

    if (filterType === "All") {
      return matchesSearch;
    } else if (filterType === "Customer") {
      return party.partyType === "Customer" && matchesSearch;
    } else if (filterType === "Suppliers") {
      return party.partyType === "Supplier" && matchesSearch;
    }
    return false;
  });

  const handlePartyClick = (party) => {
    console.log(party, "This is the filtered transaction");
    setSelectedParty(party);
  };

  const filteredTransactions =
    selectedParty?.transactions?.filter((transaction) =>
      transaction.type?.toLowerCase().includes(transactionSearch?.toLowerCase())
    ) || [];

  const allTransactions = bills.filter(
    (bill) => bill.form?.partyId == selectedParty?.partyId
  );

  const combinedTransactions = [...filteredTransactions, ...allTransactions];

  const renderHeaderContent = () => {
    if (isSearchOpen) {
      return (
        <Box display="flex" alignItems="center" width="100%" gap={1}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search Parties"
            size="small"
            value={partySearch}
            onChange={(e) => setPartySearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              },
            }}
          />
          <IconButton onClick={toggleSearch}>
            <MdClose />
          </IconButton>
        </Box>
      );
    }

    if (isFilterOpen) {
      return (
        <Box display="flex" alignItems="center" width="100%" gap={1}>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="Suppliers">Suppliers</MenuItem>
          </Select>
          <IconButton onClick={toggleFilter}>
            <MdClose />
          </IconButton>
        </Box>
      );
    }

    return (
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={toggleSearch}>
          <MdSearch />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={handleAddPartyClick}
          sx={{ backgroundColor: "#374151" }}
        >
          Add Party
        </Button>
        <IconButton onClick={toggleFilter}>
          <MdMoreVert />
        </IconButton>
      </Box>
    );
  };

  const billTypeLabels = {
    addsales: "Sale",
    estimate: "Estimate",
    orders: "Sales Order",
    deliverychallan: "Delivery Challan",
    salesreturn: "Sales Return",
    addpurchase: "Purchase",
    purchaseexpenses: "Expenses",
    purchaseorders: "Purchase Orders",
    purchasereturn: "Purchase Return",
  };

  return (
    <>
      <Box display="flex" minHeight="80vh" p={2} bgcolor="#f9f9f9">
        {/* Left Sidebar */}
        <div className="flex flex-col max-h-screen bg-white rounded-lg shadow-lg w-80 h-[85vh] mr-3">
          {/* Header Section */}
          <div className="p-4 border-b">
            <div className="flex items-center mb-2">
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <MdChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="ml-2 font-bold text-sm">Import Parties</h2>
            </div>
            <p className="text-xs text-gray-500">
              Use contacts from your Phone or Gmail to create parties.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="p-4">{renderHeaderContent()}</div>

          {/* Table Section */}
          <div className="flex-1 overflow-y-auto">
            {parties.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-xs">
                  No parties added yet. Click "ADD PARTY" to get started.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 p-4">
                      Party
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 p-4">
                      Amount
                    </th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties?.map((party, index) => (
                    <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                      <td
                        className="p-4 text-sm border-t"
                        onClick={() => handlePartyClick(party)}
                      >
                        <HighlightedText
                          text={party.partyName}
                          highlight={partySearch}
                        />
                      </td>
                      <td
                        className={`p-4 text-sm border-t ${
                          party.balanceType === "to-receive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {party.openingBalance}
                      </td>
                      <td className="p-4 text-sm border-t relative">
                        <button
                          className="p-2 hover:bg-gray-200 rounded-full"
                          onClick={() => toggleMenu(index)}
                        >
                          <MdMoreVert className="w-5 h-5" />
                        </button>
                        {menuOpen === index && (
                          <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => {
                                setIsEdit(true);
                                setCurrentParty(party);
                                setMenuOpen(false)
                              }}
                            >
                              View/Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={async () => {
                                try {
                                  await dispatch(
                                    deleteParty(party.partyId)
                                  ).unwrap();
                                  toast.success("Party deleted successfully!");
                                  dispatch(getParties()); // Refresh the list after deletion
                                  setMenuOpen(false)
                                } catch (error) {
                                  toast.error(
                                    error?.data?.message ||
                                      "Failed to delete party!"
                                  );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Box flex={1}>
          {selectedParty ? (
            <>
              {/* Customer Details */}
              <Paper elevation={3} sx={{ p: 2, mb: 1 }}>
                <div className="flex justify-between">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {selectedParty?.partyName}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Button
                      startIcon={<BsWhatsapp style={{ fontSize: "14px" }} />}
                      color="success"
                      sx={{ mr: 1, minWidth: "40px", padding: "6px" }}
                    />
                    <Button
                      startIcon={
                        <MdSms style={{ fontSize: "14px", color: "#4CAF50" }} />
                      }
                      sx={{
                        borderColor: "#4CAF50",
                        minWidth: "40px",
                        padding: "6px",
                      }}
                    />
                    <Button
                      startIcon={<MdEmail style={{ fontSize: "14px" }} />}
                      sx={{ mr: 1, minWidth: "40px", padding: "6px" }}
                    />
                  </Box>
                </div>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  gap={1}
                  p={2}
                  bgcolor="#f3f3f3"
                  borderRadius={1}
                >
                  <div className="flex flex-col">
                    <Typography variant="caption">
                      Phone: {selectedParty?.partyPhone}
                    </Typography>
                    <Typography variant="caption">
                      Email: {selectedParty?.partyEmail}
                    </Typography>
                    <Typography variant="caption">
                      Address: {selectedParty?.partyBillingAddress}
                    </Typography>
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="caption">
                      State: {selectedParty?.partyState}
                    </Typography>
                    <Typography variant="caption">
                      GSTIN: {selectedParty?.partyGSTIN}
                    </Typography>
                    <Typography variant="caption">
                      Opening Balance: {selectedParty?.openingBalance}
                    </Typography>
                  </div>
                </Box>
              </Paper>

              {/* Transactions */}
              <div className="p-6 h-[56.5vh] bg-white rounded-lg shadow-lg flex flex-col">
                <div className="flex justify-between mb-4">
                  <h2 className="text-sm font-bold">Transactions</h2>

                  <input
                    type="text"
                    placeholder="Search Transactions"
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="px-3 py-1 text-sm rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  />
                </div>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-800">
                      <tr>
                        <th className="p-4 text-left text-xs font-medium">
                          Date
                        </th>
                        <th className="p-4 text-left text-xs font-medium">
                          Type
                        </th>
                        <th className="p-4 text-left text-xs font-medium">
                          Amount
                        </th>
                        <th className="p-4 text-left text-xs font-medium">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedTransactions?.map((transaction, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-neutral-700"
                        >
                          <td className="p-4 text-xs">
                            {transaction.date || transaction.invoiceDate}
                          </td>
                          <td className="p-4 text-xs">
                            {transaction.type ||
                              billTypeLabels[transaction.billType] ||
                              "Default Label"}
                          </td>
                          <td
                            className={`p-4 text-xs ${
                              transaction.amount > 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.amount}
                          </td>
                          <td className={`p-4 text-xs`}>
                            {transaction.balance || transaction.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="textSecondary">
                Select a party or add a new one to view details
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Add Party Modal */}
      <AddPartyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleParty={handleParty}
        isEdit={isEdit}
        openModel = {setIsModalOpen}
        setIsEdit={setIsEdit}
        currentParty={currentParty}
      />
    </>
  );
};

export default PartiesSuppliers;
