const mongoose = require('mongoose');

const generalSettingsSchema = new mongoose.Schema({
  email: { type: String },
  enablePasscode: { type: Boolean, default: false },
  passcode: { type: String, default: "" },
  confirmPasscode: { type: String, default: "" },
  businessCurrency: { type: String, default: "USD" },
  amount: { type: String, default: "0.00" },
  gstnumber: { type: Boolean, default: false },
  multiFirm: { type: Boolean, default: false },
  company: { type: String, default: "DEFAULT" },
  autoBackup: { type: Boolean, default: false },
  auditTrail: { type: Boolean, default: false },
  screenZoom: { type: Number, default: 100 },
  showPasscodeDialog: { type: Boolean, default: false },
  // Additional transactions
  estimateQuotation: { type: Boolean, default: false },
  salePurchaseOrder: { type: Boolean, default: false },
  otherIncome: { type: Boolean, default: false },
  fixedAssets: { type: Boolean, default: false },
  deliveryChallan: { type: Boolean, default: false },
  goodsReturnOnDeliveryChallan: { type: Boolean, default: false },
  printAmountInDeliveryChallan: { type: Boolean, default: false },
  // Godown management
  godownManagement: { type: Boolean, default: false }
});

const transactionSettingsSchema = new mongoose.Schema({
  email: { type: String }, // Unique email ID for each user
  header: {
    invoiceBillNo: { type: Boolean, default: true },
    addTimeOnTransactions: { type: Boolean, default: false },
    cashSaleByDefault: { type: Boolean, default: false },
    billingNameOfParties: { type: Boolean, default: false },
    customersPODetails: { type: Boolean, default: false },
  },
  itemsTable: {
    inclusiveExclusiveTax: { type: Boolean, default: true },
    displayPurchasePrice: { type: Boolean, default: true },
    showLastFiveSalePrice: { type: Boolean, default: false },
    freeItemQuantity: { type: Boolean, default: false },
    count: { type: Boolean, default: false },
  },
  taxesAndTotals: {
    transactionWiseTax: { type: Boolean, default: false },
    transactionWiseDiscount: { type: Boolean, default: false },
    roundOffTotal: { type: Boolean, default: true },
    roundingMethod: { type: String, default: "nearest" },
    roundingValue: { type: String, default: "1" },
  },
  moreFeatures: {
    eWayBillNo: { type: Boolean, default: false },
    quickEntry: { type: Boolean, default: false },
    doNotShowInvoicePreview: { type: Boolean, default: false },
    enablePasscodeForEdit: { type: Boolean, default: false },
    discountDuringPayments: { type: Boolean, default: false },
    linkPaymentsToInvoices: { type: Boolean, default: false },
    dueDatesAndPaymentTerms: { type: Boolean, default: false },
    showProfitOnSaleInvoice: { type: Boolean, default: false },
  },
  transactionPrefixes: {
    firm: { type: String, default: "" },
    sale: { type: String, default: "none" },
    creditNote: { type: String, default: "none" },
    deliveryChallan: { type: String, default: "none" },
    paymentIn: { type: String, default: "none" },
  },
  additionalFields: {
    firm: [
      {
        enabled: { type: Boolean, default: false },
        name: { type: String, default: "" },
        value: { type: String, default: "" },
        showInPrint: { type: Boolean, default: false },
      },
    ],
    transaction: [
      {
        enabled: { type: Boolean, default: false },
        name: { type: String, default: "" },
        value: { type: String, default: "" },
        showInPrint: { type: Boolean, default: false },
      },
    ],
  },
  additionalCharges: [
    {
      enabled: { type: Boolean, default: false },
      name: { type: String, default: "Shipping" },
      sac: { type: String, default: "" },
      tax: { type: String, default: "NONE" },
      enableTax: { type: Boolean, default: false },
    },
    {
      enabled: { type: Boolean, default: false },
      name: { type: String, default: "Packaging" },
      sac: { type: String, default: "" },
      tax: { type: String, default: "NONE" },
      enableTax: { type: Boolean, default: false },
    },
    {
      enabled: { type: Boolean, default: false },
      name: { type: String, default: "Adjustment" },
      sac: { type: String, default: "" },
      tax: { type: String, default: "NONE" },
      enableTax: { type: Boolean, default: false },
    },
  ],
  transportationDetails: [
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
    {
      enable: {type: Boolean, default: false},
      value: { type: String, default:""},
      index: {type: Number}
    },
  ]
});

