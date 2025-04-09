const mongoose = require("mongoose");

const expenseItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpenseItem", // Assuming you have a separate model for ExpenseItem
    //required: true,
  },
  item: {
    type: String,
  },
  quantity: {
    type: Number,
    //required: true,
  },
  price: {
    type: Number,
    //required: true,
  },
  amount: {
    type: Number,
    //required: true,
  },
});

const expenseSchema = new mongoose.Schema({
  expenseNo: {
    type: String,
    //required: true,
    unique: true, // To ensure expenseNo is unique
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expenseCategory: {
    type: String,
    //required: true,
  },
  gstEnabled: {
    type: Boolean,
    default: false,
  },
  expenseItems: {
    type: [expenseItemSchema], // This is an array of expenseItemSchema
    //required: true,
  },
  paymentType: {
    type: String,
    enum: ["cash", "credit", "debit"], // You can adjust the payment types as needed
    default: "cash",
  },
  total: {
    type: Number,
    //required: true,
  },
});

const Expenses = mongoose.model("Expenses", expenseSchema);

module.exports = Expenses;
