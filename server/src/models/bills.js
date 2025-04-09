const mongoose = require("mongoose");
const autoIncrement = require('mongoose-sequence')(mongoose);

// Schema for quantity object in items
const QtySchema = new mongoose.Schema({
  primary: {
    type: String,
  },
  secondary: {
    type: String,
  },
  primaryUnit: {
    type: String
  },
  secondaryUnit: {
    type: String
  }
}, { _id: false });

// Schema for individual items
const ItemSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  itemId: {
    type: String,
  },
  itemName: { type: String, },
  quantity: QtySchema,
  unit: {
    type: String,
    default: "NONE",
  },
  price: {
    type: String,
  },
  amount: {
    type: Number,
    default: 0,
  },
  discount: {
    percentage: {
      type: String,
    },
    amount: {
      type: String,
    }
  },
  exeDateFormat: {
    type: String,
  },
  mfgDateFormat: {
    type: String,
  },
  tax: {
    percentage: {
      type: String,
    },
    amount: {
      type: String,
    }
  },
  sellType: {
    type: String,
  }
}, { _id: false });

// Main Bill Schema
const BillSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  label: {
    type: String,
  },
  billType: {
    type: String,
  },
  form: {
    customer: {
      type: String,
    },
    phone: {
      type: String,
    },
    billingAddress: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    partyId: {
      type: String, // Added partyId here
    }
  },
  description: {
    type: String,
  },
  discount: {
    percentage: {
      type: String,
    },
    amount: {
      type: String,
    }
  },
  image: {
    type: String,
  },
  invoiceDate: {
    type: String,
  },
  items: [ItemSchema],
  paymentType: {
    type: String,
    default: "cash",
  },
  phone: {
    type: String,
  },
  roundOff: {
    type: Number,
    default: 0,
  },
  stateOfSupply: {
    type: String,
  },
  tax: {
    percentage: {
      type: String,
    },
    amount: {
      type: String,
    }
  },
  total: {
    type: Number,
    default: 0,
  },
  balanceAmount: {
    type: Number
  },
  receivedAmount: {
    type: Number
  },
  transportName: {
    type: String,
  },
  orderStatus: {
    type: String
  }
});

// Auto-increment for invoiceNumber
// BillSchema.plugin(autoIncrement, { inc_field: 'form.invoiceNumber' });

const Bill = mongoose.model("Bill", BillSchema);

module.exports = Bill;
