const mongoose = require("mongoose");

const ExpenseItemSchema = new mongoose.Schema({
  name: {
    type: String,
    //required: true,
  },
  hsn: {
    type: String,
    //required: true,
  },
  price: {
    type: Number,
    //required: true,
  },
  taxRate: {
    type: String,
    default: "NONE",
  },
});

module.exports = mongoose.model("ExpenseItem", ExpenseItemSchema);
