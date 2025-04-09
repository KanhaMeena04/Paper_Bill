const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paperBillSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  allDatabases: {
    banks: { type: Array, default: [] },
    bills: { type: Array, default: [] },
    carts: { type: Array, default: [] },
    categories: { type: Array, default: [] },
    conversions: { type: Array, default: [] },
    expenseCategories: { type: Array, default: [] },
    expenseItems: { type: Array, default: [] },
    expenses: { type: Array, default: [] },
    items: { type: Array, default: [] },
    journalEntries: { type: Array, default: [] },
    orders: { type: Array, default: [] },
    parties: { type: Array, default: [] },
    payments: { type: Array, default: [] },
    products: { type: Array, default: [] },
    schedules: { type: Array, default: [] },
    settings: { type: Array, default: [] },
    units: { type: Array, default: [] }
  }
});

// Create and export the model
const PaperBill = mongoose.model('PaperBill', paperBillSchema);
module.exports = PaperBill;
