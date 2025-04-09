const Bill = require("../models/bills");
const Party = require('../models/party');
const Item = require("../models/item");

module.exports.addBill = async (req, res) => {
  try {
    const bills = req.body;

    if (!Array.isArray(bills)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of bills.",
      });
    }

    const partyIds = bills.map(bill => bill.form?.customer).filter(customer => customer);
    // First find by partyId
    const partiesByPartyId = await Party.find({ partyId: { $in: partyIds } });
    // Then find by partyName
    const partyNames = bills.map(bill => bill.form?.customer).filter(customer => customer);
    const partiesByName = await Party.find({ partyName: { $in: partyNames } });

    // Combine both results into partyMap
    const partyMap = {};
    [...partiesByPartyId, ...partiesByName].forEach(party => {
      partyMap[party.partyName] = { partyName: party.partyName, partyId: party.partyId };
    });

    const transformedBills = [];

    for (const billData of bills) {
      if (!billData.form) {
        billData.form = {};
      }

      let customer = billData.form.customer || "";
      // First check if customer exists by name in our partyMap
      let customerDetails = partyMap[customer];

      if (!customerDetails) {
        // If customer doesn't exist, check one more time in database
        const existingParty = await Party.findOne({ partyName: customer });

        if (existingParty) {
          customerDetails = {
            partyName: existingParty.partyName,
            partyId: existingParty.partyId
          };
          partyMap[customer] = customerDetails;
        } else {
          // Only create new party if it doesn't exist at all
          const partyId = `#${Math.floor(100000 + Math.random() * 900000)}`;
          const newParty = new Party({
            partyId,
            partyName: customer,
            openingBalance: 0,
          });
          await newParty.save();
          customerDetails = { partyName: customer, partyId };
          partyMap[customer] = customerDetails;
        }
      }

      const invoiceNumber = await Bill.countDocuments() + 1;

      const form = {
        customer: customerDetails.partyName,
        phone: billData.form.phone || "",
        billingAddress: billData.form.billingAddress || "",
        invoiceNumber: String(invoiceNumber),
        partyId: customerDetails.partyId,
      };

      const items = [];
      for (const item of billData.form.items || []) {
        let itemId = item.itemCode || null;
        let itemName = item.itemName || "";
        let existingItem = null;

        if (itemName) {
          // Check if the item exists in the Item schema by itemName
          existingItem = await Item.findOne({ itemName: itemName });

          if (!existingItem) {
            // If the item does not exist, create a new item with a random 6-digit itemCode
            const itemCode = `#${Math.floor(100000 + Math.random() * 900000)}`; // Generate a random 6-digit code
            const newItem = new Item({
              itemCode: itemCode, // Assign the generated itemCode
              itemName: itemName,
              salePrice: item.price || 0,
              saleDiscount: item.discount?.amount || 0,
              taxRate: item.tax?.percentage || "None",
              openingPrimaryQuantity: item.quantity?.primary ? -Math.abs(item.quantity.primary) : -0,
              openingSecondaryQuantity: item.quantity?.secondary ? -Math.abs(item.quantity.secondary) : -0,
            });
            await newItem.save();
            itemId = newItem._id; // Use the new item's ID

            // Push the newly created item's details into the items array for the bill
            items.push({
              id: item.id || null,
              itemName: newItem.itemName,
              itemId: itemCode,
              itemCode: newItem.itemCode, // Include the newly generated itemCode
              quantity: {
                primary: item.quantity?.primary || "",
                secondary: item.quantity?.secondary || "",
                primaryUnit: item.quantity?.primaryUnit || "",
                secondaryUnit: item.quantity?.secondaryUnit || "",
              },
              unit: item.unit || "NONE",
              price: newItem.salePrice, // Use the new item's salePrice
              amount: item.amount || 0,
              discount: {
                percentage: item.discount?.percentage || "",
                amount: newItem.saleDiscount, // Use the new item's saleDiscount
              },
              exeDateFormat: item.exeDateFormat || "",
              mfgDateFormat: item.mfgDateFormat || "",
              tax: {
                percentage: newItem.taxRate, // Use the new item's taxRate
                amount: item.tax?.amount || "",
              },
              sellType: item.sellType || "",
            });
          } else {
            // If the item exists, use the existing item's ID
            itemId = existingItem._id;

            // Update the existing item's openingPrimaryQuantity if applicable
            if (existingItem.openingPrimaryQuantity !== undefined && item.quantity?.primary) {
              existingItem.openingPrimaryQuantity -= Math.abs(item.quantity.primary);
              await existingItem.save();
            }

            // Push the existing item's details into the items array for the bill
            items.push({
              id: item.id || null,
              itemName: existingItem.itemName,
              itemId: existingItem._id,
              itemCode: existingItem.itemCode, // Include the existing item's itemCode
              quantity: {
                primary: item.quantity?.primary || "",
                secondary: item.quantity?.secondary || "",
                primaryUnit: item.quantity?.primaryUnit || "",
                secondaryUnit: item.quantity?.secondaryUnit || "",
              },
              unit: item.unit || "NONE",
              price: existingItem.salePrice, // Use the existing item's salePrice
              amount: item.amount || 0,
              discount: {
                percentage: item.discount?.percentage || "",
                amount: existingItem.saleDiscount, // Use the existing item's saleDiscount
              },
              exeDateFormat: item.exeDateFormat || "",
              mfgDateFormat: item.mfgDateFormat || "",
              tax: {
                percentage: existingItem.taxRate, // Use the existing item's taxRate
                amount: item.tax?.amount || "",
              },
              sellType: item.sellType || "",
            });
          }
        }
      }

      const bill = {
        id: billData.id || null,
        label: billData.label || "",
        billType: billData.billType || "",
        form: form,
        description: billData.form.description || "",
        discount: {
          percentage: billData.form.discount?.percentage || "",
          amount: billData.form.discount?.amount || "",
        },
        image: billData.form.image || "",
        invoiceDate: billData.form.invoiceDate || new Date().toISOString().split('T')[0],
        items: items,
        paymentType: billData.form.paymentType || "cash",
        phone: billData.form.phone || "",
        balanceAmount: Number(billData.form.balanceAmount) || 0,
        receivedAmount: Number(billData.form.receivedAmount) || 0,
        roundOff: billData.form.roundOff || 0,
        stateOfSupply: billData.form.stateOfSupply || "",
        tax: {
          percentage: billData.form.tax?.percentage || "",
          amount: billData.form.tax?.amount || "",
        },
        total: billData.form.total || 0,
        transportName: billData.form.transportName || "",
        orderStatus: "Open Order"
      };

      await Party.findOneAndUpdate(
        { partyId: customerDetails.partyId },
        {
          $inc: { openingBalance: billData.form.balanceAmount || 0 },
          balanceType: "to-receive"
        }
      );

      transformedBills.push(bill);
    }

    try {
      const insertedBills = await Bill.insertMany(transformedBills, { ordered: true });
      res.status(201).json({
        success: true,
        message: "Bills added successfully!",
        data: insertedBills,
      });
    } catch (bulkError) {
      if (bulkError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Duplicate invoice number detected. Please try again.",
          error: bulkError.message,
        });
      }
      throw bulkError;
    }
  } catch (error) {
    console.error("Error adding bills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add bills. Please try again later.",
      error: error.message,
    });
  }
};