const itemSchema = new mongoose.Schema({
  name: { type: String },
  hsn: { type: String },
  quantity: { type: Number },
  pricePerUnit: { type: Number },
  discount: { type: Number, default: 0 },
  gst: { type: Number },
  amount: { type: Number }
});
const printSettingsSchema = new mongoose.Schema({
  currentTheme: { type: String },
  companyName: { type: String },
  phone: { type: String },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
  trnOnSale: { type: String, default: '' },
  paperSize: {
    type: String,
    enum: ['A4'],
    default: 'A4'
  },
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    default: 'portrait'
  },
  companyNameTextSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'large'
  },
  invoiceTextSize: {
    type: String,
    enum: ['v-small', 'small', 'medium', 'large'],
    default: 'v-small'
  },
  printOriginalDuplicate: { type: Boolean, default: false },
  printOriginalForRecipient: { type: Boolean, default: true },
  printDuplicate: { type: Boolean, default: false },
  printTriplicate: { type: Boolean, default: false },
  printOriginalForRecipientLabel: { type: String, default: 'ORIGINAL FOR RECIPIENT' },
  printDuplicateLabel: { type: String, default: 'DUPLICATE FOR TRANSPORTER' },
  printTriplicateLabel: { type: String, default: 'TRIPLICATE FOR SUPPLIER' },
  descriptionFooter: { type: Boolean, default: false },

  invoiceDetails: {
    invoiceNo: { type: String },
    date: { type: String },
    time: { type: String },
    dueDate: { type: String }
  },

  billTo: {
    name: { type: String },
    address: { type: String },
    contact: { type: String }
  },

  shipTo: {
    name: { type: String },
    address: { type: String }
  },

  items: [itemSchema],

  taxDetails: {
    taxableAmount: { type: Number },
    rate: { type: Number },
    sgstAmount: { type: Number },
    cgstAmount: { type: Number },
    totalTaxAmount: { type: Number }
  },

  summary: {
    subTotal: { type: Number },
    discount: { type: Number },
    totalTax: { type: Number },
    totalAmount: { type: Number },
    amountInWords: { type: String }
  },

  terms: { type: String, default: 'Thanks for doing business with us!' },

  bankDetails: {
    bankName: { type: String },
    accountNo: { type: String },
    ifscCode: { type: String }
  },

  qrCodeSrc: { type: String, default: '/api/placeholder/120/120' },
  totalItemQuantityChecked: { type: Boolean, default: false },
  amountWithDecimalChecked: { type: Boolean, default: false },
  receivedAmountChecked: { type: Boolean, default: false },
  balanceAmountChecked: { type: Boolean, default: false },
  currentBalanceOfPartyChecked: { type: Boolean, default: false },
  taxDetailsChecked: { type: Boolean, default: false },
  youSavedChecked: { type: Boolean, default: false },
  printAmountWithGroupingChecked: { type: Boolean, default: false },
  printDescription: { type: Boolean, default: false },
  customerSignature: { type: Boolean, default: false },
  customerSignatureTitle: { type: String, default: 'Customer Signature' },
  printAcknowledgement: { type: Boolean, default: false },
  paymentMode: { type: Boolean, default: false },

  printer: { type: String, default: 'regular-printer' },
  selectedTheme: { type: String, default: 'theme-1' },
  makeDefault: { type: Boolean, default: false },
  useTextStyling: { type: Boolean, default: true },
  autoCutPaper: { type: Boolean, default: false },
  openCashDrawer: { type: Boolean, default: false },
  extraLines: { type: Number, default: 0 },
  numberOfCopies: { type: Number, default: 1 },
  colors: { type: String, default: 'default' },
  includeLogo: { type: Boolean, default: false },
  gstin: { type: String, default: '' },

  itemTableSettings: {
    showSNo: { type: Boolean, default: true },
    showHSN: { type: Boolean, default: true },
    showUOM: { type: Boolean, default: true },
    showMRP: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    showBatch: { type: Boolean, default: true },
    showExpiry: { type: Boolean, default: true },
    showMfg: { type: Boolean, default: true },
    showSize: { type: Boolean, default: true },
    showModelNo: { type: Boolean, default: true },
    showSerialNo: { type: Boolean, default: true }
  },

  totalsAndTaxes: {
    showTotalQuantity: { type: Boolean, default: true },
    showAmountDecimal: { type: Boolean, default: true },
    showReceivedAmount: { type: Boolean, default: true },
    showBalance: { type: Boolean, default: true },
    showCurrentBalance: { type: Boolean, default: false },
    showTaxDetails: { type: Boolean, default: true },
    showYouSaved: { type: Boolean, default: true },
    showAmountGrouping: { type: Boolean, default: true },
    amountLanguage: { type: String, default: 'indian' }
  },

  footerSettings: {
    showPrintDescription: { type: Boolean, default: true }
  },
  companyInfo: {
    companyName: { type: String, default: '' },
    includeLogo: { type: Boolean, default: false },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    gstin: { type: String, default: '' },
  },

  // Added itemTableSettings fields
  itemTableSettings: {
    showSNo: { type: Boolean, default: true },
    showHSN: { type: Boolean, default: true },
    showUOM: { type: Boolean, default: true },
    showMRP: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    showBatch: { type: Boolean, default: true },
    showExpiry: { type: Boolean, default: true },
    showMfg: { type: Boolean, default: true },
    showSize: { type: Boolean, default: true },
    showModelNo: { type: Boolean, default: true },
    showSerialNo: { type: Boolean, default: true }
  },

  // Added totalsAndTaxes fields
  totalsAndTaxes: {
    showTotalQuantity: { type: Boolean, default: true },
    showAmountDecimal: { type: Boolean, default: true },
    showReceivedAmount: { type: Boolean, default: true },
    showBalance: { type: Boolean, default: true },
    showCurrentBalance: { type: Boolean, default: false },
    showTaxDetails: { type: Boolean, default: true },
    showYouSaved: { type: Boolean, default: true },
    showAmountGrouping: { type: Boolean, default: true },
    amountLanguage: { type: String, default: 'indian' }
  },

  // Added footerSettings fields
  footerSettings: {
    showPrintDescription: { type: Boolean, default: true }
  },
  printerSettings: {
    pageSize: { type: String, enum: ['4-inch', 'A4', 'A5'], default: '4-inch' },
    makeDefault: { type: Boolean, default: false },
    useTextStyling: { type: Boolean, default: true },
    autoCutPaper: { type: Boolean, default: false },
    openCashDrawer: { type: Boolean, default: false },
    extraLines: { type: Number, default: 0 },
    numberOfCopies: { type: Number, default: 1 },
    colors: { type: String, default: 'default' },
    paperSize: {
      type: String,
      enum: ['A4', 'A5', 'A6', 'Letter'],
      default: 'A4'
    },
    printLandscape: { type: Boolean, default: false },
    printWithLogo: { type: Boolean, default: false },
    logoPosition: {
      type: String,
      enum: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
      default: 'top-center'
    },
    useBorders: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});


