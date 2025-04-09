import React, { useCallback, useEffect, useState, useRef } from "react";
import { QrCode } from "lucide-react";
import { Rnd } from "react-rnd"; // For resizable and draggable components
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getBusinessProfile } from "../../Redux/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Add this import if missing

const Theme1Base = () => {
  const location = useLocation();
  const { invoiceData, isEditable, setInvoiceData } = location?.state;
  const { businessProfile } = useSelector((state) => state.auth);
  const [email, setEmail] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [styles, setStyles] = useState({
    fontSize: "text-sm",
    fontFamily: "font-sans",
    headerSize: "text-xl",
    subheaderSize: "text-base",
    spacing: "space-y-4",
    tableFontSize: "text-xs",
    headerBgColor: "bg-gray-100",
    headerTextColor: "text-gray-700",
    sectionHeaderColor: "text-gray-700",
    borderColor: "border-gray-300",
    accentColor: "bg-gray-50",
    pageWidth: "max-w-3xl",
    pageMargin: "mx-auto",
    pagePadding: "p-4",
  });
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
    dispatch(getBusinessProfile(email));
  }, [email, dispatch]);

  const [sections, setSections] = useState([
    {
      id: "header",
      title: "Header",
      component: "header",
      isVisible: false,
      x: 0,
      y: 0,
      width: 400,
      height: 50,
    },
    {
      id: "invoice-details",
      title: "Invoice Details",
      component: "invoiceDetails",
      isVisible: false,
      x: 0,
      y: 60,
      width: 400,
      height: 150,
    },
    {
      id: "bill-to",
      title: "Bill To",
      component: "billTo",
      isVisible: false,
      x: 0,
      y: 220,
      width: 200,
      height: 100,
    },
    {
      id: "ship-to",
      title: "Ship To",
      component: "shipTo",
      isVisible: false,
      x: 220,
      y: 220,
      width: 200,
      height: 100,
    },
    {
      id: "transportationDetails",
      title: "Transportation Details",
      component: "transportationDetails",
      isVisible: false,
      x: 220,
      y: 220,
      width: 400,
      height: 100,
    },
    {
      id: "items",
      title: "Items Table",
      component: "items",
      isVisible: false,
      x: 0,
      y: 330,
      width: 600,
      height: 200,
    },
    {
      id: "tax-summary",
      title: "Tax Summary",
      component: "summary",
      isVisible: true,
      x: 0,
      y: 540,
      width: 300,
      height: 100,
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      component: "terms",
      isVisible: false,
      x: 310,
      y: 540,
      width: 300,
      height: 100,
    },
    {
      id: "bank-details",
      title: "Bank Details",
      component: "bankDetails",
      isVisible: true,
      x: 0,
      y: 650,
      width: 300,
      height: 100,
    },
    {
      id: "acknowledgement",
      title: "Acknowledgement",
      component: "acknowledgement",
      isVisible: false,
      x: 310,
      y: 650,
      width: 300,
      height: 100,
    },
  ]);

  const toggleSectionVisibility = (sectionId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

  const updateSectionPosition = useCallback(
    (id, x, y, width, height) => {
      setSections(
        sections.map((section) =>
          section.id === id ? { ...section, x, y, width, height } : section
        )
      );
    },
    [sections]
  );

  const CompanyLogo = ({ logo, onUpload }) => {
    const fileInputRef = useRef(null);

    const handleClick = (e) => {
      e.stopPropagation(); // Prevent unintended drag events
      fileInputRef.current?.click();
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    };

    const handleFileUpload = (file) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log("File uploaded successfully");
          onUpload(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        console.error("Invalid file type");
      }
    };

    const handleFileChange = (e) => {
      console.log("File input changed", e.target.files);
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };

    return (
      <div
        className="w-24 h-24 flex-shrink-0 cursor-pointer"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        {logo ? (
          <img
            src={logo}
            alt="Company Logo"
            className="w-full h-full object-contain border rounded"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 border rounded flex flex-col items-center justify-center text-gray-500 text-xs text-center p-2">
            <svg
              className="w-8 h-8 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Upload Company Logo</span>
          </div>
        )}
      </div>
    );
  };

  const updateInvoiceLogo = (logoUrl) => {
    setInvoiceData((prev) => ({
      ...prev,
      companyLogo: logoUrl,
    }));
  };

  const renderSection = (section) => {
    if (!section.isVisible) return null;

    switch (section.component) {
      case "header":
        return (
          <div className="text-center border p-2">
            <h1 className="font-bold">Tax Invoice</h1>
          </div>
        );

      case "invoiceDetails":
        return (
          <div className="grid grid-cols-2 gap-2 mt-4 border pb-4">
            <div className="border-r p-2">
              <div className="flex items-start gap-4 mb-4">
                {/* Logo with pointer-events-auto to override parent's pointer-events-none */}
                <div
                  className="pointer-events-none"
                  style={{
                    // This div blocks Rnd events
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="pointer-events-auto"
                    style={{
                      // This inner div re-enables events for logo
                      pointerEvents: "auto",
                    }}
                  >
                    <CompanyLogo
                      logo={invoiceData.companyLogo}
                      onUpload={updateInvoiceLogo}
                    />
                  </div>
                </div>

                {/* Company Details */}
                <div className="flex-grow">
                  <h3 className="font-medium border-b pb-1 mb-2">
                    {invoiceData.companyName}
                  </h3>
                  {invoiceData.billingName && (
                    <p className="border-b py-1">
                      Billing Name: {invoiceData.billingName}
                    </p>
                  )}
                  <p className="border-b py-1">Phone: {invoiceData.phone}</p>
                  {invoiceData.address && (
                    <p className="border-b py-1">
                      Address: {invoiceData.address}
                    </p>
                  )}
                  {invoiceData.email && (
                    <p className="border-b py-1">Email: {invoiceData.email}</p>
                  )}
                  {invoiceData.trnOnSale && (
                    <p className="border-b py-1">
                      GSTIN: {invoiceData.trnOnSale}
                    </p>
                  )}

                  {/* Firm Additional Fields */}
                  {invoiceData.additionalFields.firm.map((field, index) => (
                    <p key={index} className="border-b py-1">
                      {field.name}: {field.value}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2">
              <h3 className="font-medium border-b pb-1 mb-2">
                Invoice Details
              </h3>
              <div className="grid grid-cols-2 gap-1">
                <p className="border p-1">
                  Invoice No.: {invoiceData?.invoiceDetails?.prefix}
                  {invoiceData.invoiceDetails.invoiceNo}
                </p>
                <p className="border p-1">
                  Date: {invoiceData.invoiceDetails.date}
                </p>
                <p className="border p-1">
                  Time: {invoiceData.invoiceDetails.time}
                </p>
                {invoiceData.invoiceDetail?.poDate && (
                  <p className="border p-1">
                    PO Date: {invoiceData.invoiceDetails.poDate}
                  </p>
                )}
                {invoiceData.invoiceDetail?.poNumber && (
                  <p className="border p-1">
                    PO Number: {invoiceData.invoiceDetails.poNumber}
                  </p>
                )}
                {invoiceData.invoiceDetail?.ewaybill && (
                  <p className="border p-1">
                    E-way Bill number: {invoiceData.invoiceDetails.ewaybill}
                  </p>
                )}
                {invoiceData.invoiceDetails?.dynamicInvoiceFields &&
                  Object.entries(
                    invoiceData.invoiceDetails.dynamicInvoiceFields
                  ).map(([key, value], index) => (
                    <p key={index} className="border p-1">
                      {key}: {value}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        );

      case "billTo":
        return (
          <div className="mt-4 border p-4">
            <h3 className="font-medium border-b pb-2 mb-2">Bill To</h3>
            <p className="border-b py-1">
              {invoiceData.billTo.name}, {invoiceData.billTo.address}
            </p>
            <p className="border-b py-1">
              Contact No.: {invoiceData.billTo.contact}
            </p>
          </div>
        );

      case "shipTo":
        return (
          <div className="mt-4 border p-4">
            <h3 className="font-medium border-b pb-2 mb-2">Ship To</h3>
            <p className="border-b py-1">
              {invoiceData.shipTo.name}, {invoiceData.shipTo.address}
            </p>
          </div>
        );

      case "transportationDetails":
        return (
          <>
            {invoiceData.transportationDetails && (
              <div className="w-full border-b">
                <div className="p-4">
                  <h2 className="text-sm font-semibold mb-2">
                    Transportation Details:
                  </h2>
                  <div className="space-y-1">
                    {invoiceData?.transportationDetails?.map(
                      (detail, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{detail.name}:</span>
                          <span className="ml-1">{detail.inputValue}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case "items":
        return (
          <div className="mt-4 border">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-1 border text-left">Item Name</th>
                  <th className="p-1 border text-left">HSN/SAC</th>
                  <th className="p-1 border text-right">Quantity</th>
                  <th className="p-1 border text-right">Price/Unit</th>
                  <th className="p-1 border text-right">Discount</th>
                  <th className="p-1 border text-right">GST</th>
                  <th className="p-1 border text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 border">{item.name}</td>
                    <td className="p-1 border">{item.hsn}</td>
                    {item.freeItemQuantity ? (
                      <td className="p-1 border text-right">
                        {item.quantity} + {item.freeItemQuantity}
                      </td>
                    ) : (
                      <td className="p-1 border text-right">{item.quantity}</td>
                    )}
                    <td className="p-1 border text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {item.pricePerUnit}
                    </td>
                    <td className="p-1 border text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {item.discount}
                    </td>
                    <td className="p-1 border text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {item.gst}
                    </td>
                    <td className="p-1 border text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              {invoiceData.totalItemQuantityChecked && (
                <tfoot>
                  <tr>
                    <td className="p-1 border font-bold text-left" colSpan="2">
                      Total
                    </td>
                    <td className="p-1 border font-bold text-right">
                      {invoiceData.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>
                    <td className="p-1 border font-bold text-right">-</td>
                    <td className="p-1 border font-bold text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {invoiceData.items.reduce(
                        (total, item) => total + item.discount,
                        0
                      )}
                    </td>
                    <td className="p-1 border font-bold text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {invoiceData.items.reduce(
                        (total, item) => total + item.gst,
                        0
                      )}
                    </td>
                    <td className="p-1 border font-bold text-right">
                      {businessProfile?.currencySymbol &&
                        businessProfile?.currencySymbol}{" "}
                      {invoiceData.items.reduce(
                        (total, item) => total + item.amount,
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        );

      case "summary":
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-100 p-3 border">
              <h4 className="font-semibold border-b pb-1 mb-2">
                Invoice Amount In Words
              </h4>
              <p>{invoiceData.summary.amountInWords}</p>
            </div>
            <div className="space-y-2 border p-3">
              <div className="flex justify-between border-b pb-1">
                <span>Sub Total</span>
                <span>
                  {businessProfile?.currencySymbol &&
                    businessProfile?.currencySymbol}{" "}
                  {invoiceData.summary.subTotal}
                </span>
              </div>
              {invoiceData?.additionalCharges?.map((charge) => (
                <div className="flex justify-between border-b pb-1">
                  <span>{charge.name}</span>
                  <span>
                    {businessProfile?.currencySymbol &&
                      businessProfile?.currencySymbol}{" "}
                    {charge.value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-b pb-1">
                <span>Discount</span>
                <span>
                  {businessProfile?.currencySymbol &&
                    businessProfile?.currencySymbol}{" "}
                  {invoiceData.summary.discount}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {businessProfile?.currencySymbol &&
                    businessProfile?.currencySymbol}{" "}
                  {invoiceData.summary.totalAmount}
                </span>
              </div>
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="pt-4 border flex items-start justify-between">
            <div className="pr-4 w-1/2 border-r p-2">
              <h3 className="font-medium border-b pb-1 mb-2">
                Terms & Conditions
              </h3>
              <p>{invoiceData.terms}</p>
            </div>
            {invoiceData.printDescription && (
              <div className="pl-4 w-1/2 p-2">
                <h3 className="font-medium border-b pb-1 mb-2">Description</h3>
                <p>{invoiceData.terms}</p>
              </div>
            )}
          </div>
        );

      case "bankDetails":
        return (
          <div className="grid grid-cols-2 gap-2 mt-4 border">
            <div className="pr-4 p-2 border-r">
              <QrCode className="w-16 h-16 mr-4" />
              <div>
                <h3 className="font-medium border-b pb-1 mb-2">Bank Details</h3>
                <div className="flex flex-col items-start">
                  <p className="border-b py-1">
                    Bank Name: {invoiceData.bankDetails.bankName}
                  </p>
                  <p className="border-b py-1">
                    Bank Account No.: {invoiceData.bankDetails.accountNo}
                  </p>
                  <p className="border-b py-1">
                    Bank IFSC Code: {invoiceData.bankDetails.ifscCode}
                  </p>
                </div>
              </div>
            </div>
            {invoiceData.customerSignature && (
              <div className="pl-4 flex flex-col items-center justify-center border-l p-2">
                <div className="w-20 h-20 bg-gray-200 border mb-2"></div>
                <span>{invoiceData.customerSignatureTitle}</span>
              </div>
            )}
          </div>
        );

      case "acknowledgement":
        return (
          <>
            {invoiceData.printAcknowledgement && (
              <>
                <div className="relative my-4">
                  <div className="border-t border-dotted"></div>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-gray-500 text-sm rotate-90">
                    ✂️
                  </span>
                </div>
                <div className="border mt-4">
                  <div className="border-b text-center py-2">
                    <h3 className="font-medium">Acknowledgement</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4 border p-2">
                      <span className="text-sm font-medium">
                        Company Details:
                      </span>
                      <p className="text-lg font-bold">
                        {invoiceData.companyName}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="border p-2">
                        <h4 className="font-medium border-b pb-1 mb-2">
                          Invoice Details:
                        </h4>
                        <p className="border-b py-1">
                          Invoice No.: {invoiceData.invoiceDetails.invoiceNo}
                        </p>
                        <p className="border-b py-1">
                          Invoice Date: {invoiceData.invoiceDetails.date}
                        </p>
                        <p>
                          Invoice Amount:{" "}
                          {businessProfile?.currencySymbol &&
                            businessProfile?.currencySymbol}{" "}
                          {invoiceData.summary.totalAmount}
                        </p>
                      </div>
                      <div className="border p-2">
                        <h4 className="font-medium border-b pb-1 mb-2">
                          Party Details:
                        </h4>
                        <p className="border-b py-1">
                          {invoiceData.billTo.name}
                        </p>
                        <p>{invoiceData.billTo.address}</p>
                      </div>
                      <div className="border p-2 text-center">
                        <h4 className="font-medium border-b pb-1 mb-2">
                          Receiver's Seal & Sign:
                        </h4>
                        <div className="mt-4 w-20 h-20 border mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const StyleControls = () => {
    const fontSizeOptions = [
      { value: "text-xs", label: "Extra Small" },
      { value: "text-sm", label: "Small" },
      { value: "text-base", label: "Medium" },
      { value: "text-lg", label: "Large" },
    ];

    const fontFamilyOptions = [
      { value: "font-sans", label: "Sans Serif" },
      { value: "font-serif", label: "Serif" },
      { value: "font-mono", label: "Monospace" },
    ];

    const headerSizeOptions = [
      { value: "text-lg", label: "Small Header" },
      { value: "text-xl", label: "Medium Header" },
      { value: "text-2xl", label: "Large Header" },
    ];

    const subheaderSizeOptions = [
      { value: "text-sm", label: "Small Subheader" },
      { value: "text-base", label: "Medium Subheader" },
      { value: "text-lg", label: "Large Subheader" },
    ];

    const spacingOptions = [
      { value: "space-y-2", label: "Compact" },
      { value: "space-y-4", label: "Normal" },
      { value: "space-y-6", label: "Relaxed" },
    ];

    const colorOptions = [
      { value: "gray", label: "Gray" },
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "purple", label: "Purple" },
      { value: "pink", label: "Pink" },
      { value: "orange", label: "Orange" },
    ];

    const getColorClasses = (color) => {
      const colorMap = {
        gray: {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-300",
          header: "text-gray-700",
          accent: "bg-gray-50",
        },
        blue: {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-300",
          header: "text-blue-700",
          accent: "bg-blue-50",
        },
        green: {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-300",
          header: "text-green-700",
          accent: "bg-green-50",
        },
        purple: {
          bg: "bg-purple-100",
          text: "text-purple-700",
          border: "border-purple-300",
          header: "text-purple-700",
          accent: "bg-purple-50",
        },
        pink: {
          bg: "bg-pink-100",
          text: "text-pink-700",
          border: "border-pink-300",
          header: "text-pink-700",
          accent: "bg-pink-50",
        },
        orange: {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-300",
          header: "text-orange-700",
          accent: "bg-orange-50",
        },
      };
      return colorMap[color];
    };

    const handleColorChange = (e) => {
      const colorClasses = getColorClasses(e.target.value);
      setStyles({
        ...styles,
        headerBgColor: colorClasses.bg,
        headerTextColor: colorClasses.text,
        borderColor: colorClasses.border,
        sectionHeaderColor: colorClasses.header,
        accentColor: colorClasses.accent,
      });
    };

    const pageWidthOptions = [
      { value: "max-w-xl", label: "Extra Small" },
      { value: "max-w-2xl", label: "Small" },
      { value: "max-w-3xl", label: "Medium" },
      { value: "max-w-4xl", label: "Large" },
      { value: "max-w-5xl", label: "Extra Large" },
      { value: "max-w-full", label: "Full Width" },
    ];

    const pageMarginOptions = [
      { value: "mx-auto", label: "Centered", uniqueKey: "centered-margin" },
      {
        value: "mx-0",
        label: "Left Aligned",
        uniqueKey: "left-aligned-margin",
      },
      {
        value: "ml-auto",
        label: "Right Aligned",
        uniqueKey: "right-aligned-margin",
      },
    ];

    const pagePaddingOptions = [
      { value: "p-2", label: "Extra Compact" },
      { value: "p-4", label: "Compact" },
      { value: "p-6", label: "Normal" },
      { value: "p-8", label: "Spacious" },
      { value: "p-12", label: "Extra Spacious" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-xl shadow-md transition"
            onClick={() => navigate(-2)}
          >
            ✖
          </button>
          <h2 className="text-lg font-semibold mb-4">Style Controls</h2>

          {/* Color Theme Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Color Theme
            </label>
            <select
              className="w-full p-2 border rounded"
              onChange={handleColorChange}
              value={styles.headerBgColor.split("-")[1]}
            >
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Body Font Size
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.fontSize}
              onChange={(e) =>
                setStyles({ ...styles, fontSize: e.target.value })
              }
            >
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table Font Size Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Table Font Size
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.tableFontSize}
              onChange={(e) =>
                setStyles({ ...styles, tableFontSize: e.target.value })
              }
            >
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Family Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Font Family
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.fontFamily}
              onChange={(e) =>
                setStyles({ ...styles, fontFamily: e.target.value })
              }
            >
              {fontFamilyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Header Size Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Header Size
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.headerSize}
              onChange={(e) =>
                setStyles({ ...styles, headerSize: e.target.value })
              }
            >
              {headerSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subheader Size Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Subheader Size
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.subheaderSize}
              onChange={(e) =>
                setStyles({ ...styles, subheaderSize: e.target.value })
              }
            >
              {subheaderSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spacing Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Section Spacing
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.spacing}
              onChange={(e) =>
                setStyles({ ...styles, spacing: e.target.value })
              }
            >
              {spacingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Width Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Page Width</label>
            <select
              className="w-full p-2 border rounded"
              value={styles.pageWidth}
              onChange={(e) =>
                setStyles({ ...styles, pageWidth: e.target.value })
              }
            >
              {pageWidthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Page Alignment
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.pageMargin}
              onChange={(e) =>
                setStyles({ ...styles, pageMargin: e.target.value })
              }
            >
              {pageMarginOptions.map((option) => (
                <option key={option.uniqueKey} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Padding Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Page Padding
            </label>
            <select
              className="w-full p-2 border rounded"
              value={styles.pagePadding}
              onChange={(e) =>
                setStyles({ ...styles, pagePadding: e.target.value })
              }
            >
              {pagePaddingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Reordering with Checkboxes */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Section Order</h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle sections visibility and drag to reorder
          </p>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center p-3 bg-white rounded border cursor-move hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={section.isVisible}
                  onChange={() => toggleSectionVisibility(section.id)}
                  className="mr-3 h-4 w-4 rounded border-gray-300"
                />
                {section.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    isEditable && (
      <div className="flex h-[100vh]">
        {/* Style Controls Panel */}
        <div className="w-1/3 bg-gray-50 p-4 rounded-lg overflow-y-auto">
          <StyleControls />
        </div>

        {/* Invoice Preview */}
        <div className="w-2/3 overflow-y-auto">
          <div
            className={`w-full ${styles.pageWidth} ${styles.pageMargin} bg-white shadow-md rounded-lg ${styles.pagePadding} ${styles.fontFamily} ${styles.fontSize} text-gray-700 ${styles.spacing} h-full`}
          >
            {sections.map((section) => (
              <Rnd
                key={section.id}
                size={{
                  width: section.width,
                  height: section.height,
                }}
                position={{ x: section.x, y: section.y }}
                onDragStop={(e, d) =>
                  updateSectionPosition(
                    section.id,
                    d.x,
                    d.y,
                    section.width,
                    section.height
                  )
                }
                onResizeStop={(e, direction, ref, delta, position) => {
                  const newWidth = ref.clientWidth;
                  const newHeight = ref.clientHeight;

                  updateSectionPosition(
                    section.id,
                    position.x,
                    position.y,
                    newWidth,
                    newHeight
                  );
                }}
                bounds="parent"
                enableResizing={{
                  bottom: true,
                  bottomLeft: true,
                  bottomRight: true,
                  left: true,
                  right: true,
                  top: true,
                  topLeft: true,
                  topRight: true,
                }}
              >
                <div className="h-full w-full">{renderSection(section)}</div>
              </Rnd>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Theme1Base;
