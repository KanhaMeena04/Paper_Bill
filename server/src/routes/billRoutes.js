const express = require('express');
const router = express.Router();
const {addBill, getBill, getInvoices, billWiseProfit} = require('../controllers/billsController');

router.post("/addBill", addBill)
router.get("/getBill", getBill)
router.get("/getInvoices", getInvoices)
router.get("/billWiseProfit", billWiseProfit)

module.exports = router;