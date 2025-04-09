const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    role: { type: String },
    country: { type: String },
    countryName: { type: String },  // Added countryName
    currency: { type: String },
    currencyCode: { type: String },  // Added currencyCode
    currencySymbol: { type: String },  // Added currencySymbol
    hasVAT: { type: Boolean, default: false },
    taxRates: [{ type: mongoose.Schema.Types.Mixed }], 
    businessType: { type: String },
    businessLogo: { type: String },
    gstNumber: { type: String, unique: true, sparse: true },
    businessAddress: { type: String },
    websiteUrl: { type: String },
    description: { type: String },
    businessPlatform: { type: String, default: "Select Business Platform" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
