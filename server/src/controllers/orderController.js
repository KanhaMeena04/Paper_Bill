const Product = require('../models/product');
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const Order = require('../models/order');



module.exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, price } = req.body;
        const userId = req.user.userId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                name: product.productName,
                image: product.image,
                price: price,
            });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
}

module.exports.getCartItems = async (req, res) => {
    try {
        const userId = req.user.userId
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(200).json({ success: false, message: 'Cart not found', length: 0 });
        }

        res.status(200).json({ success: true, data: cart, length: cart.items.length });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart items', error: error.message, length: 0 });
    }
}

module.exports.removeItemFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.userId;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        await cart.save();

        const newCartLength = cart.items.length;

        res.status(200).json({
            message: 'Item removed from cart successfully',
            newCartLength: newCartLength
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.addOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            billingInfo,
            items,
            totalAmount,
            paymentMethod,
            cgst,
            igst,
            amount,
            couponCode
        } = req.body;
        const userId = req.user.userId;

        const updatedItems = await Promise.all(items.map(async (item) => {
            const orderedProduct = await Product.findById(item.productId);
            let stockSerialNumber = null;

            if (orderedProduct && orderedProduct.stocks > 0) {
                const separatedNames = orderedProduct.productName.split(' ');
                if (separatedNames.length > 1) {
                    stockSerialNumber = `#${separatedNames[0][0]}${separatedNames[1][0]}${orderedProduct.stocks}`;
                }
            }

            if (orderedProduct) {
                orderedProduct.stocks -= item.quantity;
                await orderedProduct.save({ session });
            }

            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                stockSerialNumber
            };
        }));

        const newOrder = new Order({
            userId,
            billingInfo: {
                firstName: billingInfo.firstName,
                lastName: billingInfo.lastName,
                phone: billingInfo.phone,
                address: billingInfo.address,
                landmark: billingInfo.landmark,
                town: billingInfo.town,
                state: billingInfo.state,
                postcode: billingInfo.postcode
            },
            items: updatedItems,
            totalAmount,
            paymentMethod,
            cgst,
            igst,
            amount,
            couponCode
        });

        await newOrder.save({ session });

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.customerName.push({ email: req.user.email });
                
                if (product.stocks <= 0) {
                    product.availability = "out of stock";
                }
                
                await product.save({ session });
            }
        }

        await Cart.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: { items: [] } },
            { new: true, session }
        );

        await session.commitTransaction();

        res.status(201).json({
            message: 'Order created successfully',
            orderId: newOrder.orderId
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in order creation:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    } finally {
        session.endSession();
    }
}

