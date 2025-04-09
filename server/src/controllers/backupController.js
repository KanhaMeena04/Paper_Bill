const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Import models
const Bank = require('../models/bank');
const User = require('../models/User');
const Bill = require("../models/bills");
const Party = require('../models/party');
const Category = require('../models/category');
const Item = require('../models/item');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Payment = require('../models/payment');
const JournalEntry = require('../models/journalEntry');
const PaperBill = require('../models/paperBill');

module.exports.getAllBackup = async () => {
    try {
        // Fetch all necessary data from your database
        const bankData = await Bank.find({});
        const userData = await User.find({});
        const billData = await Bill.find({});
        const partyData = await Party.find({});
        const categoryData = await Category.find({});
        const itemData = await Item.find({});
        const productData = await Product.find({});
        const cartData = await Cart.find({});
        const orderData = await Order.find({});
        const paymentData = await Payment.find({});
        const journalEntryData = await JournalEntry.find({});

        // Structure the data into a single object
        const backupData = {
            banks: bankData,
            users: userData,
            bills: billData,
            parties: partyData,
            categories: categoryData,
            items: itemData,
            products: productData,
            carts: cartData,
            orders: orderData,
            payments: paymentData,
            journalEntries: journalEntryData
        };

        return backupData; // Return the backup data
    } catch (error) {
        console.error('Error generating backup:', error);
        throw new Error('Failed to fetch data for backup');
    }
};

module.exports.scheduleCronJob = async (req, res) => {
    const { backupIntervalDays, accessToken } = req.body;
    if (!backupIntervalDays || !accessToken) {
        res.status(400).json({ success: false, error: "Please provide a valid interval and log in to Google Drive." });
        return;
    }

    const intervalInDays = parseInt(backupIntervalDays);
    if (isNaN(intervalInDays) || intervalInDays <= 0) {
        res.status(400).json({ success: false, error: "Please enter a valid number of days." });
        return;
    }

    // Cron job expression to run every `intervalInDays` days
    const cronExpression = `0 0 */${intervalInDays} * *`;

    cron.schedule(cronExpression, async () => {
        console.log(`Running auto-backup every ${intervalInDays} days.`);

        try {
            // Get the backup data from getAllBackup
            const backupData = await module.exports.getAllBackup();

            const metadata = {
                name: `backup-${new Date().toISOString().split("T")[0]}.json`,
                mimeType: "application/json",
            };

            // Create multipart form data
            const form = new FormData();
            form.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], { type: "application/json" })
            );
            form.append(
                "file",
                new Blob([JSON.stringify(backupData)], { type: "application/json" })
            );

            // Upload to Google Drive
            const uploadResponse = await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: form,
                }
            );

            if (!uploadResponse.ok) {
                throw new Error("Upload failed");
            }

            console.log("Backup completed successfully!");
        } catch (error) {
            console.error("Error in auto-backup:", error);
        }
    });

    res.status(200).json({ success: true, message: `Auto Backup scheduled every ${intervalInDays} days.` });
};

module.exports.syncShare = async (req, res) => {
    try {
        const { phoneNumber, offlineData } = req.body;


        if (!phoneNumber || !offlineData) {
            return res.status(400).json({
                success: false,
                error: "Missing required data for synchronization."
            });
        }

        console.log(`Starting sync for user with phone: ${phoneNumber}`);

        // Find existing document or create new one
        let paperBillDoc = await PaperBill.findOne({ phoneNumber });
        if (!paperBillDoc) {
            paperBillDoc = new PaperBill({
                phoneNumber,
                allDatabases: {}
            });
            console.log(`Created new paperBill document for phone: ${phoneNumber}`);
        }

        const syncResults = {
            success: true,
            counts: {},
            errors: []
        };

        // Process each collection type from offlineData
        const collections = [
            'banks', 'bills', 'carts', 'categories', 'conversions',
            'expenseCategories', 'expenseItems', 'expenses', 'items',
            'journalEntries', 'orders', 'parties', 'payments',
            'products', 'schedules', 'settings', 'units'
        ];

        // Map offlineData keys to schema keys (handling casing differences)
        const keyMapping = {
            'expensecategories': 'expenseCategories',
            'expenseitems': 'expenseItems',
            'journalentries': 'journalEntries',
            'schedules': 'schedules'
        };

        for (const collection of collections) {
            try {
                // Get the corresponding key from offlineData (handle different casing)
                const offlineKey = Object.keys(keyMapping).find(key =>
                    keyMapping[key] === collection) || collection;

                if (offlineData[offlineKey] && Array.isArray(offlineData[offlineKey])) {
                    // Clean data - handle MongoDB ObjectId format if needed
                    const cleanData = offlineData[offlineKey].map(item => {
                        const cleanItem = { ...item };
                        if (cleanItem._id && cleanItem._id.$oid) {
                            cleanItem._id = cleanItem._id.$oid;
                        }
                        delete cleanItem.__v;
                        return cleanItem;
                    });
                    console.log(cleanData, collection, offlineKey)
                    paperBillDoc.allDatabases[collection] = cleanData;
                    syncResults.counts[collection] = cleanData.length;
                } else {
                    // If no data for this collection, initialize as empty array
                    if (!paperBillDoc.allDatabases[collection]) {
                        paperBillDoc.allDatabases[collection] = [];
                    }
                    syncResults.counts[collection] = 0;
                }
            } catch (err) {
                console.error(`Error syncing ${collection}:`, err);
                syncResults.errors.push({
                    collection: collection,
                    error: err.message,
                });
            }
        }

        // Save the updated document
        await paperBillDoc.save();

        if (syncResults.errors.length > 0) {
            syncResults.success = false;
        }

        return res.status(200).json({
            success: syncResults.success,
            message: syncResults.success
                ? "Data synchronized successfully"
                : "Some items failed to sync",
            counts: syncResults.counts,
            errors: syncResults.errors.length > 0 ? syncResults.errors : undefined
        });

    } catch (error) {
        console.error("Error in syncPaperBill:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "An unexpected error occurred while syncing data"
        });
    }
};

module.exports.getPaperBillData = async (req, res) => {
    try {
        const { phoneNumber } = req.query;
        const PaperBill = require('../models/paperBill');

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: "Phone number is required"
            });
        }

        console.log(`Fetching data for phone: ${phoneNumber}`);

        // Find document matching the phoneNumber
        const paperBillDoc = await PaperBill.findOne({ phoneNumber });

        if (!paperBillDoc) {
            return res.status(200).json({
                success: false,
                data: {
                    banks: [],
                    bills: [],
                    carts: [],
                    categories: [],
                    conversions: [],
                    expenseCategories: [],
                    expenseItems: [],
                    expenses: [],
                    items: [],
                    journalEntries: [],
                    orders: [],
                    parties: [],
                    payments: [],
                    products: [],
                    schedules: [],
                    settings: [],
                }
            });
        }

        // Return the entire allDatabases object
        return res.status(200).json({
            success: true,
            data: paperBillDoc.allDatabases
        });

    } catch (error) {
        console.error("Error in getPaperBillData:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "An unexpected error occurred while fetching data"
        });
    }
};