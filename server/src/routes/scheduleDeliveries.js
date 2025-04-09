const express = require('express');
const router = express.Router();
const {protect} = require('../middlewares/AuthMiddleware')
const {addScheduleDeliveries, getScheduleDeliveries} = require('../controllers/scheduleDeliveries');

router.post('/addSchedule', protect, addScheduleDeliveries)

router.get('/getSchedule', protect, getScheduleDeliveries)


module.exports = router;