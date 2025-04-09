const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    //required: true,
    default: () => Math.floor(100000 + Math.random() * 900000).toString()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //required: true
  },
  billingInfo: {
    firstName: { type: String },
    lastName: { type: String, },
    phone: { type: String },
    address: { type: String, },
    landmark: { type: String },
    town: { type: String },
    state: { type: String },
    postcode: { type: String },
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      //required: true
    },
    quantity: { type: Number },
    price: { type: Number },
    stockSerialNumber: { type: String }
  }],
  totalAmount: {
    type: Number,
    //required: true
  },
  paymentMethod: {
    type: String,
    //required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  cgst: {
    type: Number,
    //required: true
  },
  igst: {
    type: Number,
    //required: true
  },
  amount: {
    type: Number,
    //required: true
  },
  couponCode: {
    type: String
  },
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;