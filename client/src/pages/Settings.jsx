import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import PrintSettingPage from "./PrintSettings/PrintSettingPage.jsx";
import GeneralSettings from "./Settings/GeneralSettings.jsx";
import ItemSettings from "./Settings/ItemSettings.jsx";
import GSTSettings from "./Settings/GSTSettings.jsx";
import PartySettings from "./Settings/PartySettings.jsx";
import TransactionMessage from "./Settings/TransactionMessage.jsx";
import TransactionSettings from "./Settings/TransactionSettings.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addGeneralSettings,
  getGeneralSettings,
  addTransactionSettings,
  getTransactionSettings,
  addPartySettings,
  getPartySettings,
  getTransactionMessageSettings,
  addTransactionMessageSettings,
  addPrintSettings,
  getPrintSettings,
  getThermalPrintSettings,
} from "../Redux/settingsSlice.js";
import { jwtDecode } from "jwt-decode";
import { serviceUrl } from "../Services/url.js";

const Settings = () => {
  const [activePage, setActivePage] = useState("GENERAL");
  const dispatch = useDispatch();
  const {
    allGeneralSettings,
    isLoading,
    error,
    allTransactionSettings,
    allTransactionMessageSettings,
    allPartySettings,
    allPrintSettings,
    allThermalPrintSettings,
  } = useSelector((state) => state.settings);

  const [transactionChanged, setTransactionChanged] = useState(false);
  const [email, setEmail] = useState(null);

  const [gstSettings, setGstSettings] = useState({
    taxRates: [],
    taxGroups: [],
    gstEnabled: false,
    hsnEnabled: false,
    additionalCess: false,
    reverseCharge: false,
    placeOfSupply: false,
    compositeScheme: false,
    tcsEnabled: false,
    tdsEnabled: false,
  });
  const [transactionMessageSettings, setTransactionMessageSettings] = useState({
    messageType: "Sales Transaction",
    sendSMS: false,
    sendCopy: false,
    transactionType: "Sales Transaction",
    whatsappLoggedIn: false,
    messageTemplate: {
      greeting: "Greetings from [Firm_Name]",
      intro:
        "We are pleased to have you as a valuable customer. Please find the details of your transaction.",
      transactionLabel: "[Transaction_Type] :",
      invoiceAmount: "Invoice Amount: [Invoice_Amount]",
      balance: "Balance: [Transaction_Balance]",
      thanks: "Thanks for doing business with us.",
      regards: "Regards,",
      firmName: "[Firm_Name]",
    },
    variables: {
      firmName: "NewCompany",
      transactionType: "Sale Invoice",
      invoiceAmount: "792",
      balance: "0",
    },
  });

  const [generalSettings, setGeneralSettings] = useState({
    enablePasscode: false,
    passcode: "",
    confirmPasscode: "",
    businessCurrency: "USD",
    amount: "0.00",
    gstnumber: false,
    multiFirm: false,
    company: "DEFAULT",
    autoBackup: false,
    auditTrail: false,
    screenZoom: 100,
    showPasscodeDialog: false,
    // Additional transactions
    estimateQuotation: false,
    salePurchaseOrder: false,
    otherIncome: false,
    fixedAssets: false,
    deliveryChallan: false,
    goodsReturnOnDeliveryChallan: false,
    printAmountInDeliveryChallan: false,
    // Godown management
    godownManagement: false,
    email: "",
  });

  const [transactionSettings, setTransactionSettings] = useState({
    header: {
      invoiceBillNo: true,
      addTimeOnTransactions: false,
      cashSaleByDefault: false,
      billingNameOfParties: false,
      customersPODetails: false,
    },
    itemsTable: {
      inclusiveExclusiveTax: true,
      displayPurchasePrice: true,
      showLastFiveSalePrice: false,
      freeItemQuantity: false,
      count: false,
    },
    taxesAndTotals: {
      transactionWiseTax: false,
      transactionWiseDiscount: false,
      roundOffTotal: true,
      roundingMethod: "nearest",
      roundingValue: "1",
    },
    moreFeatures: {
      eWayBillNo: false,
      quickEntry: false,
      doNotShowInvoicePreview: false,
      enablePasscodeForEdit: false,
      discountDuringPayments: false,
      linkPaymentsToInvoices: false,
      dueDatesAndPaymentTerms: false,
      showProfitOnSaleInvoice: false,
    },
    transactionPrefixes: {
      firm: "",
      sale: "none",
      creditNote: "none",
      deliveryChallan: "none",
      paymentIn: "none",
    },
  });

  const [partySettings, setPartySettings] = useState({
    partyGrouping: false,
    shippingAddress: false,
    enablePaymentReminder: true,
    paymentReminderDays: 1,
    reminderMessage: {
      additionalMessage: "",
      defaultMessage:
        "If you have already made the payment, kindly ignore this message.",
    },
    additionalFields: [
      {
        enabled: false,
        fieldName: "",
        showInPrint: false,
        type: "text", // For field 4, this would be "date"
      },
      {
        enabled: false,
        fieldName: "",
        showInPrint: false,
        type: "text",
      },
      {
        enabled: false,
        fieldName: "",
        showInPrint: false,
        type: "text",
      },
      {
        enabled: false,
        fieldName: "",
        showInPrint: false,
        type: "date",
      },
    ],
    loyaltyPoints: {
      enabled: true,
    },
  });

  const [invoiceData, setInvoiceData] = useState({
    printer: "regular-printer",
    currentTheme: 1,
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
    items: [
      {
        name: "ITEM 1",
        hsn: "1234",
        quantity: 1.1,
        pricePerUnit: 10.0,
        discount: 0.1,
        gst: 0.5,
        amount: 11.4,
      },
      {
        name: "ITEM 2",
        hsn: "6325",
        quantity: 1.1,
        pricePerUnit: 30.0,
        discount: 0.6,
        gst: 1.4,
        amount: 34.4,
      },
    ],
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
  const [selectedTheme, setSelectedTheme] = useState("theme-1");

  const [printerSettings, setPrinterSettings] = useState({
    pageSize: "4-inch",
    makeDefault: false,
    useTextStyling: true,
    autoCutPaper: false,
    openCashDrawer: false,
    extraLines: 0,
    numberOfCopies: 1,
    colors: "default",
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    includeLogo: false,
    address: "",
    email: "",
    phone: "",
    gstin: "",
  });

  const [itemTableSettings, setItemTableSettings] = useState({
    showSNo: true,
    showHSN: true,
    showUOM: true,
    showMRP: true,
    showDescription: true,
    showBatch: true,
    showExpiry: true,
    showMfg: true,
    showSize: true,
    showModelNo: true,
    showSerialNo: true,
  });

  const [totalsAndTaxes, setTotalsAndTaxes] = useState({
    showTotalQuantity: true,
    showAmountDecimal: true,
    showReceivedAmount: true,
    showBalance: true,
    showCurrentBalance: false,
    showTaxDetails: true,
    showYouSaved: true,
    showAmountGrouping: true,
    amountLanguage: "indian",
  });

  const [footerSettings, setFooterSettings] = useState({
    showPrintDescription: true,
  });

  // Handler functions to update states
  const handlePrinterSettingsChange = (field, value) => {
    setPrinterSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemTableSettingsChange = (field, value) => {
    setItemTableSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleTotalsAndTaxesChange = (field, value) => {
    setTotalsAndTaxes((prev) => ({ ...prev, [field]: value }));
  };

  const handleFooterSettingsChange = (field, value) => {
    setFooterSettings((prev) => ({ ...prev, [field]: value }));
  };

  const navigate = useNavigate();

  // Initialize GST settings based on country and fetch tax rates
  useEffect(() => {
    const initializeGSTSettings = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Fetch country information
          const countryResponse = await axios.get(
            `${serviceUrl}/auth/getCountry`,
            {
              params: { email: decoded.email },
            }
          );

          const country = countryResponse.data.country;
          const countryVATRates = {
            UAE: 5,
            OMAN: 5,
            BAHRAIN: 10,
            "SAUDI ARABIA": 15,
          };
          const taxRatesResponse = await axios.get(
            `${serviceUrl}/settings/getTaxRates`,
            {
              params: { email: decoded.email },
            }
          );

          let taxRates = [];
          if (
            taxRatesResponse.data.taxRates &&
            taxRatesResponse.data.taxRates.length > 0
          ) {
            taxRates = taxRatesResponse.data.taxRates;
          }

          let taxGroups = [];
          if (
            taxRatesResponse.data.taxGroups &&
            taxRatesResponse.data.taxGroups.length > 0
          ) {
            taxGroups = taxRatesResponse.data.taxGroups;
          }

          setGstSettings((prev) => ({
            ...prev,
            taxRates,
            taxGroups,
          }));
        } catch (error) {
          console.error("Error initializing GST settings:", error);
        }
      }
    };

    initializeGSTSettings();
  }, []);

  // Decode token to get email
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

  // Fetch settings for logged-in email
  useEffect(() => {
    if (email) {
      dispatch(getGeneralSettings(email));
      dispatch(getTransactionSettings(email));
      dispatch(getPartySettings(email));
      dispatch(getTransactionMessageSettings(email));
      dispatch(getPrintSettings(email));
      dispatch(getThermalPrintSettings(email));
    }
  }, [email, dispatch]);

  // Update state with fetched general settings
  useEffect(() => {
    if (allGeneralSettings) {
      setGeneralSettings(allGeneralSettings);
    }
  }, [allGeneralSettings]);

  // Update state with fetched transaction settings
  useEffect(() => {
    if (allTransactionSettings) {
      setTransactionSettings(allTransactionSettings);
    }
  }, [allTransactionSettings]);

  useEffect(() => {
    if (allPartySettings) {
      setPartySettings(allPartySettings);
    }
  }, [allPartySettings]);
  useEffect(() => {
    if (allTransactionMessageSettings) {
      setTransactionMessageSettings(allTransactionMessageSettings);
    }
  }, [allTransactionMessageSettings]);

  useEffect(() => {
    if (allPrintSettings) {
      setInvoiceData(allPrintSettings);
    }
  }, [allPrintSettings]);

  useEffect(() => {
    if (allThermalPrintSettings) {
      setSelectedTheme(allThermalPrintSettings.theme || "theme-1");
      setPrinterSettings({
        pageSize: allThermalPrintSettings.printerSettings.pageSize || "4-inch",
        makeDefault:
          allThermalPrintSettings.printerSettings.makeDefault || false,
        useTextStyling:
          allThermalPrintSettings.printerSettings.useTextStyling || true,
        autoCutPaper:
          allThermalPrintSettings.printerSettings.autoCutPaper || false,
        openCashDrawer:
          allThermalPrintSettings.printerSettings.openCashDrawer || false,
        extraLines: allThermalPrintSettings.printerSettings.extraLines || 0,
        numberOfCopies:
          allThermalPrintSettings.printerSettings.numberOfCopies || 1,
        colors: allThermalPrintSettings.printerSettings.colors || "default",
      });
      setCompanyInfo({
        companyName: allThermalPrintSettings.companyInfo.companyName || "",
        includeLogo: allThermalPrintSettings.companyInfo.includeLogo || false,
        address: allThermalPrintSettings.companyInfo.address || "",
        email: allThermalPrintSettings.companyInfo.email || "",
        phone: allThermalPrintSettings.companyInfo.phone || "",
        gstin: allThermalPrintSettings.companyInfo.gstin || "",
      });
      setItemTableSettings({
        showSNo: allThermalPrintSettings.itemTableSettings.showSNo || true,
        showHSN: allThermalPrintSettings.itemTableSettings.showHSN || true,
        showUOM: allThermalPrintSettings.itemTableSettings.showUOM || true,
        showMRP: allThermalPrintSettings.itemTableSettings.showMRP || true,
        showDescription:
          allThermalPrintSettings.itemTableSettings.showDescription || true,
        showBatch: allThermalPrintSettings.itemTableSettings.showBatch || true,
        showExpiry:
          allThermalPrintSettings.itemTableSettings.showExpiry || true,
        showMfg: allThermalPrintSettings.itemTableSettings.showMfg || true,
        showSize: allThermalPrintSettings.itemTableSettings.showSize || true,
        showModelNo:
          allThermalPrintSettings.itemTableSettings.showModelNo || true,
        showSerialNo:
          allThermalPrintSettings.itemTableSettings.showSerialNo || true,
      });
      setTotalsAndTaxes({
        showTotalQuantity:
          allThermalPrintSettings.totalsAndTaxes.showTotalQuantity || true,
        showAmountDecimal:
          allThermalPrintSettings.totalsAndTaxes.showAmountDecimal || true,
        showReceivedAmount:
          allThermalPrintSettings.totalsAndTaxes.showReceivedAmount || true,
        showBalance: allThermalPrintSettings.totalsAndTaxes.showBalance || true,
        showCurrentBalance:
          allThermalPrintSettings.totalsAndTaxes.showCurrentBalance || false,
        showTaxDetails:
          allThermalPrintSettings.totalsAndTaxes.showTaxDetails || true,
        showYouSaved:
          allThermalPrintSettings.totalsAndTaxes.showYouSaved || true,
        showAmountGrouping:
          allThermalPrintSettings.totalsAndTaxes.showAmountGrouping || true,
        amountLanguage:
          allThermalPrintSettings.totalsAndTaxes.amountLanguage || "indian",
      });
      setFooterSettings({
        showPrintDescription:
          allThermalPrintSettings.footerSettings.showPrintDescription || true,
      });
    }
  }, [allThermalPrintSettings]);

  const handleTransactionSettingsChange = (section, field, value) => {
    setTransactionSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleGSTSettingsChange = (updates) => {
    setGstSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const onPartySettingsChange = (updatedSettings) => {
    setPartySettings(updatedSettings);
  };

  const handleAddTaxRates = async (newTaxRates) => {
    try {
      const payload = {
        email,
        taxRates: newTaxRates.taxRates,
        taxGroups: newTaxRates.taxGroups,
      };
      const response = await axios.post(
        `${serviceUrl}/settings/addTaxRates`,
        payload
      );

      console.log(newTaxRates.taxGroups, "This is New Tax Group");
      setGstSettings((prev) => ({
        ...prev,
        taxRates: newTaxRates.taxRates,
        taxGroups: newTaxRates.taxGroups,
      }));

      console.log("Tax rates added successfully:", response.data);
    } catch (error) {
      console.error(
        "Error adding tax rates:",
        error.response?.data || error.message
      );
    }
  };

  const menuItems = [
    { label: "GENERAL", id: "GENERAL" },
    { label: "TRANSACTION", id: "TRANSACTION" },
    { label: "PRINT", id: "PRINT" },
    { label: "TAXES & GST", id: "TAXES_GST" },
    { label: "TRANSACTION MESSAGE", id: "TRANSACTION_MESSAGE" },
    { label: "PARTY", id: "PARTY" },
    { label: "ITEM", id: "ITEM" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "GENERAL":
        return (
          <GeneralSettings
            generalSettings={generalSettings}
            setGeneralSettings={setGeneralSettings}
          />
        );
      case "ITEM":
        return <ItemSettings />;
      case "TRANSACTION":
        return (
          <TransactionSettings
            settings={transactionSettings}
            onSettingsChange={handleTransactionSettingsChange}
            setTransactionChanged={setTransactionChanged}
            transactionChanged={transactionChanged}
          />
        );
      case "TAXES_GST":
        return (
          <GSTSettings
            settings={gstSettings}
            onSettingsChange={handleGSTSettingsChange}
            onSave={handleAddTaxRates}
          />
        );
      case "PRINT":
        return (
          <PrintSettingPage
            invoiceData={invoiceData}
            // setActiveTab={setActiveTab}
            setInvoiceData={setInvoiceData}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            printerSettings={printerSettings}
            handlePrinterSettingsChange={handlePrinterSettingsChange}
            companyInfo={companyInfo}
            handleCompanyInfoChange={handleCompanyInfoChange}
            itemTableSettings={itemTableSettings}
            handleItemTableSettingsChange={handleItemTableSettingsChange}
            totalsAndTaxes={totalsAndTaxes}
            handleTotalsAndTaxesChange={handleTotalsAndTaxesChange}
            footerSettings={footerSettings}
            handleFooterSettingsChange={handleFooterSettingsChange}
          />
        ); // Changed to use PrintSettingPage
      case "PARTY":
        return (
          <PartySettings
            settings={partySettings}
            onSettingsChange={onPartySettingsChange}
          />
        );
      case "TRANSACTION_MESSAGE":
        return (
          <TransactionMessage
            transactionMessageSettings={transactionMessageSettings}
            setTransactionMessageSettings={setTransactionMessageSettings}
          />
        );
      default:
        return (
          <div className="p-6 text-gray-600">Content for {activePage}</div>
        );
    }
  };
  useEffect(() => {
    if (email) {
      dispatch(getTransactionSettings(email));
    }
  }, [transactionChanged]);

  const handleBack = async () => {
    if (email) {
      const newInvoiceData = {
        printer: invoiceData.printer, // Use value from invoiceData state
        currentTheme: invoiceData.currentTheme, // Use value from invoiceData state
        companyName: invoiceData.companyName, // Use value from invoiceData state
        phone: invoiceData.phone, // Use value from invoiceData state
        address: invoiceData.address, // Use value from invoiceData state
        email: invoiceData.email, // Use value from invoiceData state
        trnOnSale: invoiceData.trnOnSale, // Use value from invoiceData state
        paperSize: invoiceData.paperSize, // Use value from invoiceData state
        orientation: invoiceData.orientation, // Use value from invoiceData state
        companyNameTextSize: invoiceData.companyNameTextSize, // Use value from invoiceData state
        invoiceTextSize: invoiceData.invoiceTextSize, // Use value from invoiceData state
        printOriginalDuplicate: invoiceData.printOriginalDuplicate, // Use value from invoiceData state
        printOriginalForRecipient: invoiceData.printOriginalForRecipient, // Use value from invoiceData state
        printDuplicate: invoiceData.printDuplicate, // Use value from invoiceData state
        printTriplicate: invoiceData.printTriplicate, // Use value from invoiceData state
        printOriginalForRecipientLabel:
          invoiceData.printOriginalForRecipientLabel, // Use value from invoiceData state
        printDuplicateLabel: invoiceData.printDuplicateLabel, // Use value from invoiceData state
        printTriplicateLabel: invoiceData.printTriplicateLabel, // Use value from invoiceData state
        descriptionFooter: invoiceData.descriptionFooter, // Use value from invoiceData state
        invoiceDetails: invoiceData.invoiceDetails, // Use value from invoiceData state
        billTo: invoiceData.billTo, // Use value from invoiceData state
        shipTo: invoiceData.shipTo, // Use value from invoiceData state
        items: invoiceData.items, // Use value from invoiceData state
        taxDetails: invoiceData.taxDetails, // Use value from invoiceData state
        summary: invoiceData.summary, // Use value from invoiceData state
        terms: invoiceData.terms, // Use value from invoiceData state
        bankDetails: invoiceData.bankDetails, // Use value from invoiceData state
        qrCodeSrc: invoiceData.qrCodeSrc, // Use value from invoiceData state
        totalItemQuantityChecked: invoiceData.totalItemQuantityChecked, // Use value from invoiceData state
        amountWithDecimalChecked: invoiceData.amountWithDecimalChecked, // Use value from invoiceData state
        receivedAmountChecked: invoiceData.receivedAmountChecked, // Use value from invoiceData state
        balanceAmountChecked: invoiceData.balanceAmountChecked, // Use value from invoiceData state
        currentBalanceOfPartyChecked: invoiceData.currentBalanceOfPartyChecked, // Use value from invoiceData state
        taxDetailsChecked: invoiceData.taxDetailsChecked, // Use value from invoiceData state
        youSavedChecked: invoiceData.youSavedChecked, // Use value from invoiceData state
        printAmountWithGroupingChecked:
          invoiceData.printAmountWithGroupingChecked, // Use value from invoiceData state
        printDescription: invoiceData.printDescription, // Use value from invoiceData state
        customerSignature: invoiceData.customerSignature, // Use value from invoiceData state
        customerSignatureTitle: invoiceData.customerSignatureTitle, // Use value from invoiceData state
        printAcknowledgement: invoiceData.printAcknowledgement, // Use value from invoiceData state
        paymentMode: invoiceData.paymentMode, // Use value from invoiceData state
        selectedTheme: selectedTheme, // Use value from selectedTheme state
        printerSettings: printerSettings, // Use value from printerSettings state
        companyInfo: companyInfo, // Use value from companyInfo state
        itemTableSettings: itemTableSettings, // Use value from itemTableSettings state
        totalsAndTaxes: totalsAndTaxes, // Use value from totalsAndTaxes state
        footerSettings: footerSettings, // Use value from footerSettings state
      };
      console.log(allTransactionSettings, "This is All Transaction Settings");
      await dispatch(addGeneralSettings({ ...generalSettings, email }));
      const { additionalFields, additionalCharges, transportationDetails } = allTransactionSettings || {};

      // Merge additionalFields into transactionSettings
      const updatedTransactionSettings = {
        ...transactionSettings,
        ...additionalFields,
        ...additionalCharges, // additionalFields ko merge kar diya
        ...transportationDetails, // additionalFields ko merge kar diya
        email,
      };
      await dispatch(addTransactionSettings(updatedTransactionSettings));
      await dispatch(addPartySettings({ ...partySettings, email }));
      await dispatch(
        addTransactionMessageSettings({ ...transactionMessageSettings, email })
      );
      await dispatch(addPrintSettings({ ...newInvoiceData, email }));
    }
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-[#1a1f37] flex flex-col">
        <div className="flex items-center gap-[43px] px-6 py-4 text-white border-b border-gray-700">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <span className="w-5 h-5">
              <ChevronLeft />
            </span>
          </button>
          <h1 className="text-xl font-normal">Settings</h1>
        </div>

        <nav className="flex-1 pt-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`px-6 py-3 cursor-pointer transition-colors mx-3 my-1 ${
                activePage === item.id
                  ? "bg-white text-black rounded-lg"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span
                className={`text-sm ${
                  activePage === item.id ? "font-medium" : "font-normal"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="bg-white rounded-lg shadow-sm">{renderContent()}</div>
        </div>
      </div>

      <Link to="/">
        <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"></button>
      </Link>
    </div>
  );
};

export default Settings;
