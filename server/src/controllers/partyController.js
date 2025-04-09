const Party = require('../models/party');
const Bill = require("../models/bills")
const Payment = require('../models/payment');

module.exports.addParties = async (req, res) => {
  try {
    let parties = req.body;
    if (!Array.isArray(parties)) {
      parties = [parties];
    }

    const newParties = parties.map(partyData => {
      const {
        partyName,
        partyPhone,
        partyGSTIN,
        gstType,
        partyState,
        partyGroup,
        partyEmail,
        billingAddress,
        openingBalance,
        balanceType,
        asOfDate,
        partyType,
        shippingAddress,
        additionalFields
      } = partyData;

      // Handle additionalFields properly
      let finalAdditionalFields = [];

      if (additionalFields) {
        // If it's a string, try to parse it
        if (typeof additionalFields === 'string') {
          try {
            finalAdditionalFields = JSON.parse(additionalFields);
          } catch (error) {
            console.error('Error parsing additionalFields:', error);
          }
        } else if (Array.isArray(additionalFields)) {
          // If it's already an array, use it directly
          finalAdditionalFields = additionalFields;
        }
      }

      // Generate a unique partyId
      const partyId = `#${Math.floor(100000 + Math.random() * 900000)}`;

      // Create default transaction
      const defaultTransaction = {
        type: balanceType === "to-receive" ? "Receivable Opening Balance" : "Returnable Opening Balance",
        number: "",
        date: new Date().toLocaleDateString('en-GB'),
        total: openingBalance,
        balance: openingBalance,
        paid: 0
      };

      return new Party({
        partyId,
        userId: "1",
        partyName,
        partyPhone,
        shippingAddress,
        partyGSTIN,
        gstType,
        partyState,
        partyGroup,
        partyEmail,
        partyBillingAddress: billingAddress,
        openingBalance,
        balanceType,
        partyType,
        asOfDate,
        transactions: [defaultTransaction],
        additionalFields: finalAdditionalFields // Use the processed additionalFields
      });
    });

    // Save all parties in parallel
    const savedParties = await Promise.all(newParties.map(party => party.save()));

    console.log("Saved Parties:", savedParties);
    res.status(201).json({ message: "Parties added successfully!", data: savedParties });
  } catch (error) {
    console.error("Error adding parties:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.editParty = async (req, res) => {
  try {
    const { partyId, openingBalance, balanceType, ...updatedData } = req.body;

    // Convert openingBalance to a number if it exists
    const numericOpeningBalance = openingBalance !== undefined ? Number(openingBalance) : undefined;

    if (!partyId) {
      return res.status(400).json({ error: "partyId is required" });
    }

    // Fetch the existing party
    const existingParty = await Party.findOne({ partyId });

    if (!existingParty) {
      return res.status(404).json({ error: "Party not found" });
    }

    let updatedOpeningBalance = existingParty.openingBalance;

    // Check if openingBalance has changed in the payload
    if (numericOpeningBalance !== undefined && existingParty.openingBalance !== numericOpeningBalance) {
      if (balanceType === "to-receive") {
        updatedOpeningBalance += numericOpeningBalance; // Reset to 0
      } else if (balanceType === "to-pay") {
        updatedOpeningBalance -= numericOpeningBalance; // Reset to 0
      }


    }

    // Handle additionalFields properly
    if (updatedData.additionalFields) {
      if (typeof updatedData.additionalFields === "string") {
        try {
          updatedData.additionalFields = JSON.parse(updatedData.additionalFields);
        } catch (error) {
          console.error("Error parsing additionalFields:", error);
          return res.status(400).json({ error: "Invalid additionalFields format" });
        }
      }
    }

    // Prepare update payload
    const updatePayload = { ...updatedData, balanceType };

    if (numericOpeningBalance !== undefined) {
      updatePayload.openingBalance = updatedOpeningBalance;
    }

    // Update the party
    const updatedParty = await Party.findOneAndUpdate(
      { partyId },
      { $set: updatePayload },
      { new: true }
    );

    res.status(200).json({ message: "Party updated successfully", data: updatedParty });
  } catch (error) {
    console.error("Error updating party:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports.deleteParty = async (req, res) => {
  try {
    const { partyId } = req.body;

    if (!partyId) {
      return res.status(400).json({ error: "partyId is required" });
    }

    const deletedParty = await Party.findOneAndDelete({ partyId });

    if (!deletedParty) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.status(200).json({
      message: "Party deleted successfully",
      data: deletedParty
    });
  } catch (error) {
    console.error("Error deleting party:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json({ success: "Found parties", data: parties });
  } catch (error) {
    console.error("Error fetching parties:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.partyStatement = async (req, res) => {
  try {
    const { party } = req.query;
    // console.log(typeof req.query.isProfitLoss);

    let Bills;
    if (req.query.isProfitLoss == 'true') {
      Bills = await Bill.find({});
    }
    else if (!party) {
      return res.status(200).json({
        success: "No party provided, returning empty results",
        Bills: [],
        Payments: [],
      });
    } else {
      // Fetch bills for the specified party
      Bills = await Bill.find({
        "form.partyId": party,
      });
    }

    // Fetch payments
    const Payments = await Payment.find({});

    // Send response
    res.status(200).json({
      success: "Data fetched successfully",
      Bills,
      Payments,
    });
  } catch (err) {
    console.error("Error fetching parties:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.verifyPartyName = async (req, res) => {
  try {
      const { partyName } = req.body;

      if (!partyName) {
          return res.status(400).json({
              success: false,
              message: 'Party name is required for verification'
          });
      }

      // Check if a party with this name already exists
      const existingParty = await Party.findOne({ 
          partyName: { $regex: new RegExp(`^${partyName}$`, 'i') } // Case-insensitive search
      });

      return res.status(200).json({
          success: true,
          isUnique: !existingParty,
          message: existingParty ? 'Party name already exists' : 'Party name is available'
      });

  } catch (error) {
      console.error('Error verifying party name:', error);
      return res.status(500).json({
          success: false,
          message: 'An error occurred while verifying the party name',
          error: error.message
      });
  }
};