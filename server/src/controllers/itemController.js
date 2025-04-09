const Category = require('../models/category');
const Item = require('../models/item');
const Unit = require('../models/units')
const Conversion = require('../models/conversions')

module.exports.addCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const newCategory = await Category.create({ categoryName });
        return res.status(201).json({
            success: true,
            message: 'Category added successfully',
            data: newCategory,
        });
    } catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while adding the category',
        });
    }
};


module.exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        return res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching categories',
        });
    }
};

module.exports.addItem = async (req, res) => {
    try {
        let itemsData = req.body;

        if (!Array.isArray(itemsData) || itemsData.length === 0) {
            itemsData = [itemsData]
        }

        // Filter out rows with all values empty
        const nonEmptyItems = itemsData.filter((item) =>
            Object.values(item).some((value) => value !== null && value !== undefined && value !== "")
        );

        if (nonEmptyItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid items to add. All rows are empty.',
            });
        }

        // Check for existing itemCodes
        const existingItemCodes = await Item.find(
            { itemCode: { $in: nonEmptyItems.map((item) => item.itemCode) } },
            { itemCode: 1 }
        );

        const existingCodesSet = new Set(existingItemCodes.map((item) => item.itemCode));

        // Filter out duplicates
        const filteredItems = nonEmptyItems.filter((item) => !existingCodesSet.has(item.itemCode));

        if (filteredItems.length === 0) {
            return res.status(409).json({
                success: false,
                message: 'All items have duplicate itemCodes or are empty. No items were added.',
            });
        }

        // Insert items while handling duplicate errors
        const addedItems = [];
        const failedItems = [];

        for (const item of filteredItems) {
            try {
                const newItem = await Item.create(item);
                addedItems.push(newItem);
            } catch (error) {
                if (error.code === 11000) {
                    // Skip duplicates
                    failedItems.push({
                        itemCode: item.itemCode,
                        error: 'Duplicate itemCode',
                    });
                } else {
                    console.error('Error adding item:', error);
                    failedItems.push({
                        itemCode: item.itemCode,
                        error: 'Failed to add item',
                    });
                }
            }
        }

        // Delete items where both itemName and itemCode are empty
        const deletedItems = await Item.deleteMany({
            $or: [
                { itemName: { $eq: null }, itemCode: { $eq: null } },
                { itemName: '', itemCode: '' },
            ],
        });

        return res.status(201).json({
            success: true,
            message: `${addedItems.length} items added successfully`,
            data: addedItems,
            errors: failedItems.length > 0 ? failedItems : null,
            deletedCount: deletedItems.deletedCount,
        });
    } catch (error) {
        console.error('Error adding items:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while adding the items',
        });
    }
};

module.exports.editItem = async (req, res) => {
    try {
        const itemsData = req.body;
        let { itemCode, itemName } = itemsData;

        let existingItem;

        if (itemCode) {
            // Find item by itemCode
            existingItem = await Item.findOne({ itemCode });
        } else if (itemName) {
            // Find item by itemName if itemCode is not provided
            existingItem = await Item.findOne({ itemName });

            if (existingItem) {
                // Generate a 6-digit random number as itemCode
                itemCode = Math.floor(100000 + Math.random() * 900000).toString();
                itemsData.itemCode = itemCode; // Add the new itemCode to the update data
            }
        }

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found with the provided itemCode or itemName',
            });
        }

        // Extract opening quantities and update existing values
        const openingPrimaryQuantity = Number(itemsData.openingPrimaryQuantity) || 0;
        const openingSecondaryQuantity = Number(itemsData.openingSecondaryQuantity) || 0;

        const updatedOpeningPrimaryQuantity = existingItem.openingPrimaryQuantity + openingPrimaryQuantity;
        const updatedOpeningSecondaryQuantity = existingItem.openingSecondaryQuantity + openingSecondaryQuantity;

        // Remove null/empty values from update data
        const updateData = Object.fromEntries(
            Object.entries(itemsData).filter(([key, value]) =>
                value !== null && value !== undefined && value !== "" &&
                key !== "openingPrimaryQuantity" && key !== "openingSecondaryQuantity" // Exclude since manually updated
            )
        );

        // Include updated opening quantities
        updateData.openingPrimaryQuantity = updatedOpeningPrimaryQuantity;
        updateData.openingSecondaryQuantity = updatedOpeningSecondaryQuantity;

        // If no valid update fields
        if (Object.keys(updateData).length <= 1) { // <= 1 because itemCode is always included
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update',
            });
        }

        try {
            // Update the item
            const updatedItem = await Item.findOneAndUpdate(
                { _id: existingItem._id }, // Use _id for consistency
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found or update failed',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Item updated successfully',
                data: updatedItem,
            });

        } catch (updateError) {
            if (updateError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate key error. Some fields must be unique.',
                    error: updateError.message
                });
            }

            throw updateError; // Will be caught by outer catch block
        }

    } catch (error) {
        console.error('Error editing item:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while editing the item',
            error: error.message
        });
    }
};


