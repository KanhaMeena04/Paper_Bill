const express = require('express');
const router = express.Router();
const { addPaymentIn, getPaymentIn, addPaymentOut, getPaymentOut, getAllPayments} = require('../controllers/paymentController')
const { protect } = require("../middlewares/AuthMiddleware");

// router.post('/addPayment', protect, addPayment)
router.post('/addPaymentIn', addPaymentIn)
router.get('/getPaymentIn', getPaymentIn)
router.post('/addPaymentOut', addPaymentOut)
router.get('/getPaymentOut', getPaymentOut)
router.get('/getAllPayments', getAllPayments)

module.exports = router;