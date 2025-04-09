const express = require('express');
const router = express.Router()
const {getAllBackup, scheduleCronJob, syncShare, getPaperBillData} = require('../controllers/backupController')

router.get('/getBackup', getAllBackup)
router.post('/scheduleCronJob', scheduleCronJob)
router.post('/sync-share', syncShare)
router.get('/getPaperBillData', getPaperBillData)

module.exports = router;