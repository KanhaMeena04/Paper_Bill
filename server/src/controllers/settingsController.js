const Settings = require('../models/settings');
const User = require('../models/User');

// Utility function to get or create settings document
async function getOrCreateSettings(email) {
    let settings = await Settings.findOne({ email });
    if (!settings) {
        settings = new Settings({ email });
        await settings.save();
    }
    return settings;
}

// Sequential execution middleware
module.exports.executeSequentially = () => {
    let isExecuting = false;
    const queue = [];

    const executeNext = async () => {
        if (queue.length === 0) {
            isExecuting = false;
         
            return;
        }

        const { req, res, next } = queue.shift();
        try {
            await next();
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
        executeNext();
    };

    return async (req, res, next) => {
        queue.push({ req, res, next });
        if (!isExecuting) {
            isExecuting = true;
            executeNext();
        }
    };
};

module.exports.addGeneralSettings = async (req, res) => {
    try {
        const {
            email,
            enablePasscode,
            passcode,
            confirmPasscode,
            businessCurrency,
            amount,
            gstnumber,
            multiFirm,
            company,
            autoBackup,
            auditTrail,
            screenZoom,
            showPasscodeDialog,
            estimateQuotation,
            salePurchaseOrder,
            otherIncome,
            fixedAssets,
            deliveryChallan,
            goodsReturnOnDeliveryChallan,
            printAmountInDeliveryChallan,
            godownManagement
        } = req.body;

        const settings = await getOrCreateSettings(email);

        const settingsData = {
            email,
            enablePasscode,
            passcode,
            confirmPasscode,
            businessCurrency,
            amount,
            gstnumber,
            multiFirm,
            company,
            autoBackup,
            auditTrail,
            screenZoom,
            showPasscodeDialog,
            estimateQuotation,
            salePurchaseOrder,
            otherIncome,
            fixedAssets,
            deliveryChallan,
            goodsReturnOnDeliveryChallan,
            printAmountInDeliveryChallan,
            godownManagement
        };

        // Update or add general settings
        const existingIndex = settings.generalSettings.findIndex(s => s.email === email);
        if (existingIndex !== -1) {
            settings.generalSettings[existingIndex] = settingsData;
        } else {
            settings.generalSettings.push(settingsData);
        }
        await User.findOneAndUpdate({ email: email }, { $set: { currency: businessCurrency } })
        await settings.save();
        return res.status(200).json({
            message: existingIndex !== -1 ? 'General settings updated successfully' : 'General settings added successfully',
            settings: settings.generalSettings[existingIndex !== -1 ? existingIndex : settings.generalSettings.length - 1]
        });
    } catch (error) {
        console.error('Error adding or updating general settings:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

module.exports.addTransactionSettings = async (req, res) => {
    try {
        const { email, ...settingsData } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        // Construct the transaction settings object with required email field
        const transactionSettingsData = {
            email,
            header: {
                invoiceBillNo: settingsData.header?.invoiceBillNo ?? true,
                addTimeOnTransactions: settingsData.header?.addTimeOnTransactions ?? false,
                cashSaleByDefault: settingsData.header?.cashSaleByDefault ?? false,
                billingNameOfParties: settingsData.header?.billingNameOfParties ?? false,
                customersPODetails: settingsData.header?.customersPODetails ?? false,
            },
            itemsTable: {
                inclusiveExclusiveTax: settingsData.itemsTable?.inclusiveExclusiveTax ?? true,
                displayPurchasePrice: settingsData.itemsTable?.displayPurchasePrice ?? true,
                showLastFiveSalePrice: settingsData.itemsTable?.showLastFiveSalePrice ?? false,
                freeItemQuantity: settingsData.itemsTable?.freeItemQuantity ?? false,
                count: settingsData.itemsTable?.count ?? false,
            },
            taxesAndTotals: {
                transactionWiseTax: settingsData.taxesAndTotals?.transactionWiseTax ?? false,
                transactionWiseDiscount: settingsData.taxesAndTotals?.transactionWiseDiscount ?? false,
                roundOffTotal: settingsData.taxesAndTotals?.roundOffTotal ?? true,
                roundingMethod: settingsData.taxesAndTotals?.roundingMethod ?? "nearest",
                roundingValue: settingsData.taxesAndTotals?.roundingValue ?? "1",
            },
            moreFeatures: {
                eWayBillNo: settingsData.moreFeatures?.eWayBillNo ?? false,
                quickEntry: settingsData.moreFeatures?.quickEntry ?? false,
                doNotShowInvoicePreview: settingsData.moreFeatures?.doNotShowInvoicePreview ?? false,
                enablePasscodeForEdit: settingsData.moreFeatures?.enablePasscodeForEdit ?? false,
                discountDuringPayments: settingsData.moreFeatures?.discountDuringPayments ?? false,
                linkPaymentsToInvoices: settingsData.moreFeatures?.linkPaymentsToInvoices ?? false,
                dueDatesAndPaymentTerms: settingsData.moreFeatures?.dueDatesAndPaymentTerms ?? false,
                showProfitOnSaleInvoice: settingsData.moreFeatures?.showProfitOnSaleInvoice ?? false,
            },
            transactionPrefixes: {
                firm: settingsData.transactionPrefixes?.firm ?? "",
                sale: settingsData.transactionPrefixes?.sale ?? "none",
                creditNote: settingsData.transactionPrefixes?.creditNote ?? "none",
                deliveryChallan: settingsData.transactionPrefixes?.deliveryChallan ?? "none",
                paymentIn: settingsData.transactionPrefixes?.paymentIn ?? "none",
            },
            additionalFields: {
                firm: settingsData.additionalFields?.firm ?? [],
                transaction: settingsData.additionalFields?.transaction ?? [],
            },
            additionalCharges: settingsData.additionalCharges ?? [],
            transportationDetails: settingsData.transportationDetails ?? []
        };

        // Get or create settings document
        const settingsDoc = await getOrCreateSettings(email);

        // Find existing transaction settings index
        const existingIndex = settingsDoc.transactionSettings.findIndex(
            (settings) => settings.email === email
        );

        if (existingIndex !== -1) {
            // Update existing settings
            settingsDoc.transactionSettings[existingIndex] = {
                ...settingsDoc.transactionSettings[existingIndex],
                ...transactionSettingsData
            };
        } else {
            // Add new settings
            settingsDoc.transactionSettings.push(transactionSettingsData);
        }

        // Save the document
        await settingsDoc.save();

        return res.status(200).json({
            message: existingIndex !== -1 ? "Settings updated successfully." : "Settings added successfully.",
            settings: settingsDoc.transactionSettings[existingIndex !== -1 ? existingIndex : settingsDoc.transactionSettings.length - 1]
        });

    } catch (error) {
        console.error('Error in addTransactionSettings:', error);
        return res.status(500).json({
            message: "Server error.",
            error: error.message
        });
    }
};

module.exports.addAdditionalTransactionSettings = async (req, res) => {
    try {
        const { email, additionalFields } = req.body;

        if (!email || !additionalFields) {
            return res.status(400).json({ message: "Email and additionalFields are required." });
        }

        const settingsDoc = await getOrCreateSettings(email);

        // Filter out objects with empty `name` from firm and transaction fields
        additionalFields.firm = additionalFields.firm.filter(item => item.name.trim() !== "");
        additionalFields.transaction = additionalFields.transaction.filter(item => item.name.trim() !== "");

        // Find the transaction settings for the given email
        const existingIndex = settingsDoc.transactionSettings.findIndex(s => s.email === email);

        if (existingIndex !== -1) {
            // Update additionalFields if the transaction settings exist
            settingsDoc.transactionSettings[existingIndex].additionalFields = additionalFields;
        } else {
            // If settings for this email don't exist, create a new one with additionalFields
            settingsDoc.transactionSettings.push({ email, additionalFields });
        }

        await settingsDoc.save();
        return res.status(200).json({
            message: existingIndex !== -1 ? "Additional fields updated successfully." : "Additional fields added successfully.",
            settings: settingsDoc.transactionSettings[existingIndex !== -1 ? existingIndex : settingsDoc.transactionSettings.length - 1]
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.addAdditionalCharges = async (req, res) => {
    try {
        const { email, additionalCharges } = req.body;

        if (!email || !additionalCharges) {
            return res.status(400).json({ message: "Email and additionalCharges are required." });
        }

        const settingsDoc = await getOrCreateSettings(email);
        const existingIndex = settingsDoc.transactionSettings.findIndex(s => s.email === email);

        if (existingIndex !== -1) {
            // Loop through the additionalCharges and update based on the index
            additionalCharges.forEach(charge => {
                if (charge.index !== undefined) {
                    // Ensure we update the charge at the correct index
                    settingsDoc.transactionSettings[existingIndex].additionalCharges[charge.index] = {
                        enabled: charge.enabled || false,
                        name: charge.name || "",
                        sac: charge.sac || "",
                        tax: charge.tax || "NONE",
                        enableTax: charge.enableTax || false
                    };
                }
            });
        } else {
            settingsDoc.transactionSettings.push({
                email,
                additionalCharges: additionalCharges.map(charge => ({
                    enabled: charge.enabled || false,
                    name: charge.name || "",
                    sac: charge.sac || "",
                    tax: charge.tax || "NONE",
                    enableTax: charge.enableTax || false
                }))
            });
        }

        await settingsDoc.save();

        return res.status(200).json({
            message: existingIndex !== -1 ? "Additional charges updated successfully." : "Additional charges added successfully.",
            settings: settingsDoc.transactionSettings[existingIndex !== -1 ? existingIndex : settingsDoc.transactionSettings.length - 1]
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.addTransportationDetails = async (req, res) => {
    try {
      const { email, transportationDetails } = req.body;
  
      // Validate required fields
      if (!email || !transportationDetails) {
        return res.status(400).json({ 
          message: "Email and transportationDetails are required." 
        });
      }
  
      // Validate transportation details structure
      if (!Array.isArray(transportationDetails)) {
        return res.status(400).json({ 
          message: "transportationDetails must be an array." 
        });
      }
  
      // Get or create settings document
      const settingsDoc = await getOrCreateSettings(email);
  
      // Find existing transaction settings for the email
      const existingIndex = settingsDoc.transactionSettings.findIndex(s => s.email === email);
  
      if (existingIndex !== -1) {
        // Update existing transportation details
        transportationDetails.forEach(detail => {
          if (detail.index !== undefined) {
            // Ensure we update the detail at the correct index
            settingsDoc.transactionSettings[existingIndex].transportationDetails[detail.index] = {
              enable: detail.enable || false,
              value: detail.value || "",
              index: detail.index
            };
          }
        });
      } else {
        // Create new transaction settings with transportation details
        settingsDoc.transactionSettings.push({
          email,
          transportationDetails: transportationDetails.map(detail => ({
            enable: detail.enable || false,
            value: detail.value || "",
            index: detail.index
          }))
        });
      }
  
      // Save the updated settings
      await settingsDoc.save();
  
      // Return success response
      return res.status(200).json({
        success: true,
        message: existingIndex !== -1 
          ? "Transportation details updated successfully." 
          : "Transportation details added successfully.",
        settings: settingsDoc.transactionSettings[
          existingIndex !== -1 ? existingIndex : settingsDoc.transactionSettings.length - 1
        ]
      });
  
    } catch (error) {
      console.error('Error updating transportation details:', error);
      return res.status(500).json({ 
        message: "Server error.", 
        error: error.message 
      });
    }
};

module.exports.addTaxRates = async (req, res) => {
    try {
        let { email, taxRates, taxGroups } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        // Ensure taxRates and taxGroups are arrays
        if (taxRates && !Array.isArray(taxRates)) {
            taxRates = [taxRates];
        }
        if (taxGroups && !Array.isArray(taxGroups)) {
            taxGroups = [taxGroups];
        }

        const settingsDoc = await getOrCreateSettings(email);

        // Find existing GST settings index
        const gstSettingsIndex = settingsDoc.taxesGstSettings.findIndex(s => s.email === email);

        if (gstSettingsIndex !== -1) {
            // Update existing GST settings
            if (taxRates) {
                settingsDoc.taxesGstSettings[gstSettingsIndex].taxRates = taxRates;
            }
            if (taxGroups) {
                settingsDoc.taxesGstSettings[gstSettingsIndex].taxGroups = taxGroups;
            }
        } else {
            // Add new GST settings
            settingsDoc.taxesGstSettings.push({
                email,
                taxRates: taxRates || [],
                taxGroups: taxGroups || []
            });
        }

        await settingsDoc.save();
        // Create a set of tax rates from updatedTaxRates to avoid duplicates
        const updatedTaxRates = taxRates.map(rate => ({
            name: rate.name,
            rate: rate.rate
        }));

        // Find the user and check if any of the updatedTaxRates already exist
        const user = await User.findOne({ email: email });

        // Filter out tax rates that already exist in the user's taxRates array
        const newTaxRates = updatedTaxRates.filter(updatedRate => {
            return !user.taxRates.some(existingRate =>
                existingRate.name === updatedRate.name && existingRate.rate === updatedRate.rate
            );
        });

        // If there are new tax rates, update the user's taxRates array
        if (newTaxRates.length > 0) {
            await User.findOneAndUpdate(
                { email: email },
                { $push: { taxRates: { $each: newTaxRates } } }
            );
        }

        return res.status(200).json({
            message: gstSettingsIndex !== -1 ? "Tax settings updated successfully." : "Tax settings created successfully.",
            data: settingsDoc.taxesGstSettings[gstSettingsIndex !== -1 ? gstSettingsIndex : settingsDoc.taxesGstSettings.length - 1]
        });
    } catch (error) {
        console.error('Error in addTaxRates:', error);
        return res.status(500).json({
            message: "Server error.",
            error: error.message
        });
    }
};

module.exports.addPartySettings = async (req, res) => {
    try {
        const {
            email,
            partyGrouping,
            shippingAddress,
            enablePaymentReminder,
            paymentReminderDays,
            additionalFields,
            loyaltyPoints,
            reminderMessage
        } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const settingsDoc = await getOrCreateSettings(email);

        const partySettings = {
            email,
            partyGrouping,
            shippingAddress,
            enablePaymentReminder,
            paymentReminderDays,
            additionalFields,
            loyaltyPoints,
            reminderMessage
        };

        // Update or add party settings
        const existingIndex = settingsDoc.partySettings.findIndex(s => s.email === email);
        if (existingIndex !== -1) {
            settingsDoc.partySettings[existingIndex] = partySettings;
        } else {
            settingsDoc.partySettings.push(partySettings);
        }

        await settingsDoc.save();
        return res.status(200).json({
            message: existingIndex !== -1 ? "Party settings updated successfully." : "Party settings created successfully.",
            partySettings: settingsDoc.partySettings[existingIndex !== -1 ? existingIndex : settingsDoc.partySettings.length - 1]
        });
    } catch (error) {
        console.error("Error adding party settings:", error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.addTransactionMessageSettings = async (req, res) => {
    try {
        const {
            email,
            sendSMS,
            sendCopy,
            whatsappLoggedIn,
            messageTemplate,
            variables,
            transactionType,
        } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const settingsDoc = await getOrCreateSettings(email);

        const messageSettings = {
            email,
            sendSMS,
            sendCopy,
            whatsappLoggedIn,
            messageTemplate,
            variables,
            transactionType,
        };

        // Update or add transaction message settings
        const existingIndex = settingsDoc.transactionMessageSettings.findIndex(s => s.email === email);
        if (existingIndex !== -1) {
            settingsDoc.transactionMessageSettings[existingIndex] = messageSettings;
        } else {
            settingsDoc.transactionMessageSettings.push(messageSettings);
        }

        await settingsDoc.save();
        return res.status(200).json({
            success: true,
            message: existingIndex !== -1 ? "Transaction message settings updated successfully." : "Transaction message settings created successfully.",
            transactionSettings: settingsDoc.transactionMessageSettings[existingIndex !== -1 ? existingIndex : settingsDoc.transactionMessageSettings.length - 1]
        });
    } catch (error) {
        console.error("Error in saving transaction message settings:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while saving the transaction message settings.",
            error: error.message,
        });
    }
};

module.exports.getGeneralSettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.generalSettings.length) {
            // Return default general settings
            const defaultSettings = {
                email,
                enablePasscode: false,
                passcode: "",
                confirmPasscode: "",
                businessCurrency: "USD",
                amount: "0.00",
                gstnumber: false,
                multiFirm: false,
                company: "DEFAULT",
                autoBackup: false,
                auditTrail: false,
                screenZoom: 100,
                showPasscodeDialog: false,
                estimateQuotation: false,
                salePurchaseOrder: false,
                otherIncome: false,
                fixedAssets: false,
                deliveryChallan: false,
                goodsReturnOnDeliveryChallan: false,
                printAmountInDeliveryChallan: false,
                godownManagement: false
            };
            return res.status(200).json({ generalSettings: defaultSettings });
        }

        const generalSettings = settings.generalSettings.find(s => s.email === email);
        return res.status(200).json({ generalSettings });
    } catch (error) {
        console.error('Error fetching general settings:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

module.exports.getTransactionSettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.transactionSettings.length) {
            // Return default transaction settings
            const defaultSettings = {
                email,
                header: {
                    invoiceBillNo: true,
                    addTimeOnTransactions: false,
                    cashSaleByDefault: false,
                    billingNameOfParties: false,
                    customersPODetails: false,
                },
                itemsTable: {
                    inclusiveExclusiveTax: true,
                    displayPurchasePrice: true,
                    showLastFiveSalePrice: false,
                    freeItemQuantity: false,
                    count: false,
                },
                taxesAndTotals: {
                    transactionWiseTax: false,
                    transactionWiseDiscount: false,
                    roundOffTotal: true,
                    roundingMethod: "nearest",
                    roundingValue: "1",
                },
                moreFeatures: {
                    eWayBillNo: false,
                    quickEntry: false,
                    doNotShowInvoicePreview: false,
                    enablePasscodeForEdit: false,
                    discountDuringPayments: false,
                    linkPaymentsToInvoices: false,
                    dueDatesAndPaymentTerms: false,
                    showProfitOnSaleInvoice: false,
                },
                transactionPrefixes: {
                    firm: "",
                    sale: "none",
                    creditNote: "none",
                    deliveryChallan: "none",
                    paymentIn: "none",
                }
            };
            return res.status(200).json(defaultSettings);
        }

        const transactionSettings = settings.transactionSettings.find(s => s.email === email);
        return res.status(200).json(transactionSettings);
    } catch (error) {
        console.error('Error fetching transaction settings:', error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.getTaxRates = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.taxesGstSettings.length) {
            // Return default tax settings
            const defaultSettings = {
                taxRates: [],
                taxGroups: [],
                gstEnabled: false,
                hsnEnabled: false,
                additionalCess: false,
                reverseCharge: false,
                placeOfSupply: false,
                compositeScheme: false,
                tcsEnabled: false,
                tdsEnabled: false
            };
            return res.status(200).json(defaultSettings);
        }

        const taxSettings = settings.taxesGstSettings.find(s => s.email === email);
        return res.status(200).json({
            taxRates: taxSettings.taxRates,
            taxGroups: taxSettings.taxGroups
        });
    } catch (error) {
        console.error('Error fetching tax rates:', error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.getPartySettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.partySettings.length) {
            // Return default party settings
            const defaultSettings = {
                email,
                partyGrouping: false,
                shippingAddress: false,
                enablePaymentReminder: false,
                paymentReminderDays: 1,
                additionalFields: [
                    {
                        enabled: false,
                        fieldName: "",
                        showInPrint: false,
                        type: "text"
                    },
                    {
                        enabled: false,
                        fieldName: "",
                        showInPrint: false,
                        type: "text"
                    },
                    {
                        enabled: false,
                        fieldName: "",
                        showInPrint: false,
                        type: "text"
                    },
                    {
                        enabled: false,
                        fieldName: "",
                        showInPrint: false,
                        type: "date"
                    }
                ],
                loyaltyPoints: {
                    enabled: true
                },
                reminderMessage: {
                    additionalMessage: "",
                    defaultMessage: "If you have already made the payment, kindly ignore this message."
                }
            };
            return res.status(200).json({ partySettings: defaultSettings });
        }

        const partySettings = settings.partySettings.find(s => s.email === email);
        return res.status(200).json({ partySettings });
    } catch (error) {
        console.error("Error fetching party settings:", error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

module.exports.getTransactionMessageSettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.transactionMessageSettings.length) {
            // Return default transaction message settings
            const defaultSettings = {
                email,
                sendSMS: false,
                sendCopy: false,
                whatsappLoggedIn: false,
                messageTemplate: {
                    greeting: "Greetings from [Firm_Name]",
                    intro: "We are pleased to have you as a valuable customer. Please find the details of your transaction.",
                    transactionLabel: "[Transaction_Type] :",
                    invoiceAmount: "Invoice Amount: [Invoice_Amount]",
                    balance: "Balance: [Transaction_Balance]",
                    thanks: "Thanks for doing business with us.",
                    regards: "Regards,",
                    firmName: "[Firm_Name]"
                },
                variables: {
                    firmName: "NewCompany",
                    transactionType: "Sale Invoice",
                    invoiceAmount: "792",
                    balance: "0"
                },
                transactionType: "Sales Transaction"
            };
            return res.status(200).json({
                success: true,
                transactionMessageSettings: defaultSettings
            });
        }

        const messageSettings = settings.transactionMessageSettings.find(s => s.email === email);
        return res.status(200).json({
            success: true,
            transactionMessageSettings: messageSettings
        });
    } catch (error) {
        console.error("Error in fetching transaction message settings:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching the transaction message settings.",
            error: error.message
        });
    }
};

module.exports.addPrintSettings = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        let settings = await Settings.findOne({ email });

        if (settings) {
            if (settings.printSettings && settings.printSettings.length > 0) {
                settings.printSettings[0] = { ...settings.printSettings[0], ...req.body };
            } else {
                settings.printSettings = [req.body];
            }

            await settings.save();
        } else {
            settings = new Settings({
                email,
                printSettings: [req.body]
            });
            await settings.save();
        }

        res.status(200).json({
            success: true,
            message: 'Print settings updated successfully',
            data: settings.printSettings[0]
        });

    } catch (error) {
        console.error('Error in print settings update:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating print settings',
            error: error.message
        });
    }
}


module.exports.getPrintSettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const settings = await Settings.findOne({ email });

        if (!settings || !settings.printSettings || settings.printSettings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Print settings not found for this email'
            });
        }

        res.status(200).json({
            success: true,
            data: settings.printSettings[0]
        });

    } catch (error) {
        console.error('Error in getting print settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving print settings',
            error: error.message
        });
    }
}

module.exports.getThermalPrintSettings = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Fetch settings from the database
        const settings = await Settings.findOne({ email });

        if (!settings || !settings.printSettings || settings.printSettings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Thermal print settings not found for this email'
            });
        }

        // Extract only the thermal print settings (from the schema fields)
        const thermalPrintSettings = {
            selectedTheme: settings.printSettings[0].selectedTheme,
            printerSettings: {
                pageSize: settings.printSettings[0].printerSettings.pageSize,
                makeDefault: settings.printSettings[0].printerSettings.makeDefault,
                useTextStyling: settings.printSettings[0].printerSettings.useTextStyling,
                autoCutPaper: settings.printSettings[0].printerSettings.autoCutPaper,
                openCashDrawer: settings.printSettings[0].printerSettings.openCashDrawer,
                extraLines: settings.printSettings[0].printerSettings.extraLines,
                numberOfCopies: settings.printSettings[0].printerSettings.numberOfCopies,
                colors: settings.printSettings[0].printerSettings.colors,
            },
            companyInfo: {
                companyName: settings.printSettings[0].companyInfo.companyName,
                includeLogo: settings.printSettings[0].companyInfo.includeLogo,
                address: settings.printSettings[0].companyInfo.address,
                email: settings.printSettings[0].companyInfo.email,
                phone: settings.printSettings[0].companyInfo.phone,
                gstin: settings.printSettings[0].companyInfo.gstin,
            },
            itemTableSettings: settings.printSettings[0].itemTableSettings,
            totalsAndTaxes: settings.printSettings[0].totalsAndTaxes,
            footerSettings: settings.printSettings[0].footerSettings,
        };

        res.status(200).json({
            success: true,
            data: thermalPrintSettings
        });

    } catch (error) {
        console.error('Error in getting thermal print settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving thermal print settings',
            error: error.message
        });
    }
}
