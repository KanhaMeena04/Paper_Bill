const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
  bankName: {
    type: String,
  },
  description: {
    type: String,
  },
  openingBalance: {
    type: Number,
  },
  withdrawAmount: {
    type: Number,
    default: 0,
  },
  asOfDate: {
    type: Date,
    default: Date.now,
  },
});

const Bank = mongoose.model('Bank', BankSchema);

module.exports = Bank;
