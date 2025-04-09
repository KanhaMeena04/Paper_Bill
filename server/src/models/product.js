const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productSchema = new mongoose.Schema({
  userId: { type: String },
  productId: { type: Number, unique: true },
  productName: { type: String },
  category: { type: String },
  costPrice: { type: String },
  stocks: { type: Number },
  description: { type: String },
  image: { type: String },
  customerName: [{
    email: { type: String }
  }],
  availability: { type: String, default: "available" },
  rating: { type: String },
  date: { type: Date, default: Date.now },
  offer: {
    offerCode: { type: String },
    discount: { type: String },
    validity: { type: String },
    minimumAmount: { type: String },
    date: { type: String }
  }
});


productSchema.plugin(AutoIncrement, { inc_field: 'productId' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;