const mongoose = require("mongoose");

const ConversionSchema = new mongoose.Schema({
  email: {
    type: String,},
    conversions: [
      {
        primaryUnit: {
          type: String
        },
        secondaryUnit: {
          type: String,
        },
        conversionFactor: {
          type: Number
        },
      },
    ],
  });

const Conversion = mongoose.model("Conversion", ConversionSchema);

module.exports = Conversion;
