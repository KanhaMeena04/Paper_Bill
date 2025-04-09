const express = require('express');
const router = express.Router();
const { addToCart, getCartItems, removeItemFromCart } = require('../controllers/orderController');
const { protect } = require("../middlewares/AuthMiddleware");

router.post('/addToCart', protect, addToCart)
router.get('/getCartItems', protect, getCartItems)
router.delete('/removeItemFromCart/:itemId', protect, removeItemFromCart)

module.exports = router;