const mongoose = require('mongoose');

const journalRowSchema = new mongoose.Schema({
  account: {
    type: String,
    required: [true, 'Account is required']
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  }
});

const journalEntrySchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    // required: [true, 'Reference number is required'],
    unique: true
  },
  journalDate: {
    type: Date,
    required: [true, 'Journal date is required'],
    default: Date.now
  },
  entries: {
    type: [journalRowSchema],
    required: [true, 'At least two entries are required'],
    validate: {
      validator: function(entries) {
        if (entries.length < 2) return false;
        
        const totals = entries.reduce((acc, entry) => ({
          credit: acc.credit + entry.credit,
          debit: acc.debit + entry.debit
        }), { credit: 0, debit: 0 });
        
        return Math.abs(totals.credit - totals.debit) < 0.01;
      },
      message: 'Journal entries must have at least 2 rows and total credits must equal total debits'
    }
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

journalEntrySchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastEntry = await this.constructor.findOne({}, {}, { sort: { 'referenceNumber': -1 } });
    const lastNumber = lastEntry ? parseInt(lastEntry.referenceNumber.split('-')[1]) : 0;
    this.referenceNumber = `JE-${lastNumber + 1}`;
  }
  this.updatedAt = Date.now();
  next();
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
module.exports = JournalEntry;