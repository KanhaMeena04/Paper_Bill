import React, { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Input,
  Typography,
  Select,
  InputLabel,
  IconButton,
  Popover,
} from "@mui/material";
import { Dialog, DialogTitle, DialogActions } from "@mui/material";
import {
  calculateItemTotals,
  calculateBillTotals,
  applyBillLevelDiscountAndTax,
  roundOff,
} from "./calculationUtils";
import {
  X as CloseIcon,
  Camera,
  Plus as AddIcon,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  FileText as DescriptionIcon,
  Share as ShareIcon,
  UserPlus as UserPlusIcon,
  Delete as DeleteIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addParty, getParties, verifyPartyName } from "../Redux/partySlice.js";
import {
  getAllPrimaryUnits,
  getAllSecondaryUnits,
  getItems,
  verifyItemName,
} from "../Redux/itemSlice.js";
import AddPartyModal from "./AddPartyModal.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllBank } from "../Redux/bankSlice.js";

import { addBill, getInvoices } from "../Redux/billSlice.js";
import {
  getPrintSettings,
  getThermalPrintSettings,
  getTransactionSettings,
} from "../Redux/settingsSlice.js";
import { jwtDecode } from "jwt-decode";
import DefaultThermalTheme from "./PrintSettings/DefaultThermalTheme.jsx";
import Theme1Base from "./PrintSettings/Theme1Base.jsx";
import { getBusinessProfile } from "../Redux/userSlice.js";
import InvoicePage from "./InvoicePage.jsx";
import axios from "axios";
import { serviceUrl } from "../Services/url.js";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const emptySaleForm = {
  saleType: "credit",
  customer: "",
  phone: "",
  charges: [],
  ewaybill: "",
  billingAddress: "",
  billingName: "",
  invoiceNumber: "",
  invoiceTime: "",
  poDate: new Date().toISOString().split("T")[0],
  poNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  stateOfSupply: "",
  items: [
    {
      id: 1,
      itemName: "",
      itemId: "",
      quantity: {
        primary: "",
        secondary: "",
        primaryUnit: "",
        secondaryUnit: "",
      },
      unit: "NONE",
      price: "",
      freeItemQuantity: 0,
      discount: {
        percentage: "",
        amount: "",
      },
      tax: {
        percentage: "",
        amount: "",
      },
      amount: 0,
    },
  ],
  roundOff: 0,
  total: 0,
  transportName: "", // New field for transport name
  paymentType: "cash", // New field for payment type
  description: "", // New field for description
  image: "", // New field for image
  discount: { percentage: "", amount: "" }, // New field for discount
  tax: { percentage: "", amount: "" }, // New field for tax
  balanceAmount: 0,
  receivedAmount: 0,
};

