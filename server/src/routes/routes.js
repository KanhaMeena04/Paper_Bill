const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const partyRoutes = require('./partyRoutes');
const itemRoutes = require('./itemRoutes');
const billRoutes = require('./billRoutes');
const bankRoutes = require('./bankRoutes');
const journalEntryRoutes = require('./journalEntryRoutes');
const backupRoutes = require('./backupRoute');
const expensesRoutes = require('./expensesRoutes');
const settingsRoutes = require('./settingsRoutes');
const scheduleDeliveries = require('./scheduleDeliveries')

router.use('/auth', authRoutes);
router.use('/order', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/party', partyRoutes);
router.use('/item', itemRoutes);
router.use('/bill', billRoutes);
router.use('/bank', bankRoutes);
router.use('/journalEntry', journalEntryRoutes);
router.use('/settings', settingsRoutes);
router.use('/backup', backupRoutes); 
router.use('/expense', expensesRoutes)
router.use('/scheduleDeliveries', scheduleDeliveries)

module.exports = router;