module.exports.deleteItem = async (req, res) => {
    try {
        const { itemCode } = req.body;

        // Validate itemCode is provided
        if (!itemCode) {
            return res.status(400).json({
                success: false,
                message: 'ItemCode is required for deletion',
            });
        }

        // Check if item exists
        const existingItem = await Item.findOne({ itemCode });

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found with the provided itemCode',
            });
        }

        // Delete the item
        const deletedItem = await Item.findOneAndDelete({ itemCode });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found or deletion failed',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Item deleted successfully',
            data: deletedItem,
        });

    } catch (error) {
        console.error('Error deleting item:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the item',
            error: error.message
        });
    }
};

module.exports.updateItems = async (req, res) => {
    try {
        const itemsToUpdate = req.body;

        if (!Array.isArray(itemsToUpdate) || itemsToUpdate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: Provide an array of items to update',
            });
        }

        const updateResults = {
            successful: [],
            failed: []
        };

        // Process each item update
        for (const item of itemsToUpdate) {
            if (!item._id) {
                updateResults.failed.push({
                    item,
                    error: 'Missing _id field'
                });
                continue;
            }

            try {
                // Remove _id from the update object
                const { _id, ...updateData } = item;

                // Perform the update
                const updatedItem = await Item.findByIdAndUpdate(
                    _id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );

                if (updatedItem) {
                    updateResults.successful.push(updatedItem);
                } else {
                    updateResults.failed.push({
                        item,
                        error: 'Item not found'
                    });
                }
            } catch (error) {
                console.error('Error updating item:', error);
                updateResults.failed.push({
                    item,
                    error: error.message
                });
            }
        }

        // Prepare the response
        const response = {
            success: true,
            message: `Successfully updated ${updateResults.successful.length} items`,
            data: {
                successful: updateResults.successful,
                failed: updateResults.failed,
                totalProcessed: itemsToUpdate.length,
                successCount: updateResults.successful.length,
                failureCount: updateResults.failed.length
            }
        };

        // If some updates failed but others succeeded
        if (updateResults.failed.length > 0 && updateResults.successful.length > 0) {
            response.message = `Partially successful: ${updateResults.successful.length} updated, ${updateResults.failed.length} failed`;
            return res.status(207).json(response);
        }

        // If all updates failed
        if (updateResults.successful.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All updates failed',
                errors: updateResults.failed
            });
        }

        // If all updates succeeded
        return res.status(200).json(response);

    } catch (error) {
        console.error('Error in bulk update:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the items',
            error: error.message
        });
    }
};


module.exports.getItems = async (req, res) => {
    try {
        const items = await Item.find();

        return res.status(200).json({
            success: true,
            message: 'Items retrieved successfully',
            data: items,
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching items',
        });
    }
};