const taxesGstSettingsSchema = new mongoose.Schema({
  email: { type: String },
  taxRates: [
    {
      id: { type: Number }, // Unique identifier for each tax rate
      name: { type: String }, // Name of the tax
      rate: { type: String }, // Tax rate
    },
  ],
  taxGroups: {
    type: [{
      id: { type: Number }, // Unique identifier for each tax rate
      name: { type: String }, // Name of the tax
      components: { type: [String] }, // Tax rate
    },], default: []
  }, // Array of tax groups
  gstEnabled: { type: Boolean, default: false },
  hsnEnabled: { type: Boolean, default: false },
  additionalCess: { type: Boolean, default: false },
  reverseCharge: { type: Boolean, default: false },
  placeOfSupply: { type: Boolean, default: false },
  compositeScheme: { type: Boolean, default: false },
  tcsEnabled: { type: Boolean, default: false },
  tdsEnabled: { type: Boolean, default: false },
});


const transactionMessageSettingsSchema = new mongoose.Schema({
  email: { type: String }, // Unique email for each user
  sendSMS: { type: Boolean, default: false }, // Option to send SMS
  sendCopy: { type: Boolean, default: false }, // Option to send a copy to self
  whatsappLoggedIn: { type: Boolean, default: false }, // WhatsApp login status
  messageTemplate: {
    greeting: { type: String, default: "Greetings from [Firm_Name]" }, // Greeting message
    intro: { type: String, default: "We are pleased to have you as a valuable customer. Please find the details of your transaction." }, // Introductory message
    transactionLabel: { type: String, default: "[Transaction_Type] :" }, // Transaction label
    invoiceAmount: { type: String, default: "Invoice Amount: [Invoice_Amount]" }, // Invoice amount message
    balance: { type: String, default: "Balance: [Transaction_Balance]" }, // Balance information
    thanks: { type: String, default: "Thanks for doing business with us." }, // Thanks message
    regards: { type: String, default: "Regards," }, // Closing regards
    firmName: { type: String, default: "[Firm_Name]" }, // Firm name
  },
  variables: {
    firmName: { type: String, default: "NewCompany" }, // Default firm name
    transactionType: { type: String, default: "Sale Invoice" }, // Default transaction type
    invoiceAmount: { type: String, default: "792" }, // Default invoice amount
    balance: { type: String, default: "0" }, // Default balance
  },
  transactionType: { type: String, default: "Sales Transaction" }, // Default transaction type
});

