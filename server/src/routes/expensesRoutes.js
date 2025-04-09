const express = require('express')
const router = express.Router();
const {addExpenseItems, addExpenseCategory, getExpenseCategory, getExpenseItems, addExpenses, getExpenses} = require('../controllers/expensesController')

router.post("/addExpenseItem", addExpenseItems)
router.post("/addExpenses", addExpenses)
router.get("/getExpenseItems", getExpenseItems)
router.get("/getExpenses", getExpenses)
router.post("/addExpenseCategory", addExpenseCategory)
router.get("/getExpenseCategory", getExpenseCategory)
router.get("/getExpenseCategory", getExpenseCategory)


module.exports = router;