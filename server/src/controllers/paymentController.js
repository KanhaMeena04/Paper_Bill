const Payment = require('../models/payment');
const Party = require('../models/party');

// module.exports.addPayment = async (req, res) => {
//     try {
//         const { paymentId, orderId, amount, paymentMethod } = req.body;
//         const customerName = req.user.username;

//         await Payment.create({
//             paymentId,
//             orderId,
//             customerName,
//             paymentMethod: paymentMethod,
//             paymentStatus: "Pending",
//             amount,
//             paymentDate: new Date()
//         });
//         res.status(200).json({ success: true, message: 'Payment added successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };



module.exports.addPaymentIn = async (req, res) => {
    try {
        const {
            date,
            time,
            receiptNo,
            partyId,
            partyName,
            paymentType,
            description,
            received,
            discount,
            dueDate,
            firm
        } = req.body;

        const total = Number(received) + Number(discount);
        const currentParty = await Party.findOneAndUpdate(
            { partyId: partyId },
            { $inc: { openingBalance: received } },
            { new: true } // Yeh ensure karega ki updated document return ho
        );
        const payment = new Payment({
            type: 'payment-in',
            date,
            time,
            receiptNo,
            partyId,
            partyName,
            paymentType,
            description,
            received,
            discount,
            total: currentParty.openingBalance,
            dueDate,
            firm,
            status: received >= total ? 'Paid' : 'Pending'
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment added successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding payment',
            error: error.message
        });
    }
};

module.exports.getPaymentIn = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            firm = 'ALL FIRMS',
            searchQuery,
            paymentType
        } = req.query;

        let query = { type: 'payment-in' };

        // Date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Firm filter
        if (firm !== 'ALL FIRMS') {
            query.firm = firm;
        }

        // Payment type filter
        if (paymentType && paymentType !== 'All Payment') {
            query.paymentType = paymentType;
        }

        // Search query
        if (searchQuery) {
            query.$or = [
                { partyName: { $regex: searchQuery, $options: 'i' } },
                { receiptNo: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const payments = await Payment.find(query)
            .sort({ date: -1 })
            .populate('partyId', 'partyName');

        const totalAmount = payments.reduce((sum, payment) => sum + payment.total, 0);
        const totalBalance = payments.reduce((sum, payment) => sum + (payment.total - payment.received), 0);

        res.status(200).json({
            success: true,
            payments,
            totalAmount,
            totalBalance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

module.exports.addPaymentOut = async (req, res) => {
    try {
        const {
            date,
            time,
            receiptNo,
            partyId,
            partyName,
            paymentType,
            description,
            paid,
            firm
        } = req.body;
        const currentParty = await Party.findOneAndUpdate(
            { partyId: partyId },
            { $inc: { openingBalance: -paid } },
            { new: true }
        );
        // console.log(currentParty)
        const payment = new Payment({
            type: 'payment-out',
            date,
            time,
            receiptNo,
            partyId,
            partyName,
            paymentType,
            description,
            paid,
            total: currentParty.openingBalance,
            firm,
            status: 'Paid'
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment added successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding payment',
            error: error.message
        });
    }
};

module.exports.getPaymentOut = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            firm = 'ALL FIRMS',
            searchQuery,
            paymentType
        } = req.query;

        let query = { type: 'payment-out' };

        // Date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Firm filter
        if (firm !== 'ALL FIRMS') {
            query.firm = firm;
        }

        // Payment type filter
        if (paymentType && paymentType !== 'All Payment') {
            query.paymentType = paymentType;
        }

        // Search query
        if (searchQuery) {
            query.$or = [
                { partyName: { $regex: searchQuery, $options: 'i' } },
                { receiptNo: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const payments = await Payment.find(query)
            .sort({ date: -1 })
            .populate('partyId', 'partyName');

        const totalAmount = payments.reduce((sum, payment) => sum + payment.total, 0);
        const totalBalance = payments.reduce((sum, payment) => sum + (payment.total - payment.paid), 0);

        res.status(200).json({
            success: true,
            payments,
            totalAmount,
            totalBalance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

module.exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({}).sort({ date: -1 });
        res.status(200).json({ success: true, payments: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
    }
}