export default function AddSales() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState();
  const [newCategory, setNewCategory] = useState();
  const [taxRates, setTaxRates] = useState([]);
  const { profile } = useSelector((state) => state.auth);
  const { banks } = useSelector((state) => state.bank);
  const [isSelected, setIsSelected] = useState(false);
  const { allTransactionSettings } = useSelector((state) => state.settings);

  useEffect(() => {
    console.log(location.state?.page, "Current Location");
    setCurrentPage(location.state?.page);
  }, [location]);
  const [tabs, setTabs] = useState([
    {
      id: 1,
      label:
        location.state?.page === "addsales"
          ? "Sale #1"
          : location.state?.page === "estimate"
          ? "Estimate #1"
          : location.state?.page === "orders"
          ? "Sales Order #1"
          : location.state?.page === "deliverychallan"
          ? "Delivery Challan #1"
          : location.state?.page === "salesreturn"
          ? "Sales Return #1"
          : location.state?.page === "addpurchase"
          ? "Purchase #1"
          : location.state?.page === "purchaseexpenses"
          ? "Expenses #1"
          : location.state?.page === "purchaseorders"
          ? "Purchase Orders #1"
          : location.state?.page === "purchasereturn"
          ? "Purchase Return #1"
          : "Default #1",
      form: { ...emptySaleForm },
    },
  ]);

  const handleSavePrimary = (unit) => {
    setTabs((prevTab) =>
      prevTab.map((tab) => ({
        ...tab,
        form: {
          ...tab.form,
          items: tab.form.items.map((item) => ({
            ...item,
            quantity: {
              ...item.quantity,
              primaryUnit: unit,
            },
          })),
        },
      }))
    );
  };

  const handleSaveSecondary = (unit) => {
    setTabs((prevTab) =>
      prevTab.map((tab) => ({
        ...tab,
        form: {
          ...tab.form,
          items: tab.form.items.map((item) => ({
            ...item,
            quantity: {
              ...item.quantity,
              secondaryUnit: unit,
            },
          })),
        },
      }))
    );
  };

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const response = await axios.get(`${serviceUrl}/auth/getCountry`, {
          params: { email: decoded.email },
        });

        const allTaxRates = response?.data?.country?.taxRates || [];

        // Filter unique tax rates based on name and rate
        const uniqueTaxRates = allTaxRates.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.name === value.name && t.rate === value.rate
            )
        );

        setTaxRates(uniqueTaxRates);
      } catch (error) {
        console.error("Error fetching country:", error);
      }
    };
    fetchCountry();
  }, []);

  useEffect(() => {
    if (allTransactionSettings?.additionalFields?.transaction) {
      let dynamicFields = {};

      allTransactionSettings.additionalFields.transaction.forEach((field) => {
        if (field.enabled && field.name) {
          dynamicFields[field.name] = field.value || ""; // Initialize with default value if exists
        }
      });

      setTabs([
        {
          id: 1,
          label:
            location.state?.page === "addsales"
              ? "Sale #1"
              : location.state?.page === "estimate"
              ? "Estimate #1"
              : location.state?.page === "orders"
              ? "Sales Order #1"
              : location.state?.page === "deliverychallan"
              ? "Delivery Challan #1"
              : location.state?.page === "salesreturn"
              ? "Sales Return #1"
              : location.state?.page === "addpurchase"
              ? "Purchase #1"
              : location.state?.page === "purchaseexpenses"
              ? "Expenses #1"
              : location.state?.page === "purchaseorders"
              ? "Purchase Orders #1"
              : location.state?.page === "purchasereturn"
              ? "Purchase Return #1"
              : "Default #1",
          form: { ...emptySaleForm, ...dynamicFields }, // Merge with new fields
        },
      ]);
    }
  }, [allTransactionSettings]);

  useEffect(() => {
    if (allTransactionSettings?.transportationDetails) {
      setTabs((prevTabs) =>
        prevTabs.map((tab, tabIndex) =>
          tabIndex === 0
            ? {
                ...tab,
                form: {
                  ...tab.form,
                  transportationDetails:
                    allTransactionSettings.transportationDetails.map(
                      (detail) => ({
                        id: detail.id || detail.value, // Unique identifier
                        name: detail.value,
                        inputValue: "", // Initially empty
                      })
                    ),
                },
              }
            : tab
        )
      );
    }
  }, [allTransactionSettings]); // Dependency array ensures this runs when `allTransactionSettings` changes

  const handleTransportationChange = (index, value) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, tabIndex) =>
        tabIndex === 0
          ? {
              ...tab,
              form: {
                ...tab.form,
                transportationDetails: tab.form.transportationDetails.map(
                  (detail, i) =>
                    i === index ? { ...detail, inputValue: value } : detail
                ),
              },
            }
          : tab
      )
    );
  };

  // const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState(0);

  const [addPartyNew, setAddPartyNew] = useState(false);
  const dispatch = useDispatch();
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemPopover, setItemPopover] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const { parties, isPartyNameUnique } = useSelector((state) => state.party);
  const { items, primaryUnits, secondaryUnits, isUnique } = useSelector(
    (state) => state.item
  );
  const { totalInvoices } = useSelector((state) => state.bill);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const { allPrintSettings, allThermalPrintSettings } = useSelector(
    (state) => state.settings
  );
  const [paymentType, setPaymentType] = useState("credit");

  const [selectedTheme, setSelectedTheme] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    currentTheme: 1,
    companyLogo: "",
    companyName: "NewCompany",
    phone: "7892737777",
    address: "",
    email: "",
    trnOnSale: "",
    paperSize: "A4", // Added paperSize field
    orientation: "portrait", // Added orientation field
    companyNameTextSize: "large", // Added companyNameTextSize field
    invoiceTextSize: "v-small", // Added invoiceTextSize field
    printOriginalDuplicate: false, // Added printOriginalDuplicate field
    printOriginalForRecipient: true, // Added printOriginalForRecipient field
    printDuplicate: false, // Added printDuplicate field
    printTriplicate: false, // Added printTriplicate field
    printOriginalForRecipientLabel: "ORIGINAL FOR RECIPIENT",
    printDuplicateLabel: "DUPLICATE FOR TRANSPORTER",
    printTriplicateLabel: "TRIPLICATE FOR SUPPLIER",
    descriptionFooter: false,
    invoiceDetails: {
      invoiceNo: "Inv. 101",
      date: "02-07-2019",
      time: "12:30 PM",
      dueDate: "17-07-2019",
    },
    billTo: {
      name: "Classic enterprises",
      address: "Plot No. 1, Shop No. 6, Koramangala, Bangalore, 560014",
      contact: "888888888",
    },
    shipTo: {
      name: "Mehra Textiles",
      address: "Marathalli Road, Bangalore, Karnataka, 560014",
    },
    items: [],
    taxDetails: {
      taxableAmount: 40.2,
      rate: 2.5,
      sgstAmount: 1.0,
      cgstAmount: 1.0,
      totalTaxAmount: 2.0,
    },
    summary: {
      subTotal: 45.8,
      discount: 5.5,
      totalTax: 2.0,
      totalAmount: 42.32,
      amountInWords: "Forty-Two Dirhams and Thirty-Two Fills only",
    },
    terms: "Thanks for doing business with us!",
    bankDetails: {
      bankName: "123123123123",
      accountNo: "123123123123",
      ifscCode: "123123123",
    },
    qrCodeSrc: "/api/placeholder/120/120",
    totalItemQuantityChecked: false,
    amountWithDecimalChecked: false,
    receivedAmountChecked: false,
    balanceAmountChecked: false,
    currentBalanceOfPartyChecked: false,
    taxDetailsChecked: false,
    youSavedChecked: false,
    printAmountWithGroupingChecked: false,
    printDescription: false,
    customerSignature: false,
    customerSignatureTitle: "Customer Signature",
    printAcknowledgement: false,
    paymentMode: false,
  });
  const [updatedPrimaryUnits, setUpdatedPrimaryUnits] = useState([
    { name: "BAGS" },
    { name: "BOTTLES" },
    { name: "BOX" },
    { name: "BUNDLES" },
    { name: "CANS" },
    { name: "CARTONS" },
    { name: "DOZENS" },
    { name: "GRAMMES" },
    { name: "KILOGRAMS" },
    { name: "LITRE" },
    { name: "MILLILITRE" },
    { name: "NUMBERS" },
    { name: "PACKS" },
    { name: "PAIRS" },
    { name: "PIECES" },
    { name: "QUINTAL" },
    { name: "ROLLS" },
    { name: "SQUARE FEET" },
  ]);

  const [updatedSecondaryUnits, setUpdatedSecondaryUnits] = useState([
    { name: "BAGS" },
    { name: "BOTTLES" },
    { name: "BOX" },
    { name: "BUNDLES" },
    { name: "CANS" },
    { name: "CARTONS" },
    { name: "DOZENS" },
    { name: "GRAMMES" },
    { name: "KILOGRAMS" },
    { name: "LITRE" },
    { name: "MILLILITRE" },
    { name: "NUMBERS" },
    { name: "PACKS" },
    { name: "PAIRS" },
    { name: "PIECES" },
    { name: "QUINTAL" },
    { name: "ROLLS" },
    { name: "SQUARE FEET" },
  ]);

  useEffect(() => {
    if (primaryUnits && secondaryUnits) {
      const updatedPrimary = [
        ...new Set([...updatedPrimaryUnits, ...primaryUnits]),
      ];
      const updatedSecondary = [
        ...new Set([...updatedSecondaryUnits, ...secondaryUnits]),
      ];
      setUpdatedPrimaryUnits(updatedPrimary);
      setUpdatedSecondaryUnits(updatedSecondary);
    }
  }, [
    primaryUnits,
    secondaryUnits,
    updatedPrimaryUnits,
    updatedSecondaryUnits,
  ]);
  useEffect(() => {
    if (allTransactionSettings) {
      if (allTransactionSettings?.header?.cashSaleByDefault) {
        setPaymentType("cash");
      }
    }
  }, [allTransactionSettings]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, []);

  useEffect(() => {
    if (email) {
      dispatch(getAllPrimaryUnits(email));
      dispatch(getAllSecondaryUnits(email));
    }
  }, [dispatch, email]);

  useEffect(() => {
    if (email) {
      dispatch(getBusinessProfile(email));
    }
  }, [email, dispatch]);

  useEffect(() => {
    dispatch(getParties());
    dispatch(getInvoices());
    dispatch(getItems());
    dispatch(getAllBank());
    if (email) {
      dispatch(getPrintSettings(email));
      dispatch(getThermalPrintSettings(email));
      dispatch(getTransactionSettings(email));
    }
  }, [email, dispatch]);

  const handleAddTab = () => {
    const newTabId = tabs.length + 1;
    let label;
    if (currentPage === "addsales") {
      label = `Sale #${newTabId}`;
    } else if (currentPage === "estimate") {
      label = `Estimate #${newTabId}`;
    } else if (currentPage === "orders") {
      label = `Sales Order #${newTabId}`;
    } else if (currentPage === "deliverychallan") {
      label = `Delivery Challan #${newTabId}`;
    } else if (currentPage === "salesreturn") {
      label = `Sales Return #${newTabId}`;
    } else if (currentPage === "addpurchase") {
      label = `Purchase #${newTabId}`;
    } else if (currentPage === "purchaseexpenses") {
      label = `Expenses #${newTabId}`;
    } else if (currentPage === "purchaseorders") {
      label = `Purchase Orders #${newTabId}`;
    } else if (currentPage === "purchasereturn") {
      label = `Purchase Return #${newTabId}`;
    } else {
      label = `Tab #${newTabId}`;
    }

    setTabs([
      ...tabs,
      {
        id: newTabId,
        label: label,
        form: { ...emptySaleForm },
      },
    ]);

    setActiveTab(tabs.length);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tabToClose, setTabToClose] = useState(null);

  const handleCloseTab = (event, tabId) => {
    event.stopPropagation();
    setTabToClose(tabId);
    setIsDialogOpen(true);
  };

  const handleConfirmClose = () => {
    const newTabs = tabs.filter((tab) => tab.id !== tabToClose);
    setTabs(newTabs);

    if (newTabs.length === 0) {
      navigate(-1);
    } else if (activeTab >= newTabs.length) {
      setActiveTab(newTabs.length - 1);
    }

    setIsDialogOpen(false);
    setTabToClose(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddRow = (tabIndex) => {
    const updatedTabs = [...tabs];
    const newItem = {
      id: updatedTabs[tabIndex].form.items.length + 1,
      item: "",
      quantity: "",
      unit: "NONE",
      price: "",
      discount: "",

      tax: "",
      amount: 0,
    };
    updatedTabs[tabIndex].form.items.push(newItem);
    setTabs(updatedTabs);
  };

  const handleFormChange = (tabIndex, field, value) => {
    const updatedTabs = [...tabs];

    if (field === "customer") {
      const selectedParty = parties.find((party) => party._id === value);
      updatedTabs[tabIndex].form.customer = value;
      updatedTabs[tabIndex].form.phone = selectedParty
        ? selectedParty.phone
        : "";
    } else if (field === "discount" || field === "tax") {
      updatedTabs[tabIndex].form[field] = {
        ...updatedTabs[tabIndex].form[field],
        ...value,
      };

      // Recalculate totals when bill-level discount or tax changes
      const billTotals = calculateBillTotals(updatedTabs[tabIndex].form.items);
      const finalTotals = applyBillLevelDiscountAndTax(
        billTotals,
        updatedTabs[tabIndex].form.discount,
        updatedTabs[tabIndex].form.tax
      );

      // Apply round off if enabled
      const roundedTotal = updatedTabs[tabIndex].form.roundOff
        ? roundOff(finalTotals.grandTotal)
        : finalTotals.grandTotal;

      updatedTabs[tabIndex].form.total = roundedTotal;
    } else {
      updatedTabs[tabIndex].form[field] = value;
    }

    setTabs(updatedTabs);
  };

  const handleParty = async (partyData) => {
    await dispatch(addParty(partyData));
    dispatch(getParties());
    setAddPartyNew(false);
  };

  const handleDeleteRow = (tabIndex, itemId) => {
    const updatedTabs = [...tabs];
    updatedTabs[tabIndex].form.items = updatedTabs[tabIndex].form.items.filter(
      (item) => item.id !== itemId
    );
    setTabs(updatedTabs);
  };

  const handleChangeReceived = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleItemSelect = (tabIndex, rowId, currentItem) => {
    const updatedTabs = [...tabs];
    const itemIndex = updatedTabs[tabIndex].form.items.findIndex(
      (item) => item.id === rowId
    );

    if (itemIndex !== -1) {
      let discountAmount = 0;
      if (currentItem.saleDiscountType === "Percentage") {
        discountAmount =
          (currentItem.salePrice * currentItem.saleDiscount) / 100;
      } else if (currentItem.saleDiscountType !== "Percentage") {
        discountAmount = currentItem.saleDiscount;
      }

      const updatedDiscount = {
        percentage:
          currentItem.saleDiscountType === "Percentage"
            ? currentItem.saleDiscount
            : updatedTabs[tabIndex].form.items[itemIndex].discount.percentage,
        amount: discountAmount,
      };

      const taxPercentage = currentItem.taxRate.match(/@(\d+)%/);
      const taxAmount = taxPercentage
        ? (currentItem.salePrice - discountAmount) *
          (parseFloat(taxPercentage[1]) / 100)
        : 0;
      const updatedTax = {
        percentage: currentItem.taxRate,
        amount: taxAmount,
      };
      console.log(
        currentItem.price - discountAmount,
        currentItem.price,
        discountAmount,
        "This is the updated discount"
      );
      updatedTabs[tabIndex].form.items[itemIndex] = {
        ...updatedTabs[tabIndex].form.items[itemIndex],
        itemName: currentItem.itemName,
        price: currentItem.salePrice,
        itemId: currentItem.itemCode,
        quantity: currentItem.minStockToMaintain || 1,
        discount: updatedDiscount,
        // tax: updatedTax,
        amount: currentItem.salePrice - discountAmount + taxAmount,
      };
    }
    setSelectedItem(currentItem);
    setIsSelected(true);
    setTabs(updatedTabs);
    setItemPopover(null);
  };

  const handleItemPopover = (event, rowId) => {
    setSelectedRowId(rowId);
    setItemPopover(event.currentTarget); // Ensure this is the input field
  };

  const handleCloseItemPopover = () => {
    setItemPopover(null);
  };

  const { enabledFields, customFields } = useSelector((state) => state.item);

  const handleChargeChange = (e, index) => {
    const updatedTabs = [...tabs];
    const form = updatedTabs[0].form;

    // Ensure charges array exists and is an array of objects
    form.charges = form.charges || [];

    // Find the selected tax rate
    const selectedTaxRate = profile?.taxRates.find(
      (rate) => rate._id === form.charges[index]?.taxRate
    );

    // Get the charge name from allTransactionSettings
    const chargeName = allTransactionSettings?.additionalCharges?.[index]?.name;

    // Calculate total with tax
    const baseValue = parseFloat(e.target.value) || 0;
    const taxRate = selectedTaxRate ? selectedTaxRate.rate / 100 : 0;
    const totalWithTax = baseValue * (1 + taxRate);

    form.charges[index] = {
      ...form.charges[index],
      name: chargeName, // Add the charge name
      value: e.target.value,
      baseValue: baseValue,
      taxRate: form.charges[index]?.taxRate,
      totalWithTax: totalWithTax.toFixed(2),
    };

    setTabs(updatedTabs);
  };

  const handleTaxRateChange = (e, index) => {
    const updatedTabs = [...tabs];
    const form = updatedTabs[0].form;

    form.charges = form.charges || [];

    // Find the selected tax rate
    const selectedTaxRate = profile?.taxRates.find(
      (rate) => rate._id === e.target.value
    );

    // Get the charge name from allTransactionSettings
    const chargeName = allTransactionSettings?.additionalCharges?.[index]?.name;

    // Recalculate total with tax if base value exists
    const baseValue = form.charges[index]?.value
      ? parseFloat(form.charges[index].value)
      : 0;
    const taxRate = selectedTaxRate ? selectedTaxRate.rate / 100 : 0;
    const totalWithTax = baseValue * (1 + taxRate);

    form.charges[index] = {
      ...form.charges[index],
      name: chargeName, // Add the charge name
      taxRate: e.target.value,
      totalWithTax: totalWithTax.toFixed(2),
    };

    setTabs(updatedTabs);
  };

  const handleItemChange = (itemId, field, value, subfield = null) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        const newItems = tab.form.items.map((item) => {
          if (item.id === itemId) {
            let updatedItem;
            let extractedTaxPercentage = 0;

            if (subfield) {
              // Extract percentage if the field is 'tax' and the value contains a percentage
              if (field === "tax" && typeof value === "string") {
                const match = value.match(/(\d+(\.\d+)?)%/); // Extracts the numeric part before %
                if (match) {
                  extractedTaxPercentage = parseFloat(match[1]); // Convert to number
                }
              }

              updatedItem = {
                ...item,
                [field]: {
                  ...item[field],
                  [subfield]: extractedTaxPercentage || value, // Use extracted percentage if available
                },
              };
            } else {
              updatedItem = { ...item, [field]: value };
            }
            // Calculate new totals whenever relevant fields change
            if (["quantity", "price", "discount", "tax"].includes(field)) {
              const totals = calculateItemTotals(updatedItem);
              console.log("This is the updated tax:", totals.taxAmount);
              updatedItem.amount = totals.finalAmount;
              updatedItem.discount.amount = totals.discountAmount;
              updatedItem.tax.amount = totals.taxAmount;
              updatedItem.tax.percentage = value;
            }

            return updatedItem;
          }
          return item;
        });

        // Calculate bill totals
        const billTotals = calculateBillTotals(newItems);
        const finalTotals = applyBillLevelDiscountAndTax(
          billTotals,
          tab.form.discount,
          tab.form.tax
        );

        // Apply round off if enabled
        const roundedTotal = tab.form.roundOff
          ? roundOff(finalTotals.grandTotal)
          : finalTotals.grandTotal;

        return {
          ...tab,
          form: {
            ...tab.form,
            items: newItems,
            total: roundedTotal,
          },
        };
      })
    );
  };

  // First, let's add the number to words converter function
  const numberToWords = (num) => {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";

      let result = "";

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " hundred ";
        n %= 100;
        if (n > 0) result += "and ";
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
        if (n > 0) result += ones[n] + " ";
      } else if (n >= 10) {
        result += teens[n - 10] + " ";
      } else if (n > 0) {
        result += ones[n] + " ";
      }

      return result;
    };

    if (num === 0) return "zero rupees";

    let result = "";

    if (num >= 100000) {
      result += convertLessThanThousand(Math.floor(num / 100000)) + "lakh ";
      num %= 100000;
    }

    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + "thousand ";
      num %= 1000;
    }

    result += convertLessThanThousand(num);

    return result.trim() + " rupees";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredParties, setFilteredParties] = useState(parties);
  const wrapperRef = useRef(null);

  // useEffect(() => {
  //   // Set initial input value if there's a selected party
  //   const selectedParty = parties.find((p) => p.partyId === value);
  //   if (selectedParty) {
  //     setInputValue(selectedParty.partyName);
  //   }
  // }, [value, parties]);

  useEffect(() => {
    // Filter parties based on input
    const filtered = parties.filter((party) =>
      party.partyName.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredParties(filtered);
  }, [inputValue, parties]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e, index) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    handleFormChange(index, "customer", e.target.value);
  };

  const handleCheckItemName = (itemId, itemName) => {
    if (!isSelected) {
      dispatch(verifyItemName(itemName));
    }
  };

  const handleVerifyPartyName = (partyName, index) => {
    dispatch(verifyPartyName(partyName));
  };

  const handleSelect = (party, index) => {
    setInputValue(party.partyName);
    handleFormChange(index, "customer", party.partyName);
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered");

    const updatedTabs = tabs.map((tab, index) => ({
      ...tab,
      form: {
        ...tab.form,
        total: getTotalForField(tab?.form?.items, "amount"),
      },
      invoiceNumber: totalInvoices + index + 1,
      billType: currentPage,
    }));

    console.log("Updated Tabs: ", updatedTabs);

    try {
      const response = await dispatch(addBill(updatedTabs)).unwrap();
      console.log("API Response: ", response);

      if (response.success) {
        toast.success(response.message || "Bills added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        console.log("Creating updatedInvoiceData...");
        let updatedInvoiceData = {};

        try {
          let dynamicInvoiceFields = {};

          if (allTransactionSettings?.additionalFields?.transaction) {
            allTransactionSettings.additionalFields.transaction.forEach(
              (field) => {
                if (field.enabled && field.name) {
                  dynamicInvoiceFields[field.name] =
                    updatedTabs[0]?.form?.[field.name] || "";
                }
              }
            );
          }

          // Get the total amount for converting to words
          const totalAmount = updatedTabs[0]?.form?.total || 0;
          const totalAmountInWords = numberToWords(Math.round(totalAmount));

          updatedInvoiceData = {
            ...invoiceData,
            billTo: {
              ...invoiceData.billTo,
              name: updatedTabs[0]?.form?.customer,
              billingName: updatedTabs[0]?.form?.billingName,
              contact: updatedTabs[0]?.form?.phone,
              address: updatedTabs[0]?.form?.billingAddress,
            },
            invoiceDetails: {
              ...invoiceData.invoiceDetails,
              invoiceNo: totalInvoices + 1,
              prefix: allTransactionSettings?.transactionPrefixes?.sale
                ? allTransactionSettings?.transactionPrefixes?.sale
                : allTransactionSettings?.transactionPrefixes?.creditNote
                ? allTransactionSettings?.transactionPrefixes?.creditNote
                : allTransactionSettings?.transactionPrefixes?.deliveryChallan
                ? allTransactionSettings?.transactionPrefixes?.deliveryChallan
                : allTransactionSettings?.transactionPrefixes?.paymentIn,
              date: updatedTabs[0]?.form?.invoiceDate,
              time: updatedTabs[0]?.form?.invoiceTime,
              poDate: updatedTabs[0]?.form?.poDate,
              poNumber: updatedTabs[0]?.form?.poNumber,
              ewaybill: updatedTabs[0]?.form?.ewaybill,
              dynamicInvoiceFields: dynamicInvoiceFields,
            },
            items: updatedTabs[0]?.form?.items.map((item, i) => {
              console.log(`Mapping item ${i}: `, item);
              return {
                name: item?.itemName,
                quantity: `${item?.quantity?.primary} ${item?.quantity?.primaryUnit}, ${item?.quantity?.secondary} ${item?.quantity?.secondaryUnit}`,
                pricePerUnit: item?.price,
                tax: item?.tax?.amount,
                freeItemQuantity: item?.freeItemQuantity,
                discount: item?.discount?.percentage,
                gst: item?.tax?.percentage,
                amount: item?.amount,
              };
            }),
            summary: {
              ...invoiceData.summary,
              totalAmount: updatedTabs[0]?.form?.total,
              totalAmountInWords: totalAmountInWords, // Added the amount in words here
            },
            terms: invoiceData.terms,
            additionalFields: allTransactionSettings?.additionalFields
              ? allTransactionSettings?.additionalFields
              : {},
            additionalCharges: updatedTabs[0]?.form?.charges,
            transportationDetails: updatedTabs[0]?.form?.transportationDetails,
          };
        } catch (invoiceError) {
          console.error(
            "Error while creating updatedInvoiceData: ",
            invoiceError
          );
        }

        console.log("Final updatedInvoiceData: ", updatedInvoiceData);
        if (!allTransactionSettings?.moreFeatures?.doNotShowInvoicePreview) {
          setSelectedTheme(
            <InvoicePage
              invoiceData={updatedInvoiceData}
              setInvoiceData={setInvoiceData}
              isEditable={true}
            />
          );
          // if (allPrintSettings?.printer === "regular-printer") {
          //   setSelectedTheme(
          //     <InvoicePage
          //       invoiceData={updatedInvoiceData}
          //       setInvoiceData={setInvoiceData}
          //       isEditable={true}
          //     />
          //   );
          // } else {
          //   // const mergedState = {
          //   //   selectedTheme:
          //   //     updatedTabs[0]?.form?.selectedTheme || selectedTheme,

          //   //   printerSettings: {
          //   //     ...allThermalPrintSettings?.printerSettings,
          //   //     pageSize:
          //   //       updatedTabs[0]?.form?.printerSettings?.pageSize ||
          //   //       allThermalPrintSettings?.printerSettings.pageSize,
          //   //     makeDefault:
          //   //       updatedTabs[0]?.form?.printerSettings?.makeDefault ??
          //   //       allThermalPrintSettings?.printerSettings.makeDefault,
          //   //     useTextStyling:
          //   //       updatedTabs[0]?.form?.useTextStyling ??
          //   //       allThermalPrintSettings?.printerSettings.useTextStyling,
          //   //     autoCutPaper:
          //   //       updatedTabs[0]?.form?.autoCutPaper ??
          //   //       allThermalPrintSettings?.printerSettings.autoCutPaper,
          //   //     openCashDrawer:
          //   //       updatedTabs[0]?.form?.openCashDrawer ??
          //   //       allThermalPrintSettings?.printerSettings.openCashDrawer,
          //   //     extraLines:
          //   //       updatedTabs[0]?.form?.extraLines ??
          //   //       allThermalPrintSettings?.printerSettings.extraLines,
          //   //     numberOfCopies:
          //   //       updatedTabs[0]?.form?.numberOfCopies ??
          //   //       allThermalPrintSettings?.printerSettings.numberOfCopies,
          //   //     colors:
          //   //       updatedTabs[0]?.form?.colors ??
          //   //       allThermalPrintSettings?.printerSettings.colors,
          //   //   },

          //   //   companyInfo: {
          //   //     ...allThermalPrintSettings?.companyInfo,
          //   //     companyName:
          //   //       updatedTabs[0]?.form?.customer ||
          //   //       allThermalPrintSettings?.companyInfo.companyName,
          //   //     includeLogo:
          //   //       updatedTabs[0]?.form?.includeLogo ??
          //   //       allThermalPrintSettings?.companyInfo.includeLogo,
          //   //     address:
          //   //       updatedTabs[0]?.form?.billingAddress ||
          //   //       allThermalPrintSettings?.companyInfo.address,
          //   //     email:
          //   //       updatedTabs[0]?.form?.email ||
          //   //       allThermalPrintSettings?.companyInfo.email,
          //   //     phone:
          //   //       updatedTabs[0]?.form?.phone ||
          //   //       allThermalPrintSettings?.companyInfo.phone,
          //   //     gstin:
          //   //       updatedTabs[0]?.form?.gstin ||
          //   //       allThermalPrintSettings?.companyInfo.gstin,
          //   //   },

          //   //   itemTableSettings: {
          //   //     ...allThermalPrintSettings?.itemTableSettings,
          //   //     showSNo:
          //   //       updatedTabs[0]?.form?.showSNo ??
          //   //       allThermalPrintSettings?.itemTableSettings.showSNo,
          //   //     showHSN:
          //   //       updatedTabs[0]?.form?.showHSN ??
          //   //       allThermalPrintSettings?.itemTableSettings.showHSN,
          //   //     showUOM:
          //   //       updatedTabs[0]?.form?.showUOM ??
          //   //       allThermalPrintSettings?.itemTableSettings.showUOM,
          //   //     showMRP:
          //   //       updatedTabs[0]?.form?.showMRP ??
          //   //       allThermalPrintSettings?.itemTableSettings.showMRP,
          //   //     showDescription:
          //   //       updatedTabs[0]?.form?.showDescription ??
          //   //       allThermalPrintSettings?.itemTableSettings.showDescription,
          //   //     showBatch:
          //   //       updatedTabs[0]?.form?.showBatch ??
          //   //       allThermalPrintSettings?.itemTableSettings.showBatch,
          //   //     showExpiry:
          //   //       updatedTabs[0]?.form?.showExpiry ??
          //   //       allThermalPrintSettings?.itemTableSettings.showExpiry,
          //   //     showMfg:
          //   //       updatedTabs[0]?.form?.showMfg ??
          //   //       allThermalPrintSettings?.itemTableSettings.showMfg,
          //   //     showSize:
          //   //       updatedTabs[0]?.form?.showSize ??
          //   //       allThermalPrintSettings?.itemTableSettings.showSize,
          //   //     showModelNo:
          //   //       updatedTabs[0]?.form?.showModelNo ??
          //   //       allThermalPrintSettings?.itemTableSettings.showModelNo,
          //   //     showSerialNo:
          //   //       updatedTabs[0]?.form?.showSerialNo ??
          //   //       allThermalPrintSettings?.itemTableSettings.showSerialNo,
          //   //   },

          //   //   totalsAndTaxes: {
          //   //     ...allThermalPrintSettings?.totalsAndTaxes,
          //   //     showTotalQuantity:
          //   //       updatedTabs[0]?.form?.showTotalQuantity ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showTotalQuantity,
          //   //     showAmountDecimal:
          //   //       updatedTabs[0]?.form?.showAmountDecimal ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showAmountDecimal,
          //   //     showReceivedAmount:
          //   //       updatedTabs[0]?.form?.showReceivedAmount ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showReceivedAmount,
          //   //     showBalance:
          //   //       updatedTabs[0]?.form?.showBalance ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showBalance,
          //   //     showCurrentBalance:
          //   //       updatedTabs[0]?.form?.showCurrentBalance ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showCurrentBalance,
          //   //     showTaxDetails:
          //   //       updatedTabs[0]?.form?.showTaxDetails ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showTaxDetails,
          //   //     showYouSaved:
          //   //       updatedTabs[0]?.form?.showYouSaved ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showYouSaved,
          //   //     showAmountGrouping:
          //   //       updatedTabs[0]?.form?.showAmountGrouping ??
          //   //       allThermalPrintSettings?.totalsAndTaxes.showAmountGrouping,
          //   //     amountLanguage:
          //   //       updatedTabs[0]?.form?.amountLanguage ||
          //   //       allThermalPrintSettings?.totalsAndTaxes.amountLanguage,
          //   //   },

          //   //   footerSettings: {
          //   //     ...allThermalPrintSettings?.footerSettings,
          //   //     showPrintDescription:
          //   //       updatedTabs[0]?.form?.showPrintDescription ??
          //   //       allThermalPrintSettings?.footerSettings.showPrintDescription,
          //   //   },
          //   // };
          //   // console.log(mergedState, "This is the merged state");
          //   // setSelectedTheme(
          //   //   <DefaultThermalTheme
          //   //     printerSettings={mergedState.printerSettings}
          //   //     companyInfo={mergedState.companyInfo}
          //   //     itemTableSettings={mergedState.itemTableSettings}
          //   //     totalsAndTaxes={mergedState.totalsAndTaxes}
          //   //     footerSettings={mergedState.footerSettings}
          //   //     isEditable={true}
          //   //   />
          //   // );
          // }
        }
      } else {
        toast.error(response.message || "Failed to add bills", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error in API call: ", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while adding bills";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      if (error.response?.data?.message?.includes("Duplicate invoice number")) {
        console.error("Duplicate invoice number detected");
      }
    }
  };
  // Helper function to parse numeric input and handle invalid values
  const parseNumericInput = (value) => {
    // Handle null, undefined, empty string
    if (value == null || value === "") return 0;

    // Convert to number, handling string numbers and numeric values
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.-]/g, ""))
        : Number(value);

    // Return 0 if not a valid number
    return isNaN(numValue) ? 0 : numValue;
  };

  // Enhanced handleInputChange to properly handle numeric inputs
  const handleNumericInputChange = (itemId, field, value, subfield = null) => {
    // Allow empty string or valid numbers only

    handleItemChange(itemId, field, value, subfield);
  };

  // Function to calculate totals with proper number handling
  const getTotalForField = (items, field, subfield = "") => {
    return items
      ?.reduce((total, item) => {
        if (subfield) {
          const value = parseNumericInput(item[field]?.[subfield]);
          return total + value;
        }
        const value = parseNumericInput(item[field]);
        return total + value;
      }, 0)
      .toFixed(2);
  };

  const calculateGrandTotal = (index) => {
    const itemsTotal =
      parseFloat(getTotalForField(tabs[index]?.form?.items, "amount")) || 0;
    const chargesTotal = tabs[index].form.charges
      ? tabs[index].form.charges.reduce(
          (total, charge) => total + (parseFloat(charge.totalWithTax) || 0),
          0
        )
      : 0;

    return (itemsTotal + chargesTotal).toFixed(2);
  };

  // ✅ Update balanceAmount using useEffect
  useEffect(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) => {
        const grandTotal = calculateGrandTotal(index);
        const receivedAmount = parseFloat(tab?.form?.receivedAmount) || 0;
        const balanceAmount = (grandTotal - receivedAmount).toFixed(2);

        return {
          ...tab,
          form: {
            ...tab.form,
            balanceAmount: balanceAmount,
          },
        };
      })
    );
  }, [tabs]);
  return (
    <>
      {selectedTheme ? (
        selectedTheme
      ) : (
        <>
          <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <DialogTitle>Are you sure you want to close this tab?</DialogTitle>
            <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmClose} autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Box sx={{ width: "100%", overflowY: "scroll" }}>
            <Paper elevation={3} className="h-screen">
              <AppBar
                position="fixed"
                color="default"
                sx={{ width: "100%", top: 0 }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {tabs.map((tab, index) => (
                      <Tab
                        key={tab.id}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {tab.label}
                            </Typography>
                            <Box
                              component="button"
                              sx={{
                                ml: 1,
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                p: 0,
                                display: "flex",
                                alignItems: "center",
                              }}
                              onClick={(e) => handleCloseTab(e, tab.id)}
                            >
                              <CloseIcon size={16} />
                            </Box>
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>
                  <Box
                    component="button"
                    sx={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={handleAddTab}
                  >
                    <AddIcon size={24} />
                  </Box>
                </Box>
              </AppBar>

              {tabs.map((tab, index) => (
                <>
                  <TabPanel
                    key={tab.id}
                    value={activeTab}
                    index={index}
                    className="overflow-y-auto h-[calc(100vh-64px)] pt-12" // Adjust the height based on the AppBar
                  >
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                            {currentPage === "addsales"
                              ? "Sale"
                              : currentPage === "estimate"
                              ? "Estimate"
                              : currentPage === "orders"
                              ? "Sales Order"
                              : currentPage === "deliverychallan"
                              ? "Delivery Challan"
                              : currentPage === "salesreturn"
                              ? "Sales Return"
                              : currentPage === "addpurchase"
                              ? "Purchase"
                              : currentPage === "purchaseexpenses"
                              ? "Expenses"
                              : currentPage === "purchaseorders"
                              ? "Purchase Orders"
                              : currentPage === "purchasereturn"
                              ? "Purchase Return"
                              : "Default Label"}
                          </Typography>
                        </Grid>
                        {currentPage === "addsales" && (
                          <>
                            <Grid item>
                              <Button
                                variant={
                                  paymentType === "credit"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() => setPaymentType("credit")}
                                sx={{ fontSize: "0.875rem" }}
                              >
                                Credit
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                variant={
                                  paymentType === "cash"
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() => setPaymentType("cash")}
                                sx={{ fontSize: "0.875rem" }}
                              >
                                Cash
                              </Button>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                    <div className="flex flex-col gap-4 p-4">
                      {/* Main container with two columns */}
                      <div className="flex justify-between">
                        {/* Left column */}
                        <div className="flex flex-col gap-4 w-1/2">
                          {/* Select Party Input */}
                          <div className="w-full flex gap-2">
                            {currentPage !== "purchaseexpenses" && (
                              <div className="relative" ref={wrapperRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Select Party
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={inputValue}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                    onFocus={() => setIsOpen(true)}
                                    onBlur={() =>
                                      handleVerifyPartyName(inputValue, index)
                                    }
                                    placeholder="Type or select party"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-2 flex items-center"
                                    onClick={() => setIsOpen(!isOpen)}
                                  >
                                    <svg
                                      className="w-5 h-5 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={
                                          isOpen
                                            ? "M5 15l7-7 7 7"
                                            : "M19 9l-7 7-7-7"
                                        }
                                      />
                                    </svg>
                                  </button>
                                </div>

                                {/* Agar party name duplicate hai to error message show hoga */}
                                {!isPartyNameUnique && (
                                  <span className="text-red-500 text-sm mt-1">
                                    Party Name already exists
                                  </span>
                                )}

                                {isOpen && (
                                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-300 max-h-60 overflow-auto">
                                    {filteredParties.map((party) => (
                                      <button
                                        key={party.partyId}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        onClick={() =>
                                          handleSelect(party, index)
                                        }
                                      >
                                        <span>{party.partyName}</span>
                                        <span className="text-gray-500 ml-2">
                                          - {party.openingBalance} (
                                          {party.balanceType === "to-receive"
                                            ? "↑"
                                            : "↓"}
                                          )
                                        </span>
                                      </button>
                                    ))}
                                    {filteredParties.length === 0 && (
                                      <div className="px-4 py-2 text-gray-500">
                                        No parties found
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {allTransactionSettings?.header
                              ?.billingNameOfParties && (
                              <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">
                                  Billing Name (Optional)
                                </label>
                                <input
                                  type="text"
                                  className="w-[197px] border rounded pl-2 pr-2 py-2 focus:outline-none focus:border-blue-500"
                                  value={tab.form.billingName}
                                  onChange={(e) =>
                                    handleFormChange(
                                      index,
                                      "billingAddress",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )}

                            {/* label */}
                            {currentPage === "purchaseexpenses" && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Expenses Category
                                  </label>
                                  <select
                                    className="w-full h-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={tab.form.customer}
                                    onChange={(e) => {
                                      const selectedValue = e.target.value;
                                      if (selectedValue === "new") {
                                        setNewCategory(true); // Open the modal or handle adding a new party
                                      } else {
                                        handleFormChange(
                                          index,
                                          "customer",
                                          selectedValue
                                        );
                                      }
                                    }}
                                  >
                                    <option value="" disabled>
                                      Select Expenses Category
                                    </option>

                                    <option
                                      value="new"
                                      className="text-blue-600"
                                    >
                                      + Add New Category
                                    </option>
                                  </select>
                                </div>
                              </>
                            )}
                          </div>

                          {currentPage === "purchasereturn" && (
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700">
                                Phone No.
                              </label>
                              <Input
                                type="text"
                                className="h-[40px]"
                                value={tab.form.phone}
                                onChange={(e) =>
                                  handleFormChange(
                                    index,
                                    "phone",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )}

                          {allTransactionSettings?.moreFeatures?.eWayBillNo && (
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700">
                                E-Way Bill No.
                              </label>
                              <Input
                                type="text"
                                className="h-[40px]"
                                value={tab.form.ewaybill}
                                onChange={(e) =>
                                  handleFormChange(
                                    index,
                                    "ewaybill",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )}
                          {allTransactionSettings?.additionalFields?.transaction?.map(
                            (field, i) =>
                              field.enabled && (
                                <div key={i} className="w-full">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {field.name}
                                  </label>
                                  <input
                                    type="text"
                                    className="h-[40px] border rounded px-2"
                                    value={tab.form[field.name] || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        index,
                                        field.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )
                          )}

                          {allTransactionSettings?.header
                            ?.customersPODetails && (
                            <div className="flex gap-2">
                              <div className="flex items-center justify-end">
                                <label className="text-sm font-medium text-gray-700">
                                  PO Date:
                                </label>
                                <Input
                                  type="date"
                                  className="h-[40px] w-32"
                                  value={tab.form.poDate}
                                  onChange={(e) =>
                                    handleFormChange(
                                      index,
                                      "poDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">
                                  PO Number
                                </label>
                                <input
                                  type="text"
                                  className="w-[197px] border rounded pl-2 pr-2 py-2 focus:outline-none focus:border-blue-500"
                                  value={tab.form.poNumber}
                                  onChange={(e) =>
                                    handleFormChange(
                                      index,
                                      "poNumber",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {currentPage !== "purchaseorders" &&
                            currentPage !== "purchasereturn" && (
                              <>
                                {/* Billing Address Input */}
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Billing Address
                                  </label>
                                  <input
                                    type="text"
                                    className="w-[197px] border rounded pl-2 pr-2 py-2 focus:outline-none focus:border-blue-500"
                                    value={tab.form.billingAddress}
                                    onChange={(e) =>
                                      handleFormChange(
                                        index,
                                        "billingAddress",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </>
                            )}
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col gap-4 w-1/3">
                          {/* Invoice Number Input */}
                          {allTransactionSettings?.header?.invoiceBillNo && (
                            <div className="flex items-center justify-end">
                              <label className="text-sm font-medium text-gray-700">
                                Invoice Number:{" "}
                              </label>
                              <input
                                type="text"
                                className="w-32 border rounded pl-2 pr-2 py-2 focus:outline-none focus:border-blue-500"
                                value={
                                  `${
                                    allTransactionSettings?.transactionPrefixes
                                      ?.sale ||
                                    allTransactionSettings?.transactionPrefixes
                                      ?.creditNote ||
                                    allTransactionSettings?.transactionPrefixes
                                      ?.deliveryChallan ||
                                    allTransactionSettings?.transactionPrefixes
                                      ?.paymentIn
                                  }${totalInvoices}` || ""
                                }
                                disabled
                                onChange={(e) =>
                                  handleFormChange(
                                    index,
                                    "invoiceNumber",
                                    totalInvoices || ""
                                  )
                                }
                              />
                            </div>
                          )}

                          {/* Invoice Date Input */}
                          {allTransactionSettings?.header
                            ?.addTimeOnTransactions && (
                            <div className="flex items-center justify-end space-x-4 mt-2">
                              <label className="text-sm font-medium text-gray-700">
                                Invoice Time:
                              </label>
                              <Input
                                type="time"
                                className="h-[40px] w-32"
                                value={tab.form.invoiceTime}
                                onChange={(e) =>
                                  handleFormChange(
                                    index,
                                    "invoiceTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-end">
                            <label className="text-sm font-medium text-gray-700">
                              Invoice Date:
                            </label>
                            <Input
                              type="date"
                              className="h-[40px] w-32"
                              value={tab.form.invoiceDate}
                              onChange={(e) =>
                                handleFormChange(
                                  index,
                                  "invoiceDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* State of Supply Input */}
                          <div className="flex items-center justify-end">
                            <label className="text-sm font-medium text-gray-700">
                              State of Supply:
                            </label>
                            <select
                              className="w-32 h-10 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                              value={tab.form.stateOfSupply}
                              onChange={(e) =>
                                handleFormChange(
                                  index,
                                  "stateOfSupply",
                                  e.target.value
                                )
                              }
                            >
                              <option value="" disabled>
                                Select State
                              </option>
                              {[
                                "Andhra Pradesh",
                                "Arunachal Pradesh",
                                "Assam",
                                "Bihar",
                                "Chhattisgarh",
                                "Goa",
                                "Gujarat",
                                "Haryana",
                                "Himachal Pradesh",
                                "Jharkhand",
                                "Karnataka",
                                "Kerala",
                                "Madhya Pradesh",
                                "Maharashtra",
                                "Manipur",
                                "Meghalaya",
                                "Mizoram",
                                "Nagaland",
                                "Odisha",
                                "Punjab",
                                "Rajasthan",
                                "Sikkim",
                                "Tamil Nadu",
                                "Telangana",
                                "Tripura",
                                "Uttar Pradesh",
                                "Uttarakhand",
                                "West Bengal",
                                "Andaman and Nicobar Islands",
                                "Chandigarh",
                                "Dadra and Nagar Haveli and Daman and Diu",
                                "Lakshadweep",
                                "Delhi",
                                "Puducherry",
                              ].map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="p-2 text-xs border">#</th>
                            <th className="p-2 text-xs border">ITEM</th>
                            {/* Dynamic columns */}
                            {Object.entries(enabledFields).map(
                              ([field, enabled]) =>
                                enabled && (
                                  <th
                                    key={field}
                                    className="p-2 text-xs border-l border-t border-b"
                                  >
                                    {field.toUpperCase()}
                                  </th>
                                )
                            )}
                            {/* Custom fields */}
                            {customFields.map((field) => (
                              <th
                                key={field.name}
                                className="p-2 text-xs border-l border-t border-b"
                              >
                                {field.name.toUpperCase()}
                              </th>
                            ))}
                            {/* Quantity columns */}
                            <th
                              className="p-2 text-xs text-center border"
                              colSpan={2}
                            >
                              QTY
                            </th>
                            {allTransactionSettings?.itemsTable
                              ?.freeItemQuantity && (
                              <th className="p-2 text-xs border">
                                Free Quantity
                              </th>
                            )}
                            <th className="p-2 text-xs border">PRICE/UNIT</th>
                            <th
                              className="p-2 text-xs text-center border"
                              colSpan={2}
                            >
                              DIS
                            </th>
                            <th
                              className="p-2 text-xs text-center border"
                              colSpan={2}
                            >
                              TAX
                            </th>
                            <th className="p-2 text-xs border">AMOUNT</th>
                          </tr>
                          {/* Subcolumn labels */}
                          <tr>
                            <th colSpan={2} className="border"></th>
                            {Object.entries(enabledFields).map(
                              ([field, enabled]) =>
                                enabled && (
                                  <th
                                    key={field}
                                    className="border-r border-b"
                                  />
                                )
                            )}
                            {customFields.map(() => (
                              <th className="border-b" />
                            ))}
                            <th className="p-1 text-xs text-center border">
                              PRIMARY
                              <div className="mt-1">
                                <select
                                  className="border p-1 text-xs w-[107px]"
                                  onClick={(e) =>
                                    handleSavePrimary(e.target.value)
                                  }
                                >
                                  <option value="">Select Primary Unit</option>
                                  {updatedPrimaryUnits?.map((unit, index) => (
                                    <option key={index} value={unit.name}>
                                      {unit.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </th>
                            <th className="p-1 text-xs text-center border">
                              SECONDARY
                              <div className="mt-1">
                                <select
                                  className="border p-1 text-xs w-[107px]"
                                  onClick={(e) =>
                                    handleSaveSecondary(e.target.value)
                                  }
                                >
                                  <option value="">
                                    Select Secondary Unit
                                  </option>
                                  {updatedSecondaryUnits?.map((unit, index) => (
                                    <option key={index} value={unit.name}>
                                      {unit.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </th>
                            {allTransactionSettings?.itemsTable
                              ?.freeItemQuantity && <th className="border" />}
                            <th className="border" />
                            <th className="p-1 text-xs text-center border">
                              %
                            </th>
                            <th className="p-1 text-xs text-center border">
                              AMT
                            </th>
                            <th className="p-1 text-xs text-center border">
                              %
                            </th>
                            <th className="p-1 text-xs text-center border">
                              AMT
                            </th>
                            <th className="border" />
                          </tr>
                        </thead>
                        <tbody>
                          {tab.form.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-1 border">{index}</td>
                              <td className="p-1 border">
                                <div className="flex flex-col">
                                  <input
                                    type="text"
                                    value={item.itemName}
                                    onChange={(e) =>
                                      handleNumericInputChange(
                                        item.id,
                                        "itemName",
                                        e.target.value
                                      )
                                    }
                                    onClick={(e) =>
                                      handleItemPopover(e, item.id)
                                    }
                                    onBlur={() =>
                                      handleCheckItemName(
                                        item.id,
                                        item.itemName
                                      )
                                    }
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                    placeholder="Enter item name"
                                  />
                                  {!isUnique && (
                                    <span className="text-red-500 text-[10px] mt-1">
                                      Item name already exists
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Dynamic fields */}
                              {Object.entries(enabledFields).map(
                                ([field, enabled]) =>
                                  enabled && (
                                    <td key={field} className="p-1 border">
                                      <input
                                        type="text"
                                        value={item[field] || ""}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            field,
                                            e.target.value
                                          )
                                        }
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                  )
                              )}
                              {/* Custom fields */}
                              {customFields.map((field) => (
                                <td key={field.name} className="p-1 border">
                                  <input
                                    type="text"
                                    value={item[field.name] || ""}
                                    onChange={(e) =>
                                      handleItemChange(
                                        item.id,
                                        field.name,
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                              ))}
                              {/* Quantity inputs */}
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.quantity?.primary || ""}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      item.id,
                                      "quantity",
                                      e.target.value,
                                      "primary"
                                    )
                                  }
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.quantity?.secondary || ""}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      item.id,
                                      "quantity",
                                      e.target.value,
                                      "secondary"
                                    )
                                  }
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              {/* Free item quantity */}
                              {allTransactionSettings?.itemsTable
                                ?.freeItemQuantity && (
                                <td className="p-1 border">
                                  <input
                                    type="text"
                                    value={item.freeItemQuantity || ""}
                                    onChange={(e) =>
                                      handleNumericInputChange(
                                        item.id,
                                        "freeItemQuantity",
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                              )}
                              {/* Price input */}
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.price || ""}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      item.id,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              {/* Discount inputs */}
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.discount.percentage || ""}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      item.id,
                                      "discount",
                                      e.target.value,
                                      "percentage"
                                    )
                                  }
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.discount.amount || ""}
                                  readOnly
                                  className="w-full text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                              </td>
                              {/* Tax inputs */}
                              <td className="p-1 border">
                                <select
                                  value={item.tax.percentage || ""}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      item.id,
                                      "tax",
                                      e.target.value,
                                      "percentage"
                                    )
                                  }
                                  className="w-[106px] text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="">Select Tax %</option>
                                  {taxRates.map((tax, index) => (
                                    <option
                                      key={index}
                                      value={`${tax.name} ${tax.rate}%`}
                                    >
                                      {tax.name} {tax.rate}%
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.tax.amount || ""}
                                  readOnly
                                  className="w-full text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                              </td>
                              {/* Amount */}
                              <td className="p-1 border">
                                <input
                                  type="text"
                                  value={item.amount || ""}
                                  readOnly
                                  className="w-full text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="font-bold bg-gray-50">
                            <td colSpan={2} className="p-2 border">
                              Total
                            </td>
                            {/* Dynamic field totals */}
                            {Object.entries(enabledFields).map(
                              ([field, enabled]) =>
                                enabled && (
                                  <td key={field} className="p-2 border">
                                    {getTotalForField(
                                      tab[index]?.form?.items,
                                      field
                                    )}
                                  </td>
                                )
                            )}
                            {/* Custom fields */}
                            {customFields.map(() => (
                              <td className="border" />
                            ))}
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "quantity",
                                "primary"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "quantity",
                                "secondary"
                              )}
                            </td>
                            {allTransactionSettings?.itemsTable
                              ?.freeItemQuantity && (
                              <td className="p-2 border">
                                {getTotalForField(
                                  tab[index]?.form?.items,
                                  "freeItemQuantity"
                                )}
                              </td>
                            )}
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "price"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "discount",
                                "percentage"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "discount",
                                "amount"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "tax",
                                "percentage"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(
                                tab[index]?.form?.items,
                                "tax",
                                "amount"
                              )}
                            </td>
                            <td className="p-2 border">
                              {getTotalForField(tab?.form?.items, "amount")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <Button
                      onClick={() => handleAddRow(index)}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2, fontSize: "0.75rem" }}
                    >
                      +
                    </Button>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="flex flex-col space-y-4">
                        {/* Left Column */}
                        {tab[index]?.form?.transportationDetails?.map(
                          (detail, index) => (
                            <div className="w-[212px]" key={detail.id}>
                              <input
                                type="text"
                                placeholder={detail.name}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={detail.inputValue}
                                onChange={(e) =>
                                  handleTransportationChange(
                                    index,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )
                        )}
                      </div>

                      {/* Middle Column */}
                      <div className="space-y-2 flex flex-col">
                        <div className="flex items-center gap-2">
                          <Select
                            value={tab[index]?.form.paymentType} // Bind to state
                            onChange={
                              (e) =>
                                handleFormChange(
                                  0,
                                  "paymentType",
                                  e.target.value
                                ) // Handle change
                            }
                            className="w-[150px] text-sm"
                            size="small"
                          >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="cheque">Cheque</MenuItem>
                            {banks?.map((item) => (
                              <MenuItem value={item.bankName}>
                                {item.bankName}
                              </MenuItem>
                            ))}
                          </Select>
                        </div>

                        <Button
                          variant="outlined"
                          size="small"
                          className="text-sm flex items-center w-[220px] justify-start"
                          onClick={() => {
                            // Logic to add description if needed
                          }}
                        >
                          <AddIcon className="w-4 h-4 mr-1" />
                          ADD DESCRIPTION
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          className="text-sm flex items-center w-[150px] justify-start"
                          onClick={() => {
                            // Logic to add image if needed
                          }}
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          ADD IMAGE
                        </Button>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col gap-3 w-full items-end">
                        <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                          {/* Additional Charges Section */}
                          {allTransactionSettings?.additionalCharges?.map(
                            (charge, index1) => (
                              <React.Fragment key={charge.name}>
                                <span className="text-sm text-right">
                                  {charge.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    className="w-[100px] p-2 border border-gray-300 rounded-sm text-sm"
                                    value={
                                      tab[index]?.form.charges?.[index1]
                                        ?.value || ""
                                    }
                                    onChange={(e) =>
                                      handleChargeChange(e, index1)
                                    }
                                    placeholder="Amount"
                                  />
                                  <select
                                    className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                                    value={
                                      tab[index]?.form.charges?.[index1]
                                        ?.taxRate || ""
                                    }
                                    onChange={(e) =>
                                      handleTaxRateChange(e, index1)
                                    }
                                  >
                                    <option value="">Select Tax Rate</option>
                                    {(profile?.country === "India"
                                      ? profile?.taxRates
                                      : profile?.taxRates
                                    ).map((rate) => (
                                      <option key={rate._id} value={rate._id}>
                                        {rate.name} ({rate.rate}%)
                                      </option>
                                    ))}
                                  </select>
                                  <span className="w-[100px] text-sm">
                                    {tab[index]?.form.charges?.[index1]
                                      ?.totalWithTax || 0}
                                  </span>
                                </div>
                              </React.Fragment>
                            )
                          )}

                          {/* Totals and Balance Section */}
                          <span className="text-sm text-right">
                            Items Total
                          </span>
                          <input
                            type="text"
                            className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                            value={getTotalForField(
                              tab[index]?.form.items,
                              "amount"
                            )}
                            readOnly
                          />

                          <span className="text-sm text-right">
                            Charges Total
                          </span>
                          <input
                            type="text"
                            className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                            value={
                              tab[index]?.form.charges
                                ? tab[index]?.form.charges
                                    .reduce(
                                      (total, charge) =>
                                        total +
                                        (parseFloat(charge.totalWithTax) || 0),
                                      0
                                    )
                                    .toFixed(2)
                                : "0.00"
                            }
                            readOnly
                          />

                          <span className="text-sm text-right">
                            Grand Total
                          </span>
                          <input
                            type="text"
                            className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                            value={calculateGrandTotal(index)}
                            readOnly
                          />

                          <div className="col-span-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="received"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsChecked(checked);
                                setTabs((prevTabs) =>
                                  prevTabs.map((tab, index2) =>
                                    index2 === index
                                      ? {
                                          ...tab,
                                          form: {
                                            ...tab.form,
                                            receivedAmount: checked
                                              ? calculateGrandTotal(index)
                                              : 0,
                                            balanceAmount: checked
                                              ? 0
                                              : calculateGrandTotal(index),
                                          },
                                        }
                                      : tab
                                  )
                                );
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">Received</span>
                          </div>

                          <span className="text-sm text-right">
                            Received Amount
                          </span>
                          <input
                            type="text"
                            className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                            value={tabs[index]?.form.receivedAmount}
                            onChange={(e) => {
                              if (isChecked) return; // Agar checkbox checked hai, to manual change allow na ho
                              const newReceivedAmount =
                                parseFloat(e.target.value) || 0;
                              setTabs((prevTabs) =>
                                prevTabs.map((tab, index2) =>
                                  index2 === index
                                    ? {
                                        ...tab,
                                        form: {
                                          ...tab.form,
                                          receivedAmount: newReceivedAmount,
                                          balanceAmount:
                                            calculateGrandTotal(index) -
                                            newReceivedAmount,
                                        },
                                      }
                                    : tab
                                )
                              );
                            }}
                            disabled={isChecked} // Agar checkbox checked hai to disable input
                          />

                          <span className="text-sm text-right">
                            Balance Amount
                          </span>
                          <input
                            type="text"
                            className="w-[150px] p-2 border border-gray-300 rounded-sm text-sm"
                            value={
                              calculateGrandTotal(index) -
                              tabs[index]?.form?.receivedAmount
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </>
              ))}
              <div className="fixed bottom-0 left-0 right-0 flex justify-end items-center gap-2 p-4 bg-white border-t">
                <Button
                  variant="outlined"
                  className="text-blue-500 hover:bg-blue-50"
                  onClick={() => {
                    /* handle share */
                  }}
                >
                  Share
                </Button>
                <Button
                  variant="contained"
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={(e) => handleSubmit(e)}
                  disabled={!isUnique || !isPartyNameUnique} // Disable if any is false
                >
                  Save
                </Button>
              </div>
            </Paper>

            <Popover
              open={Boolean(itemPopover)}
              anchorEl={itemPopover}
              onClose={handleCloseItemPopover}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Box sx={{ p: 2, maxWidth: 600 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: "0.75rem" }}>ITEM</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>
                          SALE PRICE
                        </TableCell>
                        {allTransactionSettings?.itemsTable
                          ?.displayPurchasePrice && (
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            PURCHASE PRICE
                          </TableCell>
                        )}
                        <TableCell sx={{ fontSize: "0.75rem" }}>
                          STOCK
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>
                          LOCATION
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items?.map((item) => (
                        <TableRow
                          key={item.id}
                          onClick={() =>
                            handleItemSelect(activeTab, selectedRowId, item)
                          }
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {item.itemName}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {item.salePrice}
                          </TableCell>
                          {allTransactionSettings?.itemsTable
                            ?.displayPurchasePrice && (
                            <TableCell sx={{ fontSize: "0.75rem" }}>
                              {item.purchasePrice}
                            </TableCell>
                          )}
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {item.minStockToMaintain}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>
                            {item.location}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Popover>
            <AddPartyModal
              isOpen={addPartyNew}
              onClose={() => setAddPartyNew(false)}
              handleParty={handleParty}
            />
          </Box>
        </>
      )}
    </>
  );
}
