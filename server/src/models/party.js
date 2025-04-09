const mongoose = require('mongoose');

// Define a schema for additional fields
const AdditionalFieldSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  fieldName: {
    type: String,
    default: "",
  },
  showInPrint: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["text", "date", "number", "boolean"], // Add other types as needed
    default: "text",
  }
});

// Define a schema for transactions
const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  number: {
    type: String,
  },
  date: {
    type: String,
  },
  total: {
    type: String,
  },
  balance: {
    type: String,
  },
  paid: {
    type: String,
  }
});

const PartySchema = new mongoose.Schema({
  partyId: {
    type: String,
  },
  userId: {
    type: String,
  },
  partyName: {
    type: String,
  },
  partyPhone: {
    type: String,
    // match: /^[0-9]{10}$/,
  },
  partyGSTIN: {
    type: String,
  },
  gstType: {
    type: String,
  },
  partyState: {
    type: String,
  },
  partyGroup: {
    type: String,
  },
  partyType: {
    type: String,
  },
  partyEmail: {
    type: String,
  },
  partyBillingAddress: {
    type: String,
  },
  openingBalance: {
    type: Number,
  },
  balanceType: {
    type: String,
  },
  asOfDate: {
    type: String,
  },
  transactions: [TransactionSchema], // Transactions array
  additionalFields: [AdditionalFieldSchema], // Additional fields array
}, { timestamps: true });

const Party = mongoose.model('Party', PartySchema);

module.exports = Party;