module.exports.getBill = async (req, res) => {
  try {
    const { billType } = req.query;

    // Set filter to {} if billType is not provided or empty
    const filter = billType ? { billType } : {};

    const bills = await Bill.find(filter)
      .sort({ "form.label": -1 })
      .lean();

    if (!bills.length) {
      return res.status(200).json({
        success: false,
        message: "No bills found.",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills. Please try again later.",
      error: error.message,
    });
  }
};

module.exports.getInvoices = async (req, res) => {
  try {
    const invoiceNumber = await Bill.find()
    res.status(200).json({
      success: true,
      data: invoiceNumber.length + 1,
    });
  } catch (error) {
    console.error("Error fetching invoice number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice number. Please try again later.",
      error: error.message,
    });
  }
};

module.exports.billWiseProfit = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { party } = req.query;

    // Build filter object
    let filter = {};
    if (party) {
      filter['form.customer'] = new RegExp(party, 'i'); // Case-insensitive party name search
    } else {
      filter.billType = "addsales"; // Include only bills with billType "addsales" when no party is provided
    }

    // Get all bills with filter
    const bills = await Bill.find(filter).sort({ invoiceDate: 1 });
    console.log(bills, "This is Bill")
    const profitData = [];

    for (const bill of bills) {
      let saleAmount = 0;
      let totalCost = 0;
      let taxPayable = 0;
      let tdsReceivable = 0;
      const costCalculation = [];

      for (const item of bill.items) {
        saleAmount += Number(item.amount) || 0;
        console.log(item.itemId)
        const itemDetails = await Item.findOne({ itemCode: item.itemId });
        console.log(itemDetails)
        if (itemDetails) {
          const purchasePrice = itemDetails.purchasePrice || 0;
          const quantity = itemDetails.openingQuantity || 1;
          const itemTotalCost = purchasePrice * quantity;

          totalCost += itemTotalCost;

          costCalculation.push({
            itemName: item.itemName,
            quantity: quantity,
            purchasePrice: purchasePrice.toFixed(2),
            totalCost: itemTotalCost.toFixed(2),
          });
        }

        if (item.tax && item.tax.amount) {
          taxPayable += Number(item.tax.amount);
        }
      }

      const profit = saleAmount - totalCost - taxPayable + tdsReceivable;
      const invoiceDate = new Date(bill.invoiceDate)
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .split("/")
        .join("/");

      const profitObj = {
        summaryData: {
          date: invoiceDate,
          invoiceNo: bill.form.invoiceNumber,
          party: bill.form.customer,
          totalSaleAmount: saleAmount.toFixed(2),
          profit: profit.toFixed(2),
          profitDisplay:
            profit >= 0
              ? `₹ ${profit.toFixed(2)}`
              : `-₹ ${Math.abs(profit).toFixed(2)}`,
        },
        detailedData: {
          title: `Invoice #${bill.form.invoiceNumber} - ${bill.form.customer}`,
          costCalculation: costCalculation,
          calculations: {
            saleAmount: saleAmount.toFixed(2),
            totalCost: totalCost.toFixed(2),
            taxPayable: taxPayable.toFixed(2),
            tdsReceivable: tdsReceivable.toFixed(2),
            profit: profit.toFixed(2),
            profitExcludingAdditionalCharges: profit.toFixed(2),
          },
        },
      };

      profitData.push(profitObj);
    }

    const totals = profitData.reduce(
      (acc, curr) => {
        acc.totalSaleAmount += Number(curr.summaryData.totalSaleAmount);
        acc.totalProfit += Number(curr.summaryData.profit);
        return acc;
      },
      { totalSaleAmount: 0, totalProfit: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        profitData,
        summary: {
          totalSaleAmount: totals.totalSaleAmount.toFixed(2),
          totalProfit: totals.totalProfit.toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error calculating profits:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate profits",
      error: error.message,
    });
  }
};
