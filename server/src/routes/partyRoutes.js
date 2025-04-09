const express = require('express');
const router = express.Router();
const {addParties, getParties, partyStatement, editParty, deleteParty, verifyPartyName} = require('../controllers/partyController');
const { protect } = require("../middlewares/AuthMiddleware");

router.post('/addParty', addParties);
router.post('/verifyPartyName', verifyPartyName);
router.put('/editParty', editParty);
router.delete('/deleteParty', deleteParty);
router.get('/getParties', getParties);
router.get('/partyStatement', partyStatement);

module.exports = router;