// Add Primary Unit
module.exports.addPrimaryUnit = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Unit name and email are required" });
        }

        let unit = await Unit.findOne({ email });
        if (!unit) {
            unit = new Unit({ email, primaryUnit: [], secondaryUnit: [] });
        }

        if (unit.primaryUnit.some(u => u.name.toUpperCase() === name.toUpperCase())) {
            return res.status(400).json({ message: "Primary unit already exists" });
        }

        unit.primaryUnit.push({ name });
        await unit.save();

        res.status(201).json({ message: "Primary unit added successfully", unit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add Secondary Unit
module.exports.addSecondaryUnit = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Unit name and email are required" });
        }

        let unit = await Unit.findOne({ email });
        if (!unit) {
            unit = new Unit({ email, primaryUnit: [], secondaryUnit: [] });
        }

        if (unit.secondaryUnit.some(u => u.name.toUpperCase() === name.toUpperCase())) {
            return res.status(400).json({ message: "Secondary unit already exists" });
        }

        unit.secondaryUnit.push({ name });
        await unit.save();

        res.status(201).json({ message: "Secondary unit added successfully", unit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get All Primary Units by Email
module.exports.getAllPrimaryUnits = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const unit = await Unit.findOne({ email });
        if (!unit || unit.primaryUnit.length === 0) {
            return res.status(200).json({ success: false, primaryUnits: [] });
        }
        res.status(200).json({ success: true, primaryUnit: unit.primaryUnit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get All Secondary Units by Email
module.exports.getAllSecondaryUnits = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const unit = await Unit.findOne({ email });
        if (!unit || unit.secondaryUnit.length === 0) {
            return res.status(200).json({ success: false, secondaryUnit: [] });
        }
        res.status(200).json({ success: true, secondaryUnit: unit.secondaryUnit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.addConversions = async (req, res) => {
    try {
        const { email, primaryUnit, secondaryUnit, conversionRate } = req.body;

        if (!email || !primaryUnit || !secondaryUnit || !conversionRate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let userConversions = await Conversion.findOne({ email });

        if (userConversions) {
            // Check if primaryUnit already exists in the conversions array
            const existingConversionIndex = userConversions.conversions.findIndex(
                (conv) => conv.primaryUnit === primaryUnit
            );

            if (existingConversionIndex !== -1) {
                // Update the existing conversion
                userConversions.conversions[existingConversionIndex] = {
                    primaryUnit,
                    secondaryUnit,
                    conversionFactor: conversionRate,
                };
            } else {
                // Add a new conversion if primaryUnit doesn't exist
                userConversions.conversions.push({
                    primaryUnit,
                    secondaryUnit,
                    conversionFactor: conversionRate,
                });
            }

            await userConversions.save();
            return res.status(200).json({ message: "Conversion updated successfully", data: userConversions });

        } else {
            // Create a new document for the email
            const newConversion = new Conversion({
                email,
                conversions: [{ primaryUnit, secondaryUnit, conversionFactor: conversionRate }],
            });

            await newConversion.save();
            return res.status(201).json({ message: "Conversion added successfully", data: newConversion });
        }

    } catch (error) {
        console.error("Error adding conversion:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.getConversions = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const conversions = await Conversion.findOne({ email });

        if (!conversions) {
            return res.status(200).json({ message: "No conversions found", data: [] });
        }

        return res.status(200).json({ data: conversions.conversions });
    } catch (error) {
        console.error("Error fetching conversions:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.verifyItemName = async (req, res) => {
    try {
        const { itemName } = req.body;

        if (!itemName) {
            return res.status(400).json({
                success: false,
                message: 'Item name is required for verification'
            });
        }

        // Check if an item with this name already exists
        const existingItem = await Item.findOne({ 
            itemName: { $regex: new RegExp(`^${itemName}$`, 'i') } // Case-insensitive search
        });

        return res.status(200).json({
            success: true,
            isUnique: !existingItem,
            message: existingItem ? 'Item name already exists' : 'Item name is available'
        });

    } catch (error) {
        console.error('Error verifying item name:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the item name',
            error: error.message
        });
    }
};