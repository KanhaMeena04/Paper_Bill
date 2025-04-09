const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  receiptNo: {
    type: String,
  },
  partyId: {
    type: String,
  },
  partyName: {
    type: String,
  },
  category: {
    type: String,
    default: '-'
  },
  paymentType: {
    type: String,
  },
  description: String,
  total: {
    type: Number,
  },
  received: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  paid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Pending',
  },
  dueDate: Date,
  firm: {
    type: String,
    default: 'ALL FIRMS'
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;