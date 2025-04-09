const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        // //required: true,
        trim: true,
    },
    itemHSN: {
        type: String,
        // //required: true,
        trim: true,
    },
    categories: {
        type: [String],
        // //required: true,
    },
    itemCode: {
        type: String,
        // //required: true,
        // unique: true,
        trim: true,
    },
    salePrice: {
        type: Number,
        // //required: true,
    },
    salePriceType: {
        type: String,
        // enum: ["With Tax", "Without Tax"],
        default: "Without Tax",
    },
    saleDiscount: {
        type: Number,
        default: 0,
    },
    saleDiscountType: {
        type: String,
        // enum: ["Percentage", "Amount"],
        default: "Percentage",
    },

    wholesalePrice: {
        type: Number,
        default: null,
    },
    wholesalePriceType: {
        type: String,
        // enum: ["With Tax", "Without Tax"],
        
        default: "Without Tax",
    },
    minWholesaleQty: {
        type: Number,
        default: 0,
    },

    purchasePrice: {
        type: Number,
        // //required: true,
    },
    purchasePriceType: {
        type: String,
        // enum: ["With Tax", "Without Tax"],
        default: "Without Tax",
    },
    taxRate: {
        type: String,
        default: "None",
    },
    openingPrimaryQuantity: {
        type: Number,
        default: 0,
    },
    openingSecondaryQuantity: {
        type: Number,
        default: 0,
    },
    atPrice: {
        type: Number,
        default: null,
    },
    asOfDate: {
        type: Date,
        default: Date.now,
    },
    minStockToMaintain: {
        type: Number,
        default: 0,
    },
    location: {
        type: String,
        default: null,
    },
    quantity: {
        primary: {
            type: String,
            default: 0, // Primary quantity
        },
        secondary: {
            type: String,
            default: 0, // Secondary quantity
        },
    },
    conversionRate: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Item', ItemSchema);
