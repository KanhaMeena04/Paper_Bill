const mongoose = require("mongoose");

const ExpensesSchema = new mongoose.Schema({
    expenseType: {
        type: String,
        //required: true
    },
    expenseCategory: {
        type: String,
        //required: true
    },
    categoryId: {
        type: String,
        unique: true // Ensure categoryId is unique
    }
});

// Pre-save hook to generate a unique 4-digit categoryId
ExpensesSchema.pre("save", async function (next) {
    if (!this.categoryId) {
        let isUnique = false;
        while (!isUnique) {
            // Generate a 4-digit random number
            const randomId = Math.floor(1000 + Math.random() * 9000).toString();

            // Check if the generated categoryId is unique
            const existingExpense = await mongoose.model("ExpenseCategory").findOne({ categoryId: randomId });
            if (!existingExpense) {
                this.categoryId = randomId; // Assign the unique ID
                isUnique = true;
            }
        }
    }
    next();
});

module.exports = mongoose.model("ExpenseCategory", ExpensesSchema);
