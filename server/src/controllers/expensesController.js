const ExpenseCategory = require('../models/expenseCategory');
const ExpenseItems = require('../models/expenseItems');
const Expenses = require('../models/expenses');

module.exports.addExpenseItems = async (req, res) => {
    try {
        const { name, hsn, price, taxRate } = req.body;

        // Validate required fields
        if (!name || !hsn || !price) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Create a new expense item
        const newExpenseItem = new ExpenseItems({
            name,
            hsn,
            price,
            taxRate,
        });

        await newExpenseItem.save();
        res.status(201).json({ message: "Expense item added successfully", newExpenseItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}
module.exports.getExpenseItems = async (req, res) => {
    try {
        const expenseItems = await ExpenseItems.find();
        res.status(200).json({ expenseItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports.addExpenseCategory = async (req, res) => {
    const { expenseCategory, expenseType } = req.body;

    try {
        // Check if expenseCategory already exists
        const existingCategory = await ExpenseCategory.findOne({ expenseCategory });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // Create a new expense category
        const newCategory = new ExpenseCategory({
            expenseCategory,
            expenseType
        });

        // Save the category to the database
        const savedCategory = await newCategory.save();
        return res.status(201).json({
            success: true,
            message: "Expense category added successfully",
            data: savedCategory
        });
    } catch (error) {
        console.error("Error adding expense category:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

// Get all expense categories
module.exports.getExpenseCategory = async (req, res) => {
    try {
        // Fetch all expense categories from the database
        const categories = await ExpenseCategory.find();
        return res.status(200).json({
            message: "Expense categories fetched successfully",
            data: categories
        });
    } catch (error) {
        console.error("Error fetching expense categories:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.addExpenses = async (req, res) => {
    try {
        const expensesData = req.body;

        if (!Array.isArray(expensesData)) {
            return res.status(400).json({ error: "Request body must be an array of expenses" });
        }

        // Validate each expense entry
        for (const expense of expensesData) {
            const { expenseNo, date, expenseCategory, expenseItems, total } = expense;
            if (!expenseNo || !date || !expenseCategory || !expenseItems || !total) {
                return res.status(400).json({
                    error: "Missing required fields in expense data",
                    invalidExpense: expense
                });
            }
        }

        // Create and save all expenses
        const savedExpenses = await Expenses.insertMany(expensesData);

        return res.status(201).json({
            message: "Expenses added successfully",
            expenses: savedExpenses
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports.getExpenses = async (req, res) => {
    try {
        // Fetch all expenses from the database
        const expenses = await Expenses.find();

        // Return the fetched expenses
        return res.status(200).json({
            message: "Expenses fetched successfully",
            data: expenses
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