const partySettingsSchema = new mongoose.Schema({
  email: { type: String },
  partyGrouping: { type: Boolean, default: false }, // Enable party grouping
  shippingAddress: { type: Boolean, default: false }, // Enable shipping address
  enablePaymentReminder: { type: Boolean, default: true }, // Enable payment reminder
  paymentReminderDays: { type: Number, default: 1 }, // Number of days for payment reminder
  reminderMessage: {
    additionalMessage: { type: String, default: "" },
    defaultMessage: {
      type: String,
      default: "If you have already made the payment, kindly ignore this message.",
    },
  },
  additionalFields: [
    {
      enabled: { type: Boolean, default: false },
      fieldName: { type: String, default: "" },
      showInPrint: { type: Boolean, default: false },
      type: { type: String, enum: ['text', 'date'], default: "text" }, // Field type: text or date
    },
    {
      enabled: { type: Boolean, default: false },
      fieldName: { type: String, default: "" },
      showInPrint: { type: Boolean, default: false },
      type: { type: String, enum: ['text', 'date'], default: "text" },
    },
    {
      enabled: { type: Boolean, default: false },
      fieldName: { type: String, default: "" },
      showInPrint: { type: Boolean, default: false },
      type: { type: String, enum: ['text', 'date'], default: "text" },
    },
    {
      enabled: { type: Boolean, default: false },
      fieldName: { type: String, default: "" },
      showInPrint: { type: Boolean, default: false },
      type: { type: String, enum: ['text', 'date'], default: "date" },
    },
  ],
  loyaltyPoints: {
    enabled: { type: Boolean, default: true }, // Enable loyalty points
  },
});

const itemSettingsSchema = new mongoose.Schema({

});

const settingsSchema = new mongoose.Schema({
  email: { type: String }, // Added email field at root level
  generalSettings: { type: [generalSettingsSchema], default: [] },
  transactionSettings: { type: [transactionSettingsSchema], default: [] },
  printSettings: { type: [printSettingsSchema], default: [] },
  taxesGstSettings: { type: [taxesGstSettingsSchema], default: [] },
  transactionMessageSettings: { type: [transactionMessageSettingsSchema], default: [] },
  partySettings: { type: [partySettingsSchema], default: [] },
  itemSettings: { type: [itemSettingsSchema], default: [] },
});


const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
