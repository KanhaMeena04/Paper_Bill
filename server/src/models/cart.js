const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        //required: true
    },
    quantity: {
        type: Number,
        //required: true,
        min: 1
    },
    name: {
        type: String,
        //required: true
    },
    image: {
        type: String,
        //required: true
    },
    price: {
        type: Number,
        //required: true
    }
});

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        //required: true
    },
    items: [CartItemSchema]
});

module.exports = mongoose.model('Cart', CartSchema);