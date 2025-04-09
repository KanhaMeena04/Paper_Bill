// const express = require('express')
// const router = express.Router();
// const {addGeneralSettings, getGeneralSettings, addTransactionSettings, getTransactionSettings, addTaxRates, getTaxRates, addPartySettings, getPartySettings, addTransactionMessageSettings, getTransactionMessageSettings} = require('../controllers/settingsController')

// router.post('/addGeneralsettings', addGeneralSettings)
// router.get('/getGeneralSettings', getGeneralSettings)
// router.post('/addTransactionSettings', addTransactionSettings)
// router.get('/getTransactionSettings', getTransactionSettings)
// router.post('/addTaxRates', addTaxRates)
// router.get('/getTaxRates', getTaxRates)
// router.post('/addPartySettings', addPartySettings)
// router.get('/getPartySettings', getPartySettings)
// router.post('/addTransactionMessageSettings', addTransactionMessageSettings)
// router.get('/getTransactionMessageSettings', getTransactionMessageSettings)

// module.exports = router;

const express = require('express');
const router = express.Router();
const {addGeneralSettings, getGeneralSettings, addTransactionSettings, addAdditionalTransactionSettings, getTransactionSettings, addTaxRates, getTaxRates, addPartySettings, getPartySettings, addTransactionMessageSettings, getTransactionMessageSettings, addPrintSettings, getPrintSettings, getThermalPrintSettings, addAdditionalCharges, addTransportationDetails} = require('../controllers/settingsController')
const { executeSequentially } = require('../controllers/settingsController');  // You'll need to create this file
const sequentialMiddleware = executeSequentially();

router.post('/addGeneralsettings', sequentialMiddleware, addGeneralSettings);
router.get('/getGeneralSettings', getGeneralSettings);

router.post('/addTransactionSettings', sequentialMiddleware, addTransactionSettings);
router.post('/addAdditionalTransactionSettings', sequentialMiddleware, addAdditionalTransactionSettings);
router.post('/addAdditionalCharges', sequentialMiddleware, addAdditionalCharges);
router.post('/addTransportationDetails', sequentialMiddleware, addTransportationDetails);
router.get('/getTransactionSettings', getTransactionSettings);

router.post('/addTaxRates', sequentialMiddleware, addTaxRates);
router.get('/getTaxRates', getTaxRates);

router.post('/addPartySettings', sequentialMiddleware, addPartySettings);
router.get('/getPartySettings', getPartySettings);

router.post('/addTransactionMessageSettings', sequentialMiddleware, addTransactionMessageSettings);
router.get('/getTransactionMessageSettings', getTransactionMessageSettings);

router.post('/addPrintSettings', sequentialMiddleware, addPrintSettings);
router.get('/getPrintSettings', getPrintSettings);
router.get('/getThermalPrintSettings', getThermalPrintSettings);

module.exports = router;