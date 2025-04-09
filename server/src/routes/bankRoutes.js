const express = require('express');
const router = express.Router();
const {addBank, getAllBank} = require('../controllers/bankController');

router.post("/addBank", addBank);
router.get("/getAllBank", getAllBank);

module.exports